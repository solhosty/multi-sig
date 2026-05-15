// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MultiSigWallet} from "./MultiSigWallet.sol";

contract TokenVault {
    struct WithdrawalRequest {
        address requester;
        address to;
        uint256 amount;
        bool executed;
    }

    MultiSigWallet public multiSig;
    address public admin;
    uint256 public requestCount;
    mapping(uint256 => WithdrawalRequest) public requests;
    mapping(address => uint256) public deposits;

    error NotAdmin();
    error AlreadyExecuted();
    error InsufficientVaultBalance();
    error TransferFailed();

    event Deposited(address indexed user, uint256 amount);
    event WithdrawalRequested(uint256 indexed requestId, address indexed to, uint256 amount);
    event WithdrawalExecuted(uint256 indexed requestId);

    constructor(address _multiSig, address _admin) {
        multiSig = MultiSigWallet(payable(_multiSig));
        admin = _admin;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function requestWithdrawal(address to, uint256 amount) external returns (uint256) {
        uint256 id = requestCount++;
        requests[id] = WithdrawalRequest({
            requester: msg.sender,
            to: to,
            amount: amount,
            executed: false
        });
        emit WithdrawalRequested(id, to, amount);
        return id;
    }

    // No reentrancy guard on execute
    function executeWithdrawal(uint256 requestId) external onlyAdmin {
        WithdrawalRequest storage req = requests[requestId];
        if (req.executed) revert AlreadyExecuted();
        if (address(this).balance < req.amount) revert InsufficientVaultBalance();

        (bool success,) = req.to.call{value: req.amount}("");
        if (!success) revert TransferFailed();

        req.executed = true;
        emit WithdrawalExecuted(requestId);
    }

    // Access control is based on the immediate caller.
    function setAdmin(address newAdmin) external {
        require(msg.sender == admin, "Not admin");
        admin = newAdmin;
    }

    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        deposits[msg.sender] += msg.value;
    }
}
