// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MultiSigFactory} from "../src/MultiSigFactory.sol";
import {MultiSigWallet} from "../src/MultiSigWallet.sol";

contract MultiSigFactoryTest is Test {
    MultiSigFactory internal factory;

    address internal creator = makeAddr("creator");
    address internal secondCreator = makeAddr("secondCreator");
    address internal ownerA = makeAddr("ownerA");
    address internal ownerB = makeAddr("ownerB");
    address internal ownerC = makeAddr("ownerC");
    address internal receiverOne = makeAddr("receiverOne");
    address internal receiverTwo = makeAddr("receiverTwo");

    function setUp() public {
        factory = new MultiSigFactory();
    }

    function testIndexesWalletsByCreatorAndOwner() public {
        address[] memory owners = new address[](2);
        owners[0] = ownerA;
        owners[1] = ownerB;

        vm.prank(creator);
        address walletOne = factory.createWallet(owners, 2);

        vm.prank(secondCreator);
        address walletTwo = factory.createWallet(owners, 2);

        address[] memory creatorWallets = factory.getWalletsByCreator(creator, 0, 10);
        assertEq(creatorWallets.length, 1);
        assertEq(creatorWallets[0], walletOne);

        address[] memory secondCreatorWallets = factory.getWalletsByCreator(secondCreator, 0, 10);
        assertEq(secondCreatorWallets.length, 1);
        assertEq(secondCreatorWallets[0], walletTwo);

        address[] memory ownerWallets = factory.getWalletsByOwner(ownerA, 0, 10);
        assertEq(ownerWallets.length, 2);
        assertEq(ownerWallets[0], walletOne);
        assertEq(ownerWallets[1], walletTwo);

        assertEq(factory.getWalletCount(), 2);
    }

    function testFactoryWalletsHoldAndTransferEthInIsolation() public {
        address[] memory ownersOne = new address[](2);
        ownersOne[0] = ownerA;
        ownersOne[1] = ownerB;

        address[] memory ownersTwo = new address[](2);
        ownersTwo[0] = ownerB;
        ownersTwo[1] = ownerC;

        vm.startPrank(creator);
        address walletOneAddress = factory.createWallet(ownersOne, 2);
        address walletTwoAddress = factory.createWallet(ownersTwo, 2);
        vm.stopPrank();

        MultiSigWallet walletOne = MultiSigWallet(payable(walletOneAddress));
        MultiSigWallet walletTwo = MultiSigWallet(payable(walletTwoAddress));

        vm.deal(walletOneAddress, 3 ether);
        vm.deal(walletTwoAddress, 4 ether);

        vm.prank(ownerA);
        uint256 oneTx = walletOne.submitTransaction(receiverOne, 1 ether, "");

        vm.prank(ownerA);
        walletOne.signTransaction(oneTx);
        vm.prank(ownerB);
        walletOne.signTransaction(oneTx);
        vm.prank(ownerB);
        walletOne.executeTransaction(oneTx);

        vm.prank(ownerB);
        uint256 twoTx = walletTwo.submitTransaction(receiverTwo, 1.5 ether, "");

        vm.prank(ownerB);
        walletTwo.signTransaction(twoTx);
        vm.prank(ownerC);
        walletTwo.signTransaction(twoTx);
        vm.prank(ownerC);
        walletTwo.executeTransaction(twoTx);

        assertEq(receiverOne.balance, 1 ether);
        assertEq(receiverTwo.balance, 1.5 ether);
        assertEq(walletOneAddress.balance, 2 ether);
        assertEq(walletTwoAddress.balance, 2.5 ether);

        assertEq(walletOne.getTransactionCount(), 1);
        assertEq(walletTwo.getTransactionCount(), 1);

        assertTrue(walletOne.hasSigned(oneTx, ownerA));
        assertFalse(walletOne.hasSigned(oneTx, ownerC));
        assertTrue(walletTwo.hasSigned(twoTx, ownerC));
        assertFalse(walletTwo.hasSigned(twoTx, ownerA));
    }

    function testWalletGettersArePaginated() public {
        address[] memory owners = new address[](2);
        owners[0] = ownerA;
        owners[1] = ownerB;

        vm.prank(creator);
        address walletOne = factory.createWallet(owners, 2);

        vm.prank(creator);
        address walletTwo = factory.createWallet(owners, 2);

        address[] memory allWallets = factory.getAllWallets(0, 1);
        assertEq(allWallets.length, 1);
        assertEq(allWallets[0], walletOne);

        address[] memory nextWallets = factory.getAllWallets(1, 10);
        assertEq(nextWallets.length, 1);
        assertEq(nextWallets[0], walletTwo);

        address[] memory noWallets = factory.getAllWallets(5, 10);
        assertEq(noWallets.length, 0);

        address[] memory ownerSlice = factory.getWalletsByOwner(ownerA, 1, 5);
        assertEq(ownerSlice.length, 1);
        assertEq(ownerSlice[0], walletTwo);

        address[] memory emptyOwnerSlice = factory.getWalletsByOwner(ownerA, 2, 5);
        assertEq(emptyOwnerSlice.length, 0);
    }
}
