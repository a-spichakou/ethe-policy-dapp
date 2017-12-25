var async = require("async");
var fs = require("fs");

var CONFIGPATH="/config.json";

module.exports = {
  loadContract: function(contractName, contractAddress, web3, outCallback) {
    loadContract(
      CONFIGPATH,
      contractName,
      contractAddress,
      web3,
      outCallback
    );
  },
  loadOracleContractsDetails: function(callback) {
    loadJSONFromFile("/.claimOracleLookupContract.json", callback);
  },
  loadConfig: function(callback){
    loadJSONFromFile(CONFIGPATH, callback);
  },
  deployContract: function(contractName, account, web3, callback){
    deployContract(contractName, account, web3, callback);
  }
};

function deployContract(contractName, account, web3, outCallback) {
  async.waterfall(
    [
      function(callback) {
        fs.readFile(
          __dirname + "/sol/" + contractName + ".bin",
          "utf8",
          function(err, bin) {
            if (err) throw err;

            console.log("BIN file for contract " + contractName + " loaded");
            callback(null, bin);
          }
        );
      },
      function(bin, callback) {
        loadJSONFromFile("/sol/" + contractName + ".abi", function(err, abi) {
          callback(null, bin, abi);
        });
      },
      function(bin, abi, callback) {
        console.log("Contract " + contractName + " deploing");
        var contractObj = web3.eth.contract(abi);

        var newContract = contractObj.new(
          {
            from: account,
            data: "0x" + bin,
            gas: "4700000"
          },
          function(err, contract) {
            if (err) throw err;

            if (typeof contract.address !== "undefined") {
              console.log(
                "Contract " + contractName + " mined by address " + contract.address + " transactionHash: " + contract.transactionHash);
              callback(null, contract);
            }
          }
        );
      }
    ],
    outCallback
  );
}

function loadJSONFromFile(path, outCallback) {
  async.waterfall(
    [
      function(callback) {
        fs.readFile(__dirname + path, "utf8", function(err, data) {
          if (err) throw err;

          console.log("JSON file: " + path + " loaded");
          callback(err, data);
        });
      },
      function(data, callback) {
        var json = JSON.parse(data);
        callback(null, json);
      }
    ],
    outCallback
  );
}

function loadContract(
  configPath,
  contractName,
  contractAddress,
  web3,
  outCallback
) {
  async.waterfall(
    [
      function(callback) {
        loadJSONFromFile("/sol/" + contractName + ".abi", callback);
      },
      function(abi, callback) {
        var contract = web3.eth.contract(abi).at(contractAddress);
        console.log("Contract " + contractName + " by address " + contractAddress +" located");
        callback(null, contract);
      }
    ],
    outCallback
  );
}