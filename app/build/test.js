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

			console.log("Contract address used: "+process.argv[2]);
			var contract = web3Agent01.eth.contract(policyAbi).at(process.argv[2]);
			callback(null, config, contract);
			
		},function(config, contract, callback){

			var gasRequired = contract.reportClaim.estimateGas('Claim 1 Report',
				{from: config.agents.agent_01.account}
				);
			console.log(gasRequired);

			var event = contract.reportClaim('Claim 1 Report',
				{from: config.agents.agent_01.account, gas: '9900000'},
				function(err, data) {
					if (err) throw err;

					console.log("Step 04: Insured 01 report Claim: " + data);
					callback(err, config, contract);
				}
			);
		},
		function(config, contract, callback){
			printAllEvents(config, contract, callback);
		}
	],
	function(err, file) {}
);

function printAllEvents(config, contract, callback){
	console.log("Reading from block: " + process.argv[3]);

	let events = contract.allEvents({fromBlock: process.argv[3], toBlock: 'latest'})
	events.get(function(err, data){
		console.log(data);
		/*console.log(data[0].args.avaliable.toNumber());
		console.log(data[0].args.required.toNumber());
		console.log(data[0].args.agent.toNumber());*/

		callback(null, config, contract);
	});
}