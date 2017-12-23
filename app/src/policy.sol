pragma solidity ^0.4.13;

contract Policy {
	address agent;
	address insured;

	address company;

	string status;

	uint premium;

	//mapping (address => uint) balances;

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
