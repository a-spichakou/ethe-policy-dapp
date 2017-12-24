pragma solidity ^0.4.13;
//
// The lookup contract for storing both the query and responder addresses
//

contract ClaimOracleLookup {
  address owner;
  address query;
  address response;

  event Init(address queryAddr, address responceAddr);
  event QueryAddressRequest(address queryAddr);

  modifier owneronly { 
    assert(msg.sender == owner);
    _;
  }

  function setOwner(address _owner) owneronly {
    owner = _owner;
  }

  function ClaimOracleLookup() {
    owner = msg.sender;
  }

  function init(address queryAddr, address responceAddr){
    setQueryAddress(queryAddr); 
    setResponseAddress(responceAddr);

    Init(queryAddr, responceAddr);
  }

  function setQueryAddress(address addr) owneronly {
    query = addr;
  }

  function getQueryAddress() constant returns (address) {
    QueryAddressRequest(query);
    return query;
  }

  function setResponseAddress(address addr) owneronly {
    response = addr;
  }

  function getResponseAddress() constant returns (address) {
    return response;
  }

  function kill() owneronly {
    suicide(msg.sender);
  }
}