// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // Reentrancy vulnerability: state updated after external call
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        (bool success,) = msg.sender.call{ value: amount }("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount);
    }

    // Missing access control: anyone can drain
    function emergencyWithdraw(address to) external {
        uint256 balance = address(this).balance;
        (bool success,) = to.call{ value: balance }("");
        require(success, "Transfer failed");
    }

    // Unchecked return value pattern
    function forwardFunds(address payable target, uint256 amount) external {
        target.send(amount);
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
    }
}
