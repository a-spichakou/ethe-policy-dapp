#!/usr/bin/env node

var path = require('path');
var pkg = require( path.join(__dirname, 'package.json') );
var program = require('commander');

var rpc = require('json-rpc2');
var ABI = require('ethereumjs-abi');
var abi = new ABI();

program
    .version(pkg.version)
    .option('--rpchost <host>', 'RPC host to connect to')
    .option('--rpcport <port>', 'RPC port to connect to')
    .option('--interval <seconds>', 'Frequency of polling for incoming requests')
    .option('--dispatch <address>', 'Address of the dispatch contract. Listening to events from here.')
    .option('--sender <address>', 'Address of the sender account. Sending transactions from here.')
    .parse(process.argv);

if (program.dispatch === undefined) {
  console.error('Dispatch address is mandatory.');
  process.exit(1);
}

if (program.sender === undefined) {
  console.error('Sender account is mandatory.');
  process.exit(1);
}

if (program.rpchost === undefined) {
  program.rpchost = 'localhost';
}

var opts = {
  rpc_port: program.rpcport || 8545,
  rpc_host: program.rpchost,
  check_interval: (program.interval || 10) * 1000,
  dispatch_address: program.dispatch,
  sender_address: program.sender,
};

console.log('Connecting to ' + opts.rpc_host + ":" + opts.rpc_port);
console.log('Interval: ' + opts.check_interval);
console.log('Dispatch: ' + opts.dispatch_address);
console.log('Sender:   ' + opts.sender_address);

var client = rpc.Client.$create(opts.rpc_port, opts.rpc_host);

function pollForEvents(filterId) {
  client.call('eth_getFilterChanges', [
    filterId,
  ], function(err, result) {
    if (err) {
      console.error('Update failed: ' + err);
      return;
    }

    console.log(result.length + ' request(s)');

    for (var i in result) {
      var event = result[i];

      // Parse events here and issue a response
      console.log(event);

      // Just a safety check
      if (event.address !== opts.dispatch_address) {
        console.error('Event from invalid address: ' + event.address);
        continue;
      }

      // Look for our event
      if (event.topics[0] !== ('0x' + abi.common.eventID('Incoming', [ 'uint256', 'address', 'bytes' ]).toString('hex'))) {
        continue; // Not ours
      }

      // Parse non-indexed event arguments
      var data = abi.rawDecode(null, null, [ 'uint256', 'address', 'bytes' ], new Buffer(event.data.slice(2), 'hex'));

      var queryId = data[0];
      var sender = '0x' + data[1].toString('hex');
      var query = data[2];
      var response = query; // FIXME: do something fancy here :)

      console.log('Incoming request: ' + queryId.toString('hex'));
      console.log('  From: ' + sender);
      console.log('  Query: ' + query);
      console.log('  Response: ' + response);

      client.call('eth_sendTransaction', [{
        from: opts.sender_address,
        to: sender,
        data: abi.rawEncode('__tinyOracleCallback', [ 'uint256', 'bytes' ], [ queryId, response ]).toString('hex'),
      }], function(err, result) {
        if (err) {
          console.error('Sending response failed: ' + err);
          return;
        }
      });
    }
  });
}

var eventId;

client.call('eth_newFilter', [{
    address: opts.dispatch_address
}], function(err, result) {
  if (err)
    throw err;

  eventId = result;
  setInterval(pollForEvents, opts.check_interval, result);
});

var intCounter = 0;

process.on('SIGINT', function() {
    intCounter++;
    console.log('Interrupt ' + (3 - intCounter) +' more times to forcefully quit.');

    if (intCounter > 3) {
      process.exit();
    }

    if ((intCounter === 1) && (eventId !== undefined)) {
      console.log('Cleaning up. Removing filter.');

      client.call('eth_uninstallFilter', [{
        eventId
      }], function(err, result) {
        //client.stop(); FIXME: there is no such thing?

        process.exit();
      });
    }
});