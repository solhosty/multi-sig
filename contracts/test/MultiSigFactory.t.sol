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
        address[] memory ownersOne = new address[](2);
        ownersOne[0] = creator;
        ownersOne[1] = ownerA;

        address[] memory ownersTwo = new address[](2);
        ownersTwo[0] = secondCreator;
        ownersTwo[1] = ownerA;

        vm.prank(creator);
        address walletOne = factory.createWallet(ownersOne, 2);

        vm.prank(secondCreator);
        address walletTwo = factory.createWallet(ownersTwo, 2);

        vm.prank(ownerA);
        factory.registerAsOwner(walletOne);
        vm.prank(ownerA);
        factory.registerAsOwner(walletTwo);

        address[] memory creatorWallets = factory.getWalletsByCreator(creator);
        assertEq(creatorWallets.length, 1);
        assertEq(creatorWallets[0], walletOne);

        address[] memory secondCreatorWallets = factory.getWalletsByCreator(secondCreator);
        assertEq(secondCreatorWallets.length, 1);
        assertEq(secondCreatorWallets[0], walletTwo);

        address[] memory ownerWallets = factory.getWalletsByOwner(ownerA);
        assertEq(ownerWallets.length, 2);
        assertEq(ownerWallets[0], walletOne);
        assertEq(ownerWallets[1], walletTwo);

        assertEq(factory.getWalletCount(), 2);
    }

    function testFactoryWalletsHoldAndTransferEthInIsolation() public {
        address[] memory ownersOne = new address[](3);
        ownersOne[0] = creator;
        ownersOne[1] = ownerA;
        ownersOne[2] = ownerB;

        address[] memory ownersTwo = new address[](3);
        ownersTwo[0] = creator;
        ownersTwo[1] = ownerB;
        ownersTwo[2] = ownerC;

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

    function testCreateWalletRevertsWhenCreatorNotOwner() public {
        address[] memory owners = new address[](2);
        owners[0] = ownerA;
        owners[1] = ownerB;

        vm.prank(creator);
        vm.expectRevert(MultiSigFactory.CreatorNotOwner.selector);
        factory.createWallet(owners, 2);
    }

    function testRegisterAsOwnerRevertsWhenAlreadyRegistered() public {
        address[] memory owners = new address[](2);
        owners[0] = creator;
        owners[1] = ownerA;

        vm.prank(creator);
        address wallet = factory.createWallet(owners, 2);

        vm.prank(ownerA);
        factory.registerAsOwner(wallet);

        vm.prank(ownerA);
        vm.expectRevert(MultiSigFactory.AlreadyRegistered.selector);
        factory.registerAsOwner(wallet);
    }

    function testUnregisterAsOwnerRevertsWhenNotRegistered() public {
        address[] memory owners = new address[](2);
        owners[0] = creator;
        owners[1] = ownerA;

        vm.prank(creator);
        address wallet = factory.createWallet(owners, 2);

        vm.prank(ownerA);
        vm.expectRevert(MultiSigFactory.NotRegistered.selector);
        factory.unregisterAsOwner(wallet);
    }

    function testRegisterAndUnregisterRoundTrip() public {
        address[] memory owners = new address[](2);
        owners[0] = creator;
        owners[1] = ownerA;

        vm.prank(creator);
        address wallet = factory.createWallet(owners, 2);

        vm.prank(ownerA);
        factory.registerAsOwner(wallet);

        address[] memory ownerWallets = factory.getWalletsByOwner(ownerA);
        assertEq(ownerWallets.length, 1);
        assertEq(ownerWallets[0], wallet);

        vm.prank(ownerA);
        factory.unregisterAsOwner(wallet);

        ownerWallets = factory.getWalletsByOwner(ownerA);
        assertEq(ownerWallets.length, 0);
    }

    function testRegisterAsOwnerRevertsWhenCallerIsNotWalletOwner() public {
        address[] memory owners = new address[](2);
        owners[0] = creator;
        owners[1] = ownerA;

        vm.prank(creator);
        address wallet = factory.createWallet(owners, 2);

        vm.prank(ownerB);
        vm.expectRevert(MultiSigFactory.NotWalletOwner.selector);
        factory.registerAsOwner(wallet);
    }
}
