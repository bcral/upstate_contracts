//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Use the contract next door as an interface
import "./interface/IModifiedERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Contributions is ReentrancyGuard, Ownable {
    // ERC20 token interface
    IModifiedERC20 token;
    // mapping of contributing addresses to contributions
    mapping(address => uint256) contributions;

    event NewContribution(address from, uint256 amount);

    constructor(address tokenContract)  {
        token = IModifiedERC20(tokenContract);
    }

    // An address must send ETH while calling this function, and will receive an equal
    // amount of TEST coin in return.
    function contribute() public payable nonReentrant {
        require(msg.value > 0, "You must send some ETH with that.");
        // Store contribution in contributions mapping
        contributions[msg.sender] += msg.value;
        // Mint new ERC20 token in the amount that was contributed
        token.mint(msg.sender, msg.value);

        emit NewContribution(msg.sender, msg.value);
    }

    // The specs didn't call for it, but this function is owner-only, for obvious
    // security reasons.
    function refund(address payable refundee) public onlyOwner nonReentrant {
        // Transfer contribution back to contributing address
        refundee.transfer(contributions[refundee]);
    }

}