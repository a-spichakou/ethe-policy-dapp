var async = require("async");
var Web3 = require("web3");
var util = require("ethereumjs-util");
var tx = require("ethereumjs-tx");
var lightwallet = require("eth-lightwallet");
var fs = require("fs");

// Interface of Agent 01
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8501"));

var helpers = require("./helpers");

//--------------------------
async.waterfall(
	[
		function(callback) {
			helpers.loadConfig(callback);
		},
		function(config, callback) {
			web3.personal.unlockAccount(
				config.insureds.insured_01.account,
				config.insureds.insured_01.password
			);

			helpers.loadOracleContractsDetails(function(err, claimOracleData) {
				callback(null, config, claimOracleData);
			});
		},
		function(config, claimOracleData, callback) {
			helpers.loadContract(
				"Policy",
				//claimOracleData.claimOracleDispatchContract,
				'0xe6113425f5bfad9131798f790abc84ee099066d7',
				web3,
				function(err, contract) {
					callback(null, config, contract);
				}
			);
		},
		function(config, contract, callback) {
			var event = contract.reportClaim(
				"Claim 1 Report",
				{ from: config.insureds.insured_01.account, gas: "83698" },
				function(err, data) {
					if (err) throw err;

					console.log("Insured 01 report Claim: " + data);
					callback(err, config, contract);
				}
			);
		}
	],
	function(err, file) {}
);