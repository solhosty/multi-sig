// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MultiSigWallet} from "../src/MultiSigWallet.sol";

contract MultiSigWalletRBACTest is Test {
    MultiSigWallet internal wallet;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");
    address internal dave = makeAddr("dave");
    address internal recipient = makeAddr("recipient");

    function setUp() public {
        address[] memory owners = new address[](2);
        owners[0] = alice;
        owners[1] = bob;
        wallet = new MultiSigWallet(owners, 2);
    }

    function testOwnerCanGrantAndRevokeAdminViaSelfCall() public {
        _executeSelfCall(abi.encodeCall(MultiSigWallet.grantAdmin, (carol)));
        assertTrue(wallet.isAdmin(carol));

        _executeSelfCall(abi.encodeCall(MultiSigWallet.revokeAdmin, (carol)));
        assertFalse(wallet.isAdmin(carol));
    }

    function testAdminCanGrantAndRevokeUserViaSelfCall() public {
        _executeSelfCall(abi.encodeCall(MultiSigWallet.grantAdmin, (carol)));

        vm.prank(carol);
        uint256 grantUserTx = wallet.submitTransaction(
            address(wallet), 0, abi.encodeCall(MultiSigWallet.grantUser, (dave))
        );

        vm.prank(carol);
        wallet.signTransaction(grantUserTx);

        vm.prank(alice);
        wallet.signTransaction(grantUserTx);

        vm.prank(carol);
        wallet.executeTransaction(grantUserTx);

        assertTrue(wallet.isUser(dave));

        vm.prank(carol);
        uint256 revokeUserTx = wallet.submitTransaction(
            address(wallet), 0, abi.encodeCall(MultiSigWallet.revokeUser, (dave))
        );

        vm.prank(carol);
        wallet.signTransaction(revokeUserTx);

        vm.prank(bob);
        wallet.signTransaction(revokeUserTx);

        vm.prank(carol);
        wallet.executeTransaction(revokeUserTx);

        assertFalse(wallet.isUser(dave));
    }

    function testAdminCannotCallAdminFunctionsDirectlyButCanProposeAndSign() public {
        _executeSelfCall(abi.encodeCall(MultiSigWallet.grantAdmin, (carol)));

        vm.prank(carol);
        vm.expectRevert(MultiSigWallet.OnlySelf.selector);
        wallet.grantAdmin(dave);

        vm.prank(carol);
        vm.expectRevert(MultiSigWallet.OnlySelf.selector);
        wallet.revokeAdmin(carol);

        vm.prank(carol);
        uint256 txId = wallet.submitTransaction(recipient, 0, "");

        vm.prank(carol);
        wallet.signTransaction(txId);

        vm.prank(alice);
        wallet.signTransaction(txId);

        vm.prank(carol);
        wallet.executeTransaction(txId);

        (, , , bool executed, uint256 signatures) = wallet.getTransaction(txId);
        assertTrue(executed);
        assertEq(signatures, 2);
    }

    function testUserCanProposeSignAndExecuteButDirectSettingsCallsRevert() public {
        _executeSelfCall(abi.encodeCall(MultiSigWallet.grantUser, (dave)));

        vm.prank(dave);
        uint256 txId = wallet.submitTransaction(recipient, 0, "");

        vm.prank(dave);
        wallet.signTransaction(txId);

        vm.prank(alice);
        wallet.signTransaction(txId);

        vm.prank(dave);
        wallet.executeTransaction(txId);

        vm.prank(dave);
        vm.expectRevert(MultiSigWallet.OnlySelf.selector);
        wallet.addOwner(makeAddr("newOwner"));

        vm.prank(dave);
        vm.expectRevert(MultiSigWallet.OnlySelf.selector);
        wallet.updateThreshold(1);
    }

    function testNonRoleAddressCannotSubmitSignOrExecute() public {
        vm.prank(carol);
        vm.expectRevert(MultiSigWallet.NotUser.selector);
        wallet.submitTransaction(recipient, 0, "");

        vm.prank(alice);
        uint256 txId = wallet.submitTransaction(recipient, 0, "");

        vm.prank(carol);
        vm.expectRevert(MultiSigWallet.NotUser.selector);
        wallet.signTransaction(txId);

        vm.prank(carol);
        vm.expectRevert(MultiSigWallet.NotUser.selector);
        wallet.executeTransaction(txId);
    }

    function _executeSelfCall(bytes memory data) internal {
        vm.prank(alice);
        uint256 txId = wallet.submitTransaction(address(wallet), 0, data);

        vm.prank(alice);
        wallet.signTransaction(txId);

        vm.prank(bob);
        wallet.signTransaction(txId);

        vm.prank(alice);
        wallet.executeTransaction(txId);
    }
}
