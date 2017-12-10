var async = require('async');
var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var fs = require('fs');
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

			//console.log("Config:" + agent01);

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
		function(config, policyBin, policyAbi, callbackFunct1){
			// Interface of Agent 01
			var web3Agent01 = new Web3(
			    new Web3.providers.HttpProvider('http://localhost:8501')
			);

			console.log("Step 01: Agent 01 propouses Contract for Insured 01");
			
			// must unlock the account we are creating the contract from so we can spend its ether
			web3Agent01.personal.unlockAccount(config.agents.agent_01.account, config.agents.agent_01.password);

			var policyContractObj = web3Agent01.eth.contract(policyAbi);
			
			var policy = policyContractObj.new(
			   {
			     from: config.agents.agent_01.account,
			     data: '0x'+policyBin,
			     gas: '4700000'
			   }, function (err, contract){
			   	if (err) throw err;

			   	if (typeof contract.address !== 'undefined') {
			       console.log('Policy contract mined wiht address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			       callbackFunct1(err, config, contract);  
			    }
			 });
		},
		function(config, contract, callback){
			console.log("Step 01: Policy propoused");	

			console.log(config.company.consolidatedAccount.account);
			var result = contract.initPolicy(config.insureds.insured_01.account, config.company.consolidatedAccount.account);
			console.log(result) 
		}
	],
	function(err, file) {}
);
var txutils = lightwallet.txutils;

//console.log("Step 02: Insured 01 accepts Contract ");

//console.log("Step 03: Insured 01 pays for Premium and Contract became Active");

//console.log("Step 04: Insured 01 makes Claim");

//console.log("Step 05: Claim Oracle confirms Claim and comapy pays Insured 01");