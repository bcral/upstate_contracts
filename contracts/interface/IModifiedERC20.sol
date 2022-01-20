//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IModifiedERC20 {

    // Event for transfers
    event ERC20Transfer(address from, address to, uint256 amount);

    // override transfer function with modifier to check that the time fits into the
    // provided parameters.  Returns the result of the underlying ERC20 function
    function transfer(
        address recipient, 
        uint256 amount
        ) external returns(bool res);

    // override transferFrom function with modifier to check that the time fits into
    // the provided parameters.  Returns the result of the underlying ERC20 function
    function transferFrom(
        address sender,
        address recipient, 
        uint256 amount
        ) external returns(bool res);

    function mint(
        address to,
        uint256 amount
    ) external returns(bool);

}