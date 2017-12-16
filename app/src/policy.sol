pragma solidity ^0.4.8;

contract Policy {
	address agent;
	address insured;

	address company;

	string status;

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

    function Policy() {
        agent = msg.sender;    
    }

    function initPolicy (address insuredVal, address companyVal) onlyAgent() {
	    insured = insuredVal;
	    company = companyVal;
	}

	function propouse () onlyAgent() {
	    status = 'Policy propoused';
	}

	function accept() onlyInsured(){
		status = 'Policy accepted';
	}

	function purchase() onlyInsured(){
		status = 'Policy active';
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
