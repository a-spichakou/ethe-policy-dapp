var fs = require("fs");
const replace = require("replace-in-file");
var async = require("async");

var helpers = require("./helpers");
var createKeccakHash = require('keccak')

//---------------------------------------------------
async.waterfall([
	function(callback) {
		helpers.loadOracleContractsDetails(callback);
	},
	function(claimOracleData, callback) {
		fs.writeFileSync(
			"./src/claimapi.sol",
			fs.readFileSync("./src/claimapi.sol.tpl")
		);
		callback(null, claimOracleData);
	},
	function(claimOracleData, callback) {
		const options = {
			files: "./src/claimapi.sol",
			from: "0x000000000000000000",
			to: toChecksumAddress(claimOracleData.claimOracleLookupContract)
		};

		try {
			const changes = replace.sync(options);
			console.log("Modified files:", changes.join(", "));
		} catch (error) {
			console.error("Error occurred:", error);
		}
	}
]);

function toChecksumAddress (address) {
  address = address.toLowerCase().replace('0x', '')
  var hash = createKeccakHash('keccak256').update(address).digest('hex')
  var ret = '0x'

  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }

  return ret;
}