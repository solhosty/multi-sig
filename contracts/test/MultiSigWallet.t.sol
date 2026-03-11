// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MultiSigWallet} from "../src/MultiSigWallet.sol";

contract MultiSigWalletTest is Test {
    MultiSigWallet internal wallet;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");
    address internal recipient = makeAddr("recipient");

    function setUp() public {
        address[] memory owners = new address[](2);
        owners[0] = alice;
        owners[1] = bob;
        wallet = new MultiSigWallet(owners, 2);
    }

    function testCanProposeSignAndExecuteEthTransferWithRealValue() public {
        vm.deal(address(wallet), 5 ether);
        uint256 sendAmount = 1.25 ether;
        uint256 recipientBalanceBefore = recipient.balance;
        uint256 walletBalanceBefore = address(wallet).balance;

        vm.prank(alice);
        uint256 txId = wallet.submitTransaction(recipient, sendAmount, "");

        vm.prank(alice);
        wallet.signTransaction(txId);

        vm.prank(bob);
        wallet.signTransaction(txId);

        vm.prank(alice);
        wallet.executeTransaction(txId);

        assertEq(recipient.balance, recipientBalanceBefore + sendAmount);
        assertEq(address(wallet).balance, walletBalanceBefore - sendAmount);

        (, , , bool executed, uint256 sigs) = wallet.getTransaction(txId);
        assertTrue(executed);
        assertEq(sigs, 2);
    }

    function testOwnerMutationsMustExecuteThroughSelfTransaction() public {
        vm.startPrank(alice);
        vm.expectRevert(MultiSigWallet.OnlySelf.selector);
        wallet.addOwner(carol);
        vm.stopPrank();

        bytes memory addOwnerData = abi.encodeCall(MultiSigWallet.addOwner, (carol));

        vm.prank(alice);
        uint256 addOwnerTx = wallet.submitTransaction(address(wallet), 0, addOwnerData);

        vm.prank(alice);
        wallet.signTransaction(addOwnerTx);

        vm.prank(bob);
        wallet.signTransaction(addOwnerTx);

        vm.prank(alice);
        wallet.executeTransaction(addOwnerTx);

        assertTrue(wallet.isOwner(carol));

        bytes memory updateThresholdData = abi.encodeCall(MultiSigWallet.updateThreshold, (3));

        vm.prank(alice);
        uint256 thresholdTx = wallet.submitTransaction(address(wallet), 0, updateThresholdData);

        vm.prank(alice);
        wallet.signTransaction(thresholdTx);

        vm.prank(bob);
        wallet.signTransaction(thresholdTx);

        vm.prank(carol);
        wallet.signTransaction(thresholdTx);

        vm.prank(alice);
        wallet.executeTransaction(thresholdTx);

        assertEq(wallet.threshold(), 3);

        bytes memory removeOwnerData = abi.encodeCall(MultiSigWallet.removeOwner, (bob));

        vm.prank(alice);
        uint256 removeTx = wallet.submitTransaction(address(wallet), 0, removeOwnerData);

        vm.prank(alice);
        wallet.signTransaction(removeTx);

        vm.prank(bob);
        wallet.signTransaction(removeTx);

        vm.prank(carol);
        wallet.signTransaction(removeTx);

        vm.prank(alice);
        wallet.executeTransaction(removeTx);

        assertFalse(wallet.isOwner(bob));
        assertEq(wallet.threshold(), 2);
    }
}
