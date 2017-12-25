# ethe-policy-dapp
Demo of Insurance Policy workflow, based on Ethereum smart contracts

# Prerequisites

Tested on:
* NodeJs v8.2.0
* Geth 1.6.7-stable

# Overview
This sample application demonstrates ability to purchase Insurance Policy from Agent by Customer, accept payments and bill by Claim.

On high level architecture is following:
Agent proposes Policy for customer by deploying Policy smart contract into network. Customer Accepts proposed policy and pays. After payment, Policy became Active. Payment forwards by Policy contract to the consolidated account (i.e. to the 'main' company). Also there is Claim Oracle, deployed in network. And when customer (Insured) reports Claim, Claim Oracle confirms/declines it (and Policy contract can make payment to the customer's account (Insured)).

# Project structure
Project tested in private Ethereum network, but should work in public. There are 3 main parts of the project

## Ethereum private network
After source downloading need to set up private Ethereum network. In this project required 1 miner node and 3 'client' nodes.

## Claim Oracle smart contracts and Oracle service
There are 2 Oracle contracts:

* claimdispatch.sol - dispatcher of requests between smart contracts and oracle service
* claimoraclelookup.sol - lookup contract needed to link dispatcher with client contracts (i.e. in this case - Policy contracts)

When Insured reports Claim (invoke reportClaim() method in Policy contract), Policy contract queries ClaimOracleLookup contract to get actual address of the ClaimOracleDispatch contract. Using this approach is possible to upgrade ClaimOracleDispatch without upgrading all related Policy contracts.
Also there is claimservice.js services that listens events from ClaimOracleDispatch and response. I.e. when Insured reports Claim, claimservice.js receives event and responds by invoking __claimOracleCallback() callback method from Policy contract

# Setup and Run

## Network setup
* Download project
* Run from root

> ./bin/init

Init script will create required folders for the miner node and 3 other nodes (Agent's node, Insured's node and Provider (company)'s node)

> ./bin/mine
This script will start miner node and boot node as at least one need to be in the network

Open 3 more terminal windows and run
> ./bin/console01
> ./bin/console02
> ./bin/console03

accordingly. There 3 nodes for:
* Agent
* Insured
* Company

After that you should able to see connected peers in each of them:

> admin.peers

## Deploy

Open terminal in ./app directory and run:

> ./prepare

This script creates required ./target directory where all runtime files will be stored and installs additional NodeJs modules

Then compile Claim Oracle contracts:

>./makeoracle

and deploy them to the network:

> node ./target/oracle.js

At this point need to start claims service that should confirm Claims reported:

>node ./target/claimservice.js

## Demo

Demoscript should be run from ./app direcory. Firstly, compile Policy contract:

> ./make

And finally, start demo:

> node ./target/demo.js
