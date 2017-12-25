var async = require('async');
var Web3 = require('web3');
var fs = require('fs');

// Interface of Agent 01
var web3 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8503')
);
var helpers = require("./helpers");

//--------------------------
async.waterfall(
	[
		function(callback) {
		      helpers.loadConfig(callback);
		    },
		    function(config, callback) {
		      web3.personal.unlockAccount(
		        config.company.consolidatedAccount.account,
		        config.company.consolidatedAccount.password
		      );

		      callback(null, config);
		    },
		    function(config, callback) {
				helpers.deployContract(
					"ClaimOracleDispatch",
					config.company.consolidatedAccount.account,
					web3,
					function(err, claimOracleDispatchContract) {
						callback(null, config, claimOracleDispatchContract);
					}
				);
		    },
		    function(config, claimOracleDispatchContract, callback){
				helpers.deployContract(
					"ClaimOracleLookup",
					config.company.consolidatedAccount.account,
					web3,
					function(err, claimOracleLookupContract) {
						callback(null, config, claimOracleDispatchContract, claimOracleLookupContract);
					}
				);
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
			fs.writeFile(__dirname + "/.claimOracleLookupContract.json", 
				"{\"claimOracleLookupContract\": \""+claimOracleLookupContract.address+"\",\"claimOracleDispatchContract\": \""+claimOracleDispatchContract.address+"\"}"
				, function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file with claimOracleLookupContract saved to: " + __dirname + "/.claimOracleLookupContract.json");
			    callback(null);
			}); 
		}
	],
	function(err, file) {
		process.exit();
	}
);
