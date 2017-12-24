var async = require('async');
var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var fs = require('fs');
var sleep = require('sleep');

// Interface of Agent 01
var web3Company = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8503')
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
			//console.log("Init ClaimOracleLookup with Claim Oracle account: " + JSON.stringify(config.claimOracle[0].claimOracleAccount.account));
			callback(null, config);
		},
		function(config, callback){
			fs.readFile( __dirname + '/sol/ClaimOracleDispatch.bin', 'utf8', function (err, data) {
				if (err) throw err;
				callback(err, config, data);
			});
		},
		function(config, data, callback) {
			var claimOracleDispatchBin = data;
		
			callback(null, config, claimOracleDispatchBin);
		},
		function(config, claimOracleDispatchBin, callback){
			fs.readFile( __dirname + '/sol/ClaimOracleDispatch.abi', 'utf8', function (err, data) {
				if (err) throw err;
				callback(err, config, claimOracleDispatchBin, data);
			});
		},
		function(config, claimOracleDispatchBin, data, callback) {
			var claimOracleDispatchAbi = JSON.parse(data);
			
			callback(null, config, claimOracleDispatchBin, claimOracleDispatchAbi);
		},
		function(config, claimOracleDispatchBin, claimOracleDispatchAbi, callback){


			console.log("ClaimOracleDispatch contract deploing");
			
			// must unlock the account we are creating the contract from so we can spend its ether
			web3Company.personal.unlockAccount(config.company.consolidatedAccount.account, config.company.consolidatedAccount.password);

			var claimOracleDispatchObj = web3Company.eth.contract(claimOracleDispatchAbi);
			
			var claimOracleDispatch = claimOracleDispatchObj.new(
			   {
			     from: config.company.consolidatedAccount.account,
			     data: '0x'+claimOracleDispatchBin,
			     gas: '4700000'
			   }, function (err, contract){
			   	if (err) throw err;

			   	if (typeof contract.address !== 'undefined') {
			       console.log('ClaimOracleDispatch mined with address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			       callback(null, config, contract);  
			    }
			 });
		},
		function(config, claimOracleDispatchContract, callback){
			fs.readFile( __dirname + '/sol/ClaimOracleLookup.bin', 'utf8', function (err, data) {
				if (err) throw err;
				callback(err, config, data, claimOracleDispatchContract);
			});
		},
		function(config, data, claimOracleDispatchContract, callback) {
			var claimOracleLookupBin = data;
		
			callback(null, config, claimOracleLookupBin, claimOracleDispatchContract);
		},
		function(config, claimOracleLookupBin, claimOracleDispatchContract, callback){
			fs.readFile( __dirname + '/sol/ClaimOracleLookup.abi', 'utf8', function (err, data) {
				if (err) throw err;
				callback(err, config, claimOracleLookupBin, data, claimOracleDispatchContract);
			});
		},
		function(config, claimOracleLookupBin, data, claimOracleDispatchContract, callback) {
			var claimOracleLookupAbi = JSON.parse(data);
			
			callback(null, config, claimOracleLookupBin, claimOracleLookupAbi, claimOracleDispatchContract);
		},
		function(config, claimOracleLookupBin, claimOracleLookupAbi, claimOracleDispatchContract, callback){


			console.log("ClaimOracleLookup contract deploing");
			
			// must unlock the account we are creating the contract from so we can spend its ether
			web3Company.personal.unlockAccount(config.company.consolidatedAccount.account, config.company.consolidatedAccount.password);

			var claimOracleLookupObj = web3Company.eth.contract(claimOracleLookupAbi);
			
			var claimOracleLookup = claimOracleLookupObj.new(
			   {
			     from: config.company.consolidatedAccount.account,
			     data: '0x'+claimOracleLookupBin,
			     gas: '4700000'
			   }, function (err, contract){
			   	if (err) throw err;

			   	if (typeof contract.address !== 'undefined') {
			       console.log('ClaimOracleLookup mined with address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			       callback(err, config, claimOracleDispatchContract, contract);  
			    }
			 });
		},

		//////////////////
		function(config, claimOracleDispatchContract, claimOracleLookupContract, callback){

			var result = claimOracleLookupContract.init(
				claimOracleDispatchContract.address,
				config.claimOracle.claimOracleAccount.account, {from: config.company.consolidatedAccount.account, gas: '4700000'},
				function(err, data) {
					if (err) throw err;

					console.log("Init ClaimOracleLookup with Claim Oracle account: " + config.claimOracle.claimOracleAccount.account);
					callback(err, config, claimOracleDispatchContract, claimOracleLookupContract);
				}
			);
		},
		function(config, claimOracleDispatchContract, claimOracleLookupContract, callback){
			var propouseEvent = claimOracleLookupContract.Init({},
				function(err, data){
					if (err) throw err;

					console.log("Recived Init event");
					callback(err, config, claimOracleDispatchContract, claimOracleLookupContract);
				});
		},
		function (config, claimOracleDispatchContract, claimOracleLookupContract, callback){
			let events = claimOracleDispatchContract.allEvents({fromBlock: 0, toBlock: 'latest'})
			events.get(function(err, data){
				console.log(data)
				callback(null, config, claimOracleDispatchContract, claimOracleLookupContract);
			});
		},
		function (config, claimOracleDispatchContract, claimOracleLookupContract, callback){
			let events = claimOracleLookupContract.allEvents({fromBlock: 0, toBlock: 'latest'})
			events.get(function(err, data){
				console.log(data)
				callback(null, config, claimOracleDispatchContract, claimOracleLookupContract);
			});
		},
		function(config, claimOracleDispatchContract, claimOracleLookupContract, callback){
			fs.writeFile(__dirname + "/.claimOracleLookupContract.json", "{\"claimOracleLookupContract\": \""+claimOracleLookupContract.address+"\"}", function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file with claimOracleLookupContract saved to: " + __dirname + "/.claimOracleLookupContract.json");
			}); 
		}
	],
	function(err, file) {}
);
