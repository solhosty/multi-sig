// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity >=0.8.13 <0.9.0;

import {Test} from "../src/Test.sol";
import {console} from "../src/console.sol";

contract ConsoleTest is Test {
    ConsoleHarness private harness;

    function setUp() public {
        harness = new ConsoleHarness();
    }

    function test_RevertIf_LogStringTooLong() public {
        string memory oversized = string(new bytes(4097));

        vm.expectRevert(bytes("log string too long"));
        harness.logSingle(oversized);
    }

    function test_LogStringAtLimit() public view {
        string memory maxLength = string(new bytes(4096));

        harness.logSingle(maxLength);
    }

    function test_RevertIf_AnyStringArgumentTooLong() public {
        string memory safe = string(new bytes(32));
        string memory oversized = string(new bytes(4097));

        vm.expectRevert(bytes("log string too long"));
        harness.logDouble(safe, oversized);
    }
}

contract ConsoleHarness {
    function logSingle(string memory value) external pure {
        console.log(value);
    }

    function logDouble(string memory left, string memory right) external pure {
        console.log(left, right);
    }
}
