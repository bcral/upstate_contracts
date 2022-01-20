# Instructions to run:

init: npm install
test: npm test

# ERC20 with modifications:

● Develop a token contract that inherits from OpenZeppelin’s ERC20 base contract and extends its functionality so that tokens can only be transferred after a particular `_startTime` and before a particular `_endTime` that are provided in the constructor. 

● Develop corresponding unit tests to account for the `_startTime` and `_endTime` constraints.

 <!-- *********

 I'm using "blocks" instead of "time" for this, but time could be taken from either a miner(if accuracy and security aren't critical) or an oracle if a time is truly needed.  This check would be performed the same way for time. -->

# Contribution contract:

● Implement a `Contribution` contract that users can donate ETH to. In return for their ETH-based contributions, your `Contribution` contract should issue them tokens from your token contract in return. ● Your `Contribution` contract should store the addresses of users that donate as well as the amount of ETH they’ve donated. 

● Develop a function in your `Contribution` contract that will accept a wallet address and return the amount of ETH that a wallet address has contributed to the `Contribution` contract. 

 <!-- For clarity: this is the "refund" function. -->

● Develop unit tests for the `Contribution` contract. 
