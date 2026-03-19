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

contract MultiSigWalletStaleSignatureTest is Test {
    MultiSigWallet internal wallet;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");
    address internal recipient = makeAddr("recipient");

    function setUp() public {
        address[] memory owners = new address[](3);
        owners[0] = alice;
        owners[1] = bob;
        owners[2] = carol;
        wallet = new MultiSigWallet(owners, 3);
        vm.deal(address(wallet), 10 ether);
    }

    /// @dev Helper to execute a self-targeting governance tx (requires all 3 sigs)
    function _executeGovernanceTx(bytes memory data) internal {
        vm.prank(alice);
        uint256 txId = wallet.submitTransaction(address(wallet), 0, data);

        vm.prank(alice);
        wallet.signTransaction(txId);
        vm.prank(bob);
        wallet.signTransaction(txId);
        vm.prank(carol);
        wallet.signTransaction(txId);

        vm.prank(alice);
        wallet.executeTransaction(txId);
    }

    function testRemovedOwnerSignatureDoesNotCountTowardThreshold() public {
        // Submit a transfer tx and have bob + carol sign (2 sigs)
        vm.prank(alice);
        uint256 txId = wallet.submitTransaction(recipient, 1 ether, "");

        vm.prank(bob);
        wallet.signTransaction(txId);
        vm.prank(carol);
        wallet.signTransaction(txId);

        // Remove bob via governance (threshold auto-reduces from 3 to 2)
        _executeGovernanceTx(abi.encodeCall(MultiSigWallet.removeOwner, (bob)));
        assertEq(wallet.threshold(), 2);

        // Now only carol's signature is valid (1 valid sig < threshold 2)
        // Without the fix, signatureCount=2 >= threshold=2 would pass
        vm.prank(alice);
        vm.expectRevert(MultiSigWallet.NotEnoughSignatures.selector);
        wallet.executeTransaction(txId);
    }

    function testStaleSignaturesIgnoredAfterMultipleRemovals() public {
        // Submit tx, bob and carol sign (not alice)
        vm.prank(alice);
        uint256 txId = wallet.submitTransaction(recipient, 1 ether, "");

        vm.prank(bob);
        wallet.signTransaction(txId);
        vm.prank(carol);
        wallet.signTransaction(txId);

        // Remove carol (threshold 3 -> 2)
        _executeGovernanceTx(abi.encodeCall(MultiSigWallet.removeOwner, (carol)));

        // Remove bob (threshold 2 -> 1)
        // Need governance tx with alice + bob signing (threshold is now 2)
        vm.prank(alice);
        uint256 removeBobTx = wallet.submitTransaction(
            address(wallet), 0, abi.encodeCall(MultiSigWallet.removeOwner, (bob))
        );
        vm.prank(alice);
        wallet.signTransaction(removeBobTx);
        vm.prank(bob);
        wallet.signTransaction(removeBobTx);
        vm.prank(alice);
        wallet.executeTransaction(removeBobTx);

        assertEq(wallet.threshold(), 1);

        // 0 valid signatures remain (bob and carol both removed), alice never signed
        // Without fix: signatureCount=2 >= threshold=1 would pass
        vm.prank(alice);
        vm.expectRevert(MultiSigWallet.NotEnoughSignatures.selector);
        wallet.executeTransaction(txId);
    }

    function testValidSignaturesStillWorkAfterUnrelatedOwnerRemoval() public {
        // Submit tx, alice and bob sign
        vm.prank(alice);
        uint256 txId = wallet.submitTransaction(recipient, 1 ether, "");

        vm.prank(alice);
        wallet.signTransaction(txId);
        vm.prank(bob);
        wallet.signTransaction(txId);

        // Remove carol (not a signer on this tx). Threshold 3 -> 2
        _executeGovernanceTx(abi.encodeCall(MultiSigWallet.removeOwner, (carol)));

        // alice and bob are still valid owners with valid sigs (2 >= 2)
        vm.prank(alice);
        wallet.executeTransaction(txId);

        assertEq(recipient.balance, 1 ether);
    }

    function testGetValidSignatureCount() public {
        vm.prank(alice);
        uint256 txId = wallet.submitTransaction(recipient, 1 ether, "");

        vm.prank(alice);
        wallet.signTransaction(txId);
        vm.prank(bob);
        wallet.signTransaction(txId);

        // Before removal: 2 valid sigs (alice + bob)
        assertEq(wallet.getValidSignatureCount(txId), 2);

        // Remove bob
        _executeGovernanceTx(abi.encodeCall(MultiSigWallet.removeOwner, (bob)));

        // After removal: only 1 valid sig (alice), even though signatureCount is still 2
        assertEq(wallet.getValidSignatureCount(txId), 1);
    }
}
