pragma solidity ^0.4.13;
//
// This is the API file to be included by a user of this oracle
//

// This must match the signature in claimdispatch.sol
contract ClaimOracle {
  function query(bytes _query) returns (uint256 id);
}

// This must match the signature in claimoralcelookup.sol
contract ClaimOracleLookup {
  function getQueryAddress() constant returns (address);
  function getResponseAddress() constant returns (address);
}

// The actual part to be included in a client contract
contract usingClaimOracle {
  address constant lookupContract = 0x272590c06b306e320a97c832dc35a4f5d772aa0c;
  event ClaimOracleLookedUp(address claimOracleAddress);

  modifier onlyFromClaimOracle {
    ClaimOracleLookup lookup = ClaimOracleLookup(lookupContract);
    assert(msg.sender == lookup.getResponseAddress());
    _;
  }

  function queryClaimOracle(bytes query) internal returns (uint256 id) {
    ClaimOracleLookup lookup = ClaimOracleLookup(lookupContract);
    ClaimOracle claimOracle = ClaimOracle(lookup.getQueryAddress());
    ClaimOracleLookedUp(lookup.getQueryAddress());
    return claimOracle.query(query);
   }
}