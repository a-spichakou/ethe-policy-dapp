var fs = require("fs");
const replace = require("replace-in-file");
var async = require("async");

async.waterfall([
	function(callback) {
		fs.readFile(
			__dirname + "/.claimOracleLookupContract.json",
			"utf8",
			function(err, data) {
				if (err) throw err;
				callback(err, data);
			}
		);
	},
	function(data, callback) {
		var claimOracleData = JSON.parse(data);
		console.log("Step 01: Claim Oracle data:" + data);

		callback(null, claimOracleData);
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