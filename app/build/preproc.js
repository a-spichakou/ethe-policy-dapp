var fs = require("fs");
const replace = require("replace-in-file");
var async = require("async");

var helpers = require("./helpers");

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
			to: claimOracleData.claimOracleLookupContract
		};

		try {
			const changes = replace.sync(options);
			console.log("Modified files:", changes.join(", "));
		} catch (error) {
			console.error("Error occurred:", error);
		}
	}
]);