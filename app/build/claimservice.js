var async = require("async");
var Web3 = require("web3");
var fs = require("fs");

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8503"));

var helpers = require("./helpers");
//--------------------------
async.waterfall(
  [
    function(callback) {
      helpers.loadConfig(callback);
    },
    function(config, callback) {
      web3.personal.unlockAccount(
        config.claimOracle.claimOracleAccount.account,
        config.claimOracle.claimOracleAccount.password
      );

      helpers.loadOracleContractsDetails(function(err, claimOracleData) {
        callback(null, config, claimOracleData);
      });
    },
    function(config, claimOracleData, callback) {
      helpers.loadContract(
        "ClaimOracleDispatch",
        claimOracleData.claimOracleDispatchContract,
        web3,
        function(err, contract) {
          callback(null, config, contract);
        }
      );
    },
    function(config, contract, callback) {
      processEvent(config, contract, callback);
      callback(null, contract);
    }
  ],
  function(err, file) {}
);

function processEvent(config, contract, callback) {
  var event = contract.Incoming({}).watch(function(err, data) {
    if (err) throw err;

    console.log("Recived Incoming:");
    console.log(data);

    async.waterfall(
      [
        function(callback) {
          helpers.loadContract("Policy", data.args.recipient, web3, callback);
        },
        function(contractToResponce) {
          var event = contractToResponce.__claimOracleCallback(
            0,
            "Claim 1 Report confirmed",
            {
              from: config.claimOracle.claimOracleAccount.account,
              gas: "4700000"
            },
            function(err, data) {
              if (err) throw err;

              console.log("Confirming Claim: " + data);
              //callback(null, contract);
            }
          );
        }
      ],
      function(err, data) {}
    );
  });
}