// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MultiSigWallet} from "./MultiSigWallet.sol";

contract MultiSigFactory {
    event WalletCreated(address indexed creator, address indexed wallet, address[] owners, uint256 threshold);

    address[] private sAllWallets;
    mapping(address => address[]) private sWalletsByCreator;
    mapping(address => address[]) private sWalletsByOwner;

    function createWallet(address[] calldata owners, uint256 threshold) external returns (address walletAddress) {
        MultiSigWallet wallet = new MultiSigWallet(owners, threshold);
        walletAddress = address(wallet);

        sAllWallets.push(walletAddress);
        sWalletsByCreator[msg.sender].push(walletAddress);

        for (uint256 i = 0; i < owners.length; i++) {
            sWalletsByOwner[owners[i]].push(walletAddress);
        }

        emit WalletCreated(msg.sender, walletAddress, owners, threshold);
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
