// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {MultiSigFactory} from "../src/MultiSigFactory.sol";
import {MultiSigWallet} from "../src/MultiSigWallet.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        MultiSigFactory factory = new MultiSigFactory();
        vm.stopBroadcast();

        console2.log("MultiSigFactory deployed at:", address(factory));
        console2.log(
            "Note: createWallet now requires per-owner EIP-712 signatures collected off-chain"
        );
    }
}

contract DeployDirectWalletScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address ownerOne = vm.envAddress("OWNER_ONE");
        address ownerTwo = vm.envAddress("OWNER_TWO");
        uint256 threshold = vm.envUint("DIRECT_WALLET_THRESHOLD");

        address[] memory owners = new address[](2);
        owners[0] = ownerOne;
        owners[1] = ownerTwo;

        vm.startBroadcast(deployerPrivateKey);
        MultiSigWallet wallet = new MultiSigWallet(owners, threshold);
        vm.stopBroadcast();

        console2.log("Direct MultiSigWallet deployed at:", address(wallet));
    }
}
