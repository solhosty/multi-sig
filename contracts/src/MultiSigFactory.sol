// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MultiSigWallet} from "./MultiSigWallet.sol";

contract MultiSigFactory {
    error CreatorNotOwner();
    error AlreadyRegistered();
    error NotRegistered();
    error NotWalletOwner();

    event WalletCreated(
        address indexed creator,
        address indexed wallet,
        address[] owners,
        uint256 threshold
    );
    event OwnerRegistered(address indexed owner, address indexed wallet);
    event OwnerUnregistered(address indexed owner, address indexed wallet);

    address[] private sAllWallets;
    mapping(address => address[]) private sWalletsByCreator;
    mapping(address => address[]) private sWalletsByOwner;
    mapping(address => mapping(address => bool)) private sIsRegistered;

    function createWallet(
        address[] calldata owners,
        uint256 threshold
    ) external returns (address walletAddress) {
        bool creatorIsOwner;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == msg.sender) {
                creatorIsOwner = true;
                break;
            }
        }
        if (!creatorIsOwner) revert CreatorNotOwner();

        MultiSigWallet wallet = new MultiSigWallet(owners, threshold);
        walletAddress = address(wallet);

        sAllWallets.push(walletAddress);
        sWalletsByCreator[msg.sender].push(walletAddress);

        emit WalletCreated(msg.sender, walletAddress, owners, threshold);
    }

    function registerAsOwner(address walletAddress) external {
        if (sIsRegistered[msg.sender][walletAddress]) revert AlreadyRegistered();
        if (!MultiSigWallet(payable(walletAddress)).isOwner(msg.sender)) revert NotWalletOwner();

        sWalletsByOwner[msg.sender].push(walletAddress);
        sIsRegistered[msg.sender][walletAddress] = true;

        emit OwnerRegistered(msg.sender, walletAddress);
    }

    function unregisterAsOwner(address walletAddress) external {
        if (!sIsRegistered[msg.sender][walletAddress]) revert NotRegistered();

        address[] storage wallets = sWalletsByOwner[msg.sender];
        uint256 walletsLength = wallets.length;
        for (uint256 i = 0; i < walletsLength; i++) {
            if (wallets[i] == walletAddress) {
                wallets[i] = wallets[walletsLength - 1];
                wallets.pop();
                sIsRegistered[msg.sender][walletAddress] = false;

                emit OwnerUnregistered(msg.sender, walletAddress);
                return;
            }
        }

        revert NotRegistered();
    }

    function getAllWallets() external view returns (address[] memory) {
        return sAllWallets;
    }

    function getWalletsByCreator(address creator) external view returns (address[] memory) {
        return sWalletsByCreator[creator];
    }

    function getWalletsByOwner(address owner) external view returns (address[] memory) {
        return sWalletsByOwner[owner];
    }

    function getWalletCount() external view returns (uint256) {
        return sAllWallets.length;
    }
}
