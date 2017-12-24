pragma solidity ^0.4.13;
//
// This is where the magic happens
//
// This contract will receive the actual query from the caller
// contract. Assign a unique (well, sort of) identifier to each
// incoming request, and emit an event our RPC client is listening
// for.
//

contract ClaimOracleDispatch {
  event Incoming(uint256 id, address recipient, bytes query);

  function query(bytes _query) external returns (uint256 id) {
    id = uint256(sha3(block.number, now, _query, msg.sender));
    Incoming(id, msg.sender, _query);
  }

  // The basic housekeeping

  address owner;

  modifier owneronly { 
    assert(msg.sender == owner);
    _;
  }

  function setOwner(address _owner) owneronly {
    owner = _owner;
  }

  function ClaimOracleDispatch() {
    owner = msg.sender;
  }

  function transfer(uint value) owneronly {
    transfer(msg.sender, value);
  }

  function transfer(address _to, uint value) owneronly {
    _to.send(value);
  }

  function kill() owneronly {
    suicide(msg.sender);
  }
}
