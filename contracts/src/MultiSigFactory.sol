// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MultiSigWallet} from "./MultiSigWallet.sol";

contract MultiSigFactory {
    uint256 public constant MAX_PAGE_SIZE = 100;

    event WalletCreated(
        address indexed creator,
        address indexed wallet,
        address[] owners,
        uint256 threshold
    );

    error WalletLimitExceeded(uint256 current, uint256 maxAllowed);
    error ResultsTooLarge(uint256 requested, uint256 maxAllowed);
    error InvalidPageSize(uint256 pageSize, uint256 maxAllowed);

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

    function getAllWallets() external view returns (address[] memory wallets) {
        wallets = _getAllBounded(sAllWallets);
    }

    function getAllWallets(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory wallets) {
        wallets = _getPaginated(sAllWallets, offset, limit);
    }

    function getWalletsByCreator(address creator) external view returns (address[] memory wallets) {
        wallets = _getAllBounded(sWalletsByCreator[creator]);
    }

    function getWalletsByCreator(
        address creator,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory wallets) {
        wallets = _getPaginated(sWalletsByCreator[creator], offset, limit);
    }

    function getWalletsByOwner(address owner) external view returns (address[] memory wallets) {
        wallets = _getAllBounded(sWalletsByOwner[owner]);
    }

    function getWalletsByOwner(
        address owner,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory wallets) {
        wallets = _getPaginated(sWalletsByOwner[owner], offset, limit);
    }

    function getWalletCount() external view returns (uint256) {
        return sAllWallets.length;
    }

    function _getAllBounded(
        address[] storage wallets
    ) private view returns (address[] memory page) {
        uint256 walletCount = wallets.length;
        if (walletCount > MAX_PAGE_SIZE) {
            revert ResultsTooLarge(walletCount, MAX_PAGE_SIZE);
        }

        page = _copyRange(wallets, 0, walletCount);
    }

    function _getPaginated(
        address[] storage wallets,
        uint256 offset,
        uint256 limit
    ) private view returns (address[] memory page) {
        if (limit == 0 || limit > MAX_PAGE_SIZE) {
            revert InvalidPageSize(limit, MAX_PAGE_SIZE);
        }

        if (offset >= wallets.length) {
            return new address[](0);
        }

        uint256 remaining = wallets.length - offset;
        uint256 pageSize = limit < remaining ? limit : remaining;
        page = _copyRange(wallets, offset, pageSize);
    }

    function _copyRange(
        address[] storage wallets,
        uint256 offset,
        uint256 size
    ) private view returns (address[] memory page) {
        page = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            page[i] = wallets[offset + i];
        }
    }
}
