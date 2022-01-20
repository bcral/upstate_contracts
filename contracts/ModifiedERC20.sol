//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ModifiedERC20 is Ownable, AccessControl, ERC20("Upstate_Interactive test coin", "TEST") {

    // Start and end times as outlined in the challenge doc.
    uint256 _startTime;
    uint256 _endTime;
    address contributions;

    // Event for transfers
    event ERC20Transfer(address from, address to, uint256 amount);

    constructor(uint256 startTime, uint256 endTime) {
        _startTime = startTime;
        _endTime = endTime;
    }

    // ***************
    // Modifiers

    modifier onlyIfTime() {
        // Check that the current time is after _startTime and before _endTime
        require(block.number >= _startTime && block.number <= _endTime, "Current time does not fall within defined start/end parameters.");
        _;
    }

    modifier onlyCont() {
        require(msg.sender == contributions, "Only the 'Contributions' contract can call this.");
        _;
    }

    // ***************
    // Mutating Functions

    // Give the Contributions contract exclusive access to mint
    function addCont(address _cont) external onlyOwner {
        contributions = _cont;
    }

    // Override transfer function with modifier to check that the time fits into the
    // provided parameters.  Returns the result of the underlying ERC20 function
    function transfer(
        address recipient, 
        uint256 amount
    ) public virtual override onlyIfTime returns(bool res) {
        res = super.transfer(recipient, amount);

        emit ERC20Transfer(msg.sender, recipient, amount);
    }

    // Override transferFrom function with modifier to check that the time fits into
    // the provided parameters.  Returns the result of the underlying ERC20 function
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override onlyIfTime returns(bool res) {
        res = super.transferFrom(sender, recipient, amount);

        emit ERC20Transfer(sender, recipient, amount);
    }

    // Mint function - restricted to only the Contributions contract
    function mint(address to, uint256 amount) external onlyCont returns(bool) {
        _mint(to, amount);
        return true;
    }

}
