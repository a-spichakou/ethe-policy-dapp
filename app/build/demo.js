var async = require('async');
var Web3 = require('web3');
var fs = require('fs');
var sleep = require('sleep');

var web3Agent01 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8501')
);

var web3Insured01 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8502')
);
var helpers = require("./helpers");
//--------------------------
async.waterfall(
	[
		function(callback) {
			console.log("Loading config");
			helpers.loadConfig(callback);
		},
		function(config, callback){
			web3Agent01.personal.unlockAccount(config.agents.agent_01.account, config.agents.agent_01.password);
			web3Insured01.personal.unlockAccount(config.insureds.insured_01.account, config.insureds.insured_01.password);
			callback(null, config);
		},
		function(config, callback){
			console.log("Step 01---------------------------------------------------");
			helpers.deployContract(
					"Policy",
					config.agents.agent_01.account,
					web3Agent01,
					function(err, contract) {
						callback(null, config, contract);
					}
				);
		},
		function(config, contract, callback){
			var result = contract.initPolicy(
				config.insureds.insured_01.account,
				config.company.consolidatedAccount.account,  
				1, 
				{from: config.agents.agent_01.account, gas: '4700000'},
				function(err, data) {
					if (err) throw err;

					console.log("Policy contract initialized with addresses of Insured 01 and Company addresses transactionHash: " + data);
					callback(null, config, contract);
				}
			);
		},
		function(config, contract, callback){

			var result = contract.propouse({from: config.agents.agent_01.account},
				function(err, data) {
					if (err) throw err;

					console.log("Propouse policy");
					callback(null, config, contract);
				}
			);

		},
		function(config, contract, callback){
			var event = contract.Propouse({},
				function(err, data){
					if (err) throw err;

					console.log("Recived Propouse event");
					callback(null, config, contract);
				});
		},
		function(config, contract, callback){

			console.log("Step 02---------------------------------------------------");
			var insuredContract = web3Insured01.eth.contract(contract.abi).at(contract.address);
			web3Insured01.personal.unlockAccount(config.insureds.insured_01.account, config.insureds.insured_01.password);

			var result = insuredContract.accept({from: config.insureds.insured_01.account},
				function(err, data) {
					if (err) throw err;

					console.log("Insured 01 accepts Contract");
					callback(null, config, contract, insuredContract);
				}
			);
		},
		function(config, contract, insuredContract, callback){
			var event = contract.Accept({},
				function(err, data){
					if (err) throw err;

					console.log("Recived Accept event");
					callback(null, config, contract, insuredContract);
				});
		},
		function(config, contract, insuredContract, callback){
			console.log("Step 03---------------------------------------------------");
			var event = insuredContract.purchase({from: config.insureds.insured_01.account, value: 1},
				function(err, data) {
					if (err) throw err;

					console.log("Step 03: Insured 01 pays for Premium and Contract became Active transactionHash: " + data);
					callback(null, config, contract, insuredContract);
				}
			);
		},
		function(config, contract, insuredContract, callback){
			var event = contract.Purchase({},
				function(err, data){
					if (err) throw err;

					console.log("Recived Purchase event");
					callback(null, config, contract, insuredContract);
				});
		},
		function(config, contract, insuredContract, callback){
			console.log("Step 04---------------------------------------------------");
			var event = insuredContract.reportClaim('Claim 1 Report',
				{from: config.insureds.insured_01.account, gas: '4700000'},
				function(err, data) {
					if (err) throw err;

					console.log("Insured 01 report Claim: " + data);
					callback(err, config, contract, insuredContract);
				}
			);
		},
		function(config, contract, insuredContract, callback){
			var event = contract.ClaimReported({},
				function(err, data){
					if (err) throw err;

					console.log("Recived Claim reported event");
					callback(err, config, contract, insuredContract);
				});
		},
		function(config, contract, insuredContract, callback){
			var event = contract.EventFromClaimOracle({},
				function(err, data){
					if (err) throw err;

					console.log("Recived event from Claim Oracle");
					callback(err, config, contract, insuredContract);
				});
		}
	],
	function(err, file) {
		//callback(null);
	}
);
