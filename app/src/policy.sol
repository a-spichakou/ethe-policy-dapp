pragma solidity ^0.4.8;

contract Policy {
	address agent;
	address insured;

	address company;

	string status;

    modifier onlyAgent() {
    	if (msg.sender != agent) { throw; }
    	_; // Will be replaced with function body
	}
	modifier onlyInsured() {
    	if (msg.sender != agent) { throw; }
    	_; // Will be replaced with function body
	}
	modifier onlyCompany() {
    	if (msg.sender != agent) { throw; }
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
	
}
