var async = require('async');
var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var fs = require('fs');
var sleep = require('sleep');

// Interface of Agent 01
var web3Agent01 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8501')
);

var web3Insured01 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8502')
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


			console.log("Step 01: Policy contract deploing");
			
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
			       console.log('Step 01: Policy contract mined with address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			       callback(err, config, contract);  
			    }
			 });
		},
		function(config, contract, callback){
			fs.readFile( __dirname + "/.claimOracleLookupContract.json", 'utf8', function (err, data) {
				if (err) throw err;
				callback(err, config, contract, data);
			});
		},
		function(config, contract, data, callback) {
			var claimOracleData = JSON.parse(data);
			console.log("Step 01: Claim Oracle data:" + data);

			callback(null, config, contract, claimOracleData);
		},
		function(config, contract, claimOracleData, callback){

			var result = contract.initPolicy(
				config.insureds.insured_01.account,
				config.company.consolidatedAccount.account,  
				1, 
				config.claimOracle.claimOracleAccount.account,
				{from: config.agents.agent_01.account, gas: '4700000'},
				function(err, data) {
					if (err) throw err;

					console.log("Step 01: Policy contract initialized with addresses of Insured 01 and Company addresses transactionHash: " + data);
					callback(err, config, contract);
				}
			);
		},
		function(config, contract, callback){

			var result = contract.propouse({from: config.agents.agent_01.account},
				function(err, data) {
					if (err) throw err;

					console.log("Step 01: Propouse policy");
					callback(err, config, contract);
				}
			);

		},
		function(config, contract, callback){
			var event = contract.Propouse({},
				function(err, data){
					if (err) throw err;

					console.log("Step 01: Recived Propouse event");
					callback(err, config, contract);
				});
		},
		function(config, contract, callback){

			var insuredContract = web3Insured01.eth.contract(contract.abi).at(contract.address);
			web3Insured01.personal.unlockAccount(config.insureds.insured_01.account, config.insureds.insured_01.password);

			var result = insuredContract.accept({from: config.insureds.insured_01.account},
				function(err, data) {
					if (err) throw err;

					console.log("Step 02: Insured 01 accepts Contract");
					callback(err, config, contract, insuredContract);
				}
			);
		},
		function(config, contract, insuredContract, callback){
			var event = contract.Accept({},
				function(err, data){
					if (err) throw err;

					console.log("Step 02: Recived Accept event");
					callback(err, config, contract, insuredContract);
				});
		},
		function(config, contract, insuredContract, callback){
			var event = insuredContract.purchase({from: config.insureds.insured_01.account, value: 1},
				function(err, data) {
					if (err) throw err;

					console.log("Step 03: Insured 01 pays for Premium and Contract became Active transactionHash: " + data);
					callback(err, config, contract, insuredContract);
				}
			);
		},
		function(config, contract, insuredContract, callback){
			var event = contract.Purchase({},
				function(err, data){
					if (err) throw err;

					console.log("Step 03: Recived Purchase event");
					callback(err, config, contract, insuredContract);
				});
		},
		function(config, contract, insuredContract, callback){
			var event = insuredContract.reportClaim('Claim 1 Report',
				{from: config.insureds.insured_01.account, gas: '4700000'},
				function(err, data) {
					if (err) throw err;

					console.log("Step 04: Insured 01 report Claim: " + data);
					callback(err, config, contract, insuredContract);
				}
			);
		},
		function(config, contract, insuredContract, callback){
			var event = contract.ClaimReported({},
				function(err, data){
					if (err) throw err;

					console.log("Step 04: Recived Claim reported event");
					callback(err, config, contract, insuredContract);
				});
		},
		function(config, contract, insuredContract, callback){
			var event = contract.EventFromClaimOracle({},
				function(err, data){
					if (err) throw err;

					console.log("Step 04: Recived EventFromClaimOracle");
					callback(err, config, contract, insuredContract);
				});
		},
		function(config, contract, insuredContract, callback){
			let events = contract.allEvents({fromBlock: 0, toBlock: 'latest'})
			events.get(function(err, data){
				console.log(data)
				callback(null, null);
			});
		}
	],
	function(err, file) {}
);

//console.log("Step 04: Insured 01 makes Claim");

//console.log("Step 05: Claim Oracle confirms Claim and comapy pays Insured 01");
