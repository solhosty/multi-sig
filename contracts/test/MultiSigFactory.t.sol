// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {MultiSigFactory} from "../src/MultiSigFactory.sol";
import {MultiSigWallet} from "../src/MultiSigWallet.sol";

contract MultiSigFactoryTest is Test {
    bytes32 internal constant CREATE_WALLET_TYPEHASH =
        keccak256(
            "CreateWalletApproval(address factory,address creator,address[] owners,uint256 threshold,uint256 nonce)"
        );

    MultiSigFactory internal factory;

    address internal creator = makeAddr("creator");
    address internal secondCreator = makeAddr("secondCreator");
    address internal ownerA;
    address internal ownerB;
    address internal ownerC;
    uint256 internal ownerAPrivateKey;
    uint256 internal ownerBPrivateKey;
    uint256 internal ownerCPrivateKey;
    address internal receiverOne = makeAddr("receiverOne");
    address internal receiverTwo = makeAddr("receiverTwo");

    function setUp() public {
        factory = new MultiSigFactory();

        Vm.Wallet memory ownerAWallet = vm.createWallet("ownerA");
        ownerA = ownerAWallet.addr;
        ownerAPrivateKey = ownerAWallet.privateKey;

        Vm.Wallet memory ownerBWallet = vm.createWallet("ownerB");
        ownerB = ownerBWallet.addr;
        ownerBPrivateKey = ownerBWallet.privateKey;

        Vm.Wallet memory ownerCWallet = vm.createWallet("ownerC");
        ownerC = ownerCWallet.addr;
        ownerCPrivateKey = ownerCWallet.privateKey;
    }

    function _getCreateWalletDigest(
        address creatorAddress,
        address[] memory owners,
        uint256 threshold,
        uint256 nonce
    ) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                CREATE_WALLET_TYPEHASH,
                address(factory),
                creatorAddress,
                keccak256(abi.encodePacked(owners)),
                threshold,
                nonce
            )
        );

        return keccak256(abi.encodePacked("\x19\x01", factory.DOMAIN_SEPARATOR(), structHash));
    }

    function _privateKeyForOwner(address owner) internal view returns (uint256) {
        if (owner == ownerA) {
            return ownerAPrivateKey;
        }
        if (owner == ownerB) {
            return ownerBPrivateKey;
        }
        if (owner == ownerC) {
            return ownerCPrivateKey;
        }

        revert("Unknown owner");
    }

    function _signCreateWallet(
        address creatorAddress,
        address[] memory owners,
        uint256 threshold,
        uint256 nonce
    ) internal view returns (bytes[] memory signatures) {
        bytes32 digest = _getCreateWalletDigest(creatorAddress, owners, threshold, nonce);
        signatures = new bytes[](owners.length);

        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == creatorAddress) {
                continue;
            }

            (uint8 v, bytes32 r, bytes32 s) = vm.sign(_privateKeyForOwner(owners[i]), digest);
            signatures[i] = abi.encodePacked(r, s, v);
        }
    }

    function testIndexesWalletsByCreatorAndOwner() public {
        address[] memory owners = new address[](3);
        owners[0] = creator;
        owners[1] = ownerA;
        owners[2] = ownerB;
        bytes[] memory signatures =
            _signCreateWallet(creator, owners, 2, factory.nonces(creator));

        vm.prank(creator);
        address walletOne = factory.createWallet(owners, 2, signatures);

        owners[0] = secondCreator;
        signatures = _signCreateWallet(secondCreator, owners, 2, factory.nonces(secondCreator));

        vm.prank(secondCreator);
        address walletTwo = factory.createWallet(owners, 2, signatures);

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

        address[] memory creatorOwnerWallets = factory.getWalletsByOwner(creator);
        assertEq(creatorOwnerWallets.length, 1);
        assertEq(creatorOwnerWallets[0], walletOne);

        address[] memory secondCreatorOwnerWallets = factory.getWalletsByOwner(secondCreator);
        assertEq(secondCreatorOwnerWallets.length, 1);
        assertEq(secondCreatorOwnerWallets[0], walletTwo);

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
        bytes[] memory signaturesOne =
            _signCreateWallet(creator, ownersOne, 2, factory.nonces(creator));

        vm.startPrank(creator);
        address walletOneAddress = factory.createWallet(ownersOne, 2, signaturesOne);
        bytes[] memory signaturesTwo =
            _signCreateWallet(creator, ownersTwo, 2, factory.nonces(creator));
        address walletTwoAddress = factory.createWallet(ownersTwo, 2, signaturesTwo);
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

    function testRevertsWhenCreatorNotInOwners() public {
        address[] memory owners = new address[](2);
        owners[0] = ownerA;
        owners[1] = ownerB;

        vm.prank(creator);
        vm.expectRevert(MultiSigFactory.CreatorMustBeOwner.selector);
        factory.createWallet(owners, 2, new bytes[](0));
    }

    function testRevertsWithInvalidSignature() public {
        address[] memory owners = new address[](3);
        owners[0] = creator;
        owners[1] = ownerA;
        owners[2] = ownerB;
        bytes[] memory signatures =
            _signCreateWallet(creator, owners, 2, factory.nonces(creator));

        bytes32 digest = _getCreateWalletDigest(creator, owners, 2, factory.nonces(creator));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerBPrivateKey, digest);
        signatures[1] = abi.encodePacked(r, s, v);

        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(MultiSigFactory.InvalidOwnerSignature.selector, ownerA)
        );
        factory.createWallet(owners, 2, signatures);
    }

    function testRevertsWithReplayedSignatures() public {
        address[] memory owners = new address[](3);
        owners[0] = creator;
        owners[1] = ownerA;
        owners[2] = ownerB;
        bytes[] memory signatures =
            _signCreateWallet(creator, owners, 2, factory.nonces(creator));

        vm.prank(creator);
        factory.createWallet(owners, 2, signatures);

        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(MultiSigFactory.InvalidOwnerSignature.selector, ownerA)
        );
        factory.createWallet(owners, 2, signatures);
    }

    function testSucceedsWithValidSignaturesFromAllOwners() public {
        address[] memory owners = new address[](3);
        owners[0] = creator;
        owners[1] = ownerA;
        owners[2] = ownerC;
        bytes[] memory signatures =
            _signCreateWallet(creator, owners, 2, factory.nonces(creator));

        vm.prank(creator);
        address walletAddress = factory.createWallet(owners, 2, signatures);

        assertTrue(walletAddress != address(0));
        assertEq(factory.nonces(creator), 1);
    }
}
