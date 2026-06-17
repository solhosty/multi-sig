// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MultiSigWallet} from "./MultiSigWallet.sol";

contract MultiSigFactory {
    event WalletCreated(
        address indexed creator,
        address indexed wallet,
        address[] owners,
        uint256 threshold
    );

    address[] private sAllWallets;
    mapping(address => address[]) private sWalletsByCreator;
    mapping(address => address[]) private sWalletsByOwner;

    function createWallet(
        address[] calldata owners,
        uint256 threshold
    ) external returns (address walletAddress) {
        MultiSigWallet wallet = new MultiSigWallet(owners, threshold);
        walletAddress = address(wallet);

        sAllWallets.push(walletAddress);
        sWalletsByCreator[msg.sender].push(walletAddress);

        for (uint256 i = 0; i < owners.length; i++) {
            sWalletsByOwner[owners[i]].push(walletAddress);
        }

        emit WalletCreated(msg.sender, walletAddress, owners, threshold);
    }

    function getAllWallets(uint256 offset, uint256 limit) external view returns (address[] memory) {
        uint256 walletCount = sAllWallets.length;
        if (offset >= walletCount) {
            return new address[](0);
        }

        uint256 remaining = walletCount - offset;
        uint256 sliceLength = limit < remaining ? limit : remaining;
        address[] memory wallets = new address[](sliceLength);

        for (uint256 i = 0; i < sliceLength; i++) {
            wallets[i] = sAllWallets[offset + i];
        }

        return wallets;
    }

    function getWalletsByCreator(
        address creator,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory) {
        address[] storage creatorWallets = sWalletsByCreator[creator];
        uint256 walletCount = creatorWallets.length;
        if (offset >= walletCount) {
            return new address[](0);
        }

        uint256 remaining = walletCount - offset;
        uint256 sliceLength = limit < remaining ? limit : remaining;
        address[] memory wallets = new address[](sliceLength);

        for (uint256 i = 0; i < sliceLength; i++) {
            wallets[i] = creatorWallets[offset + i];
        }

        return wallets;
    }

    function getWalletsByOwner(
        address owner,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory) {
        address[] storage ownerWallets = sWalletsByOwner[owner];
        uint256 walletCount = ownerWallets.length;
        if (offset >= walletCount) {
            return new address[](0);
        }

        uint256 remaining = walletCount - offset;
        uint256 sliceLength = limit < remaining ? limit : remaining;
        address[] memory wallets = new address[](sliceLength);

        for (uint256 i = 0; i < sliceLength; i++) {
            wallets[i] = ownerWallets[offset + i];
        }

        return wallets;
    }

    function getWalletCount() external view returns (uint256) {
        return sAllWallets.length;
    }
}
