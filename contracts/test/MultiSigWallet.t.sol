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

    function testStaleSignaturesCannotBypassThresholdAfterOwnerRemoval() public {
        // Setup: 3 owners with threshold 3
        address[] memory owners = new address[](3);
        owners[0] = alice;
        owners[1] = bob;
        owners[2] = carol;
        MultiSigWallet wallet3 = new MultiSigWallet(owners, 3);
        vm.deal(address(wallet3), 10 ether);

        // Submit a tx to send 1 ETH
        vm.prank(alice);
        uint256 txId = wallet3.submitTransaction(recipient, 1 ether, "");

        // All 3 owners sign
        vm.prank(alice);
        wallet3.signTransaction(txId);
        vm.prank(bob);
        wallet3.signTransaction(txId);
        vm.prank(carol);
        wallet3.signTransaction(txId);

        // Remove carol via self-call (submit + sign + execute a removeOwner tx)
        bytes memory removeData = abi.encodeCall(MultiSigWallet.removeOwner, (carol));
        vm.prank(alice);
        uint256 removeTxId = wallet3.submitTransaction(address(wallet3), 0, removeData);
        vm.prank(alice);
        wallet3.signTransaction(removeTxId);
        vm.prank(bob);
        wallet3.signTransaction(removeTxId);
        vm.prank(carol);
        wallet3.signTransaction(removeTxId);
        vm.prank(alice);
        wallet3.executeTransaction(removeTxId);

        // Carol is removed, threshold dropped to 2
        assertFalse(wallet3.isOwner(carol));
        assertEq(wallet3.threshold(), 2);

        // The original tx should NOT be executable — carol's stale signature was cleaned up,
        // so only alice + bob = 2 valid sigs, which meets the new threshold of 2.
        // But if carol's signature were still counted, signatureCount would be 3 >= 2 (stale bypass).
        // With our fix, carol's sig is cleared in removeOwner, so signatureCount = 2 and
        // executeTransaction recomputes from current owners only.

        // Execute should succeed with 2 valid current-owner signatures meeting threshold of 2
        vm.prank(alice);
        wallet3.executeTransaction(txId);
        assertEq(recipient.balance, 1 ether);

        // Verify carol's signature was actually cleared
        assertFalse(wallet3.hasSigned(txId, carol));
    }

    function testStaleSignaturesPreventsExecutionWhenBelowThreshold() public {
        // Setup: 2 owners with threshold 2
        address[] memory owners = new address[](3);
        owners[0] = alice;
        owners[1] = bob;
        owners[2] = carol;
        MultiSigWallet wallet3 = new MultiSigWallet(owners, 3);
        vm.deal(address(wallet3), 10 ether);

        // Submit a tx, only carol and bob sign (not alice)
        vm.prank(alice);
        uint256 txId = wallet3.submitTransaction(recipient, 1 ether, "");
        vm.prank(bob);
        wallet3.signTransaction(txId);
        vm.prank(carol);
        wallet3.signTransaction(txId);

        // Remove carol — threshold drops to 2, but only bob's sig remains valid (1 sig)
        bytes memory removeData = abi.encodeCall(MultiSigWallet.removeOwner, (carol));
        vm.prank(alice);
        uint256 removeTxId = wallet3.submitTransaction(address(wallet3), 0, removeData);
        vm.prank(alice);
        wallet3.signTransaction(removeTxId);
        vm.prank(bob);
        wallet3.signTransaction(removeTxId);
        vm.prank(carol);
        wallet3.signTransaction(removeTxId);
        vm.prank(alice);
        wallet3.executeTransaction(removeTxId);

        // Now only bob has a valid sig (1) but threshold is 2 — should revert
        vm.prank(alice);
        vm.expectRevert(MultiSigWallet.NotEnoughSignatures.selector);
        wallet3.executeTransaction(txId);
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
