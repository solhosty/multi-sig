// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MultiSigWallet {
    error NotOwner();
    error OnlySelf();
    error InvalidThreshold();
    error InvalidOwner();
    error OwnerExists();
    error TxDoesNotExist();
    error AlreadySigned();
    error AlreadyExecuted();
    error NotEnoughSignatures();
    error ExecutionFailed();

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 signatureCount;
        uint256 configVersion;
    }

    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event TransactionSubmitted(
        uint256 indexed txId,
        address indexed owner,
        address indexed to,
        uint256 value,
        bytes data
    );
    event TransactionSigned(uint256 indexed txId, address indexed owner, uint256 signatures);
    event TransactionExecuted(uint256 indexed txId, address indexed owner);
    event OwnerAdded(address indexed newOwner);
    event OwnerRemoved(address indexed oldOwner);
    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);

    address[] private sOwners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;
    uint256 private sConfigVersion;

    Transaction[] private sTransactions;
    mapping(uint256 => mapping(address => uint256)) private sSignedAtVersion;

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    modifier onlySelf() {
        _onlySelf();
        _;
    }

    constructor(address[] memory owners_, uint256 threshold_) {
        _setOwners(owners_);
        _setThreshold(threshold_);
        sConfigVersion = 1;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (uint256 txId) {
        txId = sTransactions.length;
        sTransactions.push(
            Transaction({
                to: to,
                value: value,
                data: data,
                executed: false,
                signatureCount: 0,
                configVersion: sConfigVersion
            })
        );

        emit TransactionSubmitted(txId, msg.sender, to, value, data);
    }

    function signTransaction(uint256 txId) external onlyOwner {
        if (txId >= sTransactions.length) revert TxDoesNotExist();

        Transaction storage txn = sTransactions[txId];
        if (txn.executed) revert AlreadyExecuted();

        if (txn.configVersion != sConfigVersion) {
            txn.configVersion = sConfigVersion;
            txn.signatureCount = 0;
        }

        if (sSignedAtVersion[txId][msg.sender] == txn.configVersion) revert AlreadySigned();

        sSignedAtVersion[txId][msg.sender] = txn.configVersion;
        unchecked {
            txn.signatureCount += 1;
        }

        emit TransactionSigned(txId, msg.sender, txn.signatureCount);
    }

    function executeTransaction(uint256 txId) external onlyOwner {
        if (txId >= sTransactions.length) revert TxDoesNotExist();

        Transaction storage txn = sTransactions[txId];
        if (txn.executed) revert AlreadyExecuted();
        if (txn.configVersion != sConfigVersion) revert NotEnoughSignatures();
        if (txn.signatureCount < threshold) revert NotEnoughSignatures();

        txn.executed = true;
        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        if (!success) revert ExecutionFailed();

        emit TransactionExecuted(txId, msg.sender);
    }

    function addOwner(address newOwner) external onlySelf {
        if (newOwner == address(0)) revert InvalidOwner();
        if (isOwner[newOwner]) revert OwnerExists();

        isOwner[newOwner] = true;
        sOwners.push(newOwner);
        _bumpConfigVersion();

        emit OwnerAdded(newOwner);
    }

    function removeOwner(address oldOwner) external onlySelf {
        if (!isOwner[oldOwner]) revert InvalidOwner();

        isOwner[oldOwner] = false;
        uint256 length = sOwners.length;
        for (uint256 i = 0; i < length; i++) {
            if (sOwners[i] == oldOwner) {
                sOwners[i] = sOwners[length - 1];
                sOwners.pop();
                break;
            }
        }

        _bumpConfigVersion();

        if (threshold > sOwners.length) {
            uint256 oldThreshold = threshold;
            threshold = sOwners.length;
            emit ThresholdUpdated(oldThreshold, threshold);
        }

        emit OwnerRemoved(oldOwner);
    }

    function updateThreshold(uint256 newThreshold) external onlySelf {
        uint256 oldThreshold = threshold;
        _setThreshold(newThreshold);
        if (oldThreshold != threshold) {
            _bumpConfigVersion();
        }
        emit ThresholdUpdated(oldThreshold, threshold);
    }

    function getOwners() external view returns (address[] memory) {
        return sOwners;
    }

    function getTransactionCount() external view returns (uint256) {
        return sTransactions.length;
    }

    function getTransaction(
        uint256 txId
    )
        external
        view
        returns (address to, uint256 value, bytes memory data, bool executed, uint256 signatureCount)
    {
        if (txId >= sTransactions.length) revert TxDoesNotExist();
        Transaction storage txn = sTransactions[txId];
        return (txn.to, txn.value, txn.data, txn.executed, txn.signatureCount);
    }

    function hasSigned(uint256 txId, address owner) external view returns (bool) {
        if (txId >= sTransactions.length) revert TxDoesNotExist();
        return sSignedAtVersion[txId][owner] == sTransactions[txId].configVersion;
    }

    function _setOwners(address[] memory owners_) private {
        uint256 ownersLength = owners_.length;
        if (ownersLength == 0) revert InvalidOwner();

        for (uint256 i = 0; i < ownersLength; i++) {
            address owner = owners_[i];
            if (owner == address(0)) revert InvalidOwner();
            if (isOwner[owner]) revert OwnerExists();

            isOwner[owner] = true;
            sOwners.push(owner);
        }
    }

    function _setThreshold(uint256 threshold_) private {
        if (threshold_ == 0 || threshold_ > sOwners.length) revert InvalidThreshold();
        threshold = threshold_;
    }

    function _bumpConfigVersion() private {
        unchecked {
            sConfigVersion += 1;
        }
    }

    function _onlyOwner() internal view {
        if (!isOwner[msg.sender]) revert NotOwner();
    }

    function _onlySelf() internal view {
        if (msg.sender != address(this)) revert OnlySelf();
    }
}
