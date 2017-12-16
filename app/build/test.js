var async = require('async');
var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var fs = require('fs');

// Interface of Agent 01
var web3Agent01 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8501')
);
//--------------------------
async.waterfall(
	[
		function(callback) {
			console.log("Loading config");
			fs.readFile(__dirname + "/config.json", "utf8", function(err,data) {
				if (err) throw err;
				callback(err, data);
			});
		},
		function(data, callback) {
			var config = JSON.parse(data);
			var agent01 = config.agents.agent_01;

			callback(null, config);
		},
		function(config, callback){
			fs.readFile( __dirname + '/sol/Policy.bin', 'utf8', function (err, data) {
				if (err) throw err;
				callback(err, config, data);
			});
		},
		function(config, data, callback) {
			var policyBin = data;
			//console.log("Policy Bin:" + policyBin);

			callback(null, config, policyBin);
		},
		function(config, policyBin, callback){
			fs.readFile( __dirname + '/sol/Policy.abi', 'utf8', function (err, data) {
				if (err) throw err;
				callback(err, config, policyBin, data);
			});
		},
		function(config, policyBin, data, callback) {
			var policyAbi = JSON.parse(data);
			//console.log("Policy Abi:" + policyAbi);

			callback(null, config, policyBin, policyAbi);
		},
		function(config, policyBin, policyAbi, callback){	
			// must unlock the account we are creating the contract from so we can spend its ether
			web3Agent01.personal.unlockAccount(config.agents.agent_01.account, config.agents.agent_01.password);

			var contract = web3Agent01.eth.contract(policyAbi).at('0xdbee0672b57dacc242fb15208ed5050326bff5d3');
			
			var result = contract.getInsured({from: config.agents.agent_01.account},
				function(err, data) {
					if (err) throw err;

					console.log("Step 01: Check status");
					console.log(data);
				}
			);
		}
	],
	function(err, file) {}
);
