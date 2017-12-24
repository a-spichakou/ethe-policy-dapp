pragma solidity ^0.4.13;


import "./claimapi.sol";

contract Policy is usingClaimOracle {
	address agent;
	address insured;

	address company;

	string status;

	uint premium;

	bytes public response;

    modifier onlyAgent() {
    	assert(msg.sender == agent);
    	_; // Will be replaced with function body
	}
	modifier onlyInsured() {
		assert(msg.sender == insured);
    	_; // Will be replaced with function body
	}
	modifier onlyCompany() {
		assert(msg.sender == company);
    	_; // Will be replaced with function body
	}

	event Purchase(address from, uint required, uint recived);
	event Init(address insuredVal, address companyVal, uint premiumVal);
	event Propouse();
	event Accept();
	event ClaimReported(bytes claimData);
	event EventFromClaimOracle(bytes _response);

    function Policy() {
        agent = msg.sender;    
    }

    function initPolicy (address insuredVal, address companyVal, uint premiumVal) onlyAgent() {
	    
	    insured = insuredVal;
	    company = companyVal;
	    premium = premiumVal;
	    
	    Init(insuredVal, companyVal, premiumVal);
	}

	function propouse () onlyAgent() {
	    status = 'Policy propoused';
	    Propouse();
	}

	function accept() onlyInsured(){
		status = 'Policy accepted';
		Accept();
	}

	function purchase() onlyInsured() payable {
	
		company.transfer(msg.value);
             
	    status = 'Policy active';
		Purchase(msg.sender, premium, msg.value);
	}

	function reportClaim(string claimData){
		ClaimReported(bytes(claimData));
		queryClaimOracle(bytes(claimData));
	}

	function __claimOracleCallback(uint256 id, bytes _response) onlyFromClaimOracle external {
    	response = _response;
    	EventFromClaimOracle(response);
  	}

	function getInsured() onlyAgent() constant returns (address) {
		return insured;
	}

	function getAgent() onlyInsured() constant returns (address) {
		return agent;
	}
	
	function getStatus() constant returns (string) {
		return status;
	}
}
