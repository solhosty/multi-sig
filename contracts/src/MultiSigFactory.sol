// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {MultiSigWallet} from "./MultiSigWallet.sol";

contract MultiSigFactory is EIP712 {
    error CreatorMustBeOwner();
    error InvalidOwnerSignature(address owner);

    bytes32 public constant CREATE_WALLET_TYPEHASH =
        keccak256(
            "CreateWalletApproval(address factory,address creator,address[] owners,uint256 threshold,uint256 nonce)"
        );

    event WalletCreated(
        address indexed creator,
        address indexed wallet,
        address[] owners,
        uint256 threshold
    );

    address[] private sAllWallets;
    mapping(address => address[]) private sWalletsByCreator;
    mapping(address => address[]) private sWalletsByOwner;
    mapping(address => uint256) public nonces;

    constructor() EIP712("MultiSigFactory", "1") {}

    function createWallet(
        address[] calldata owners,
        uint256 threshold,
        bytes[] calldata signatures
    ) external returns (address walletAddress) {
        bool creatorIsOwner;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == msg.sender) {
                creatorIsOwner = true;
                break;
            }
        }

        if (!creatorIsOwner) {
            revert CreatorMustBeOwner();
        }

        require(signatures.length == owners.length, "Invalid signatures length");

        bytes32 structHash = keccak256(
            abi.encode(
                CREATE_WALLET_TYPEHASH,
                address(this),
                msg.sender,
                keccak256(abi.encodePacked(owners)),
                threshold,
                nonces[msg.sender]
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == msg.sender) {
                continue;
            }

            address recoveredSigner = ECDSA.recover(digest, signatures[i]);
            if (recoveredSigner != owners[i]) {
                revert InvalidOwnerSignature(owners[i]);
            }
        }

        nonces[msg.sender]++;

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

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
