// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {ILSP7DigitalAsset} from "@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol";
import {
  _INTERFACEID_LSP7,
  _INTERFACEID_LSP7_V0_12_0,
  _INTERFACEID_LSP7_V0_14_0
} from "@lukso/lsp7-contracts/contracts/LSP7Constants.sol";

contract LSP7Vesting is VestingWallet {
  event TokensReleased(address indexed token, uint256 amount);
  mapping(address => uint256) private _tokensReleased;

  constructor(address beneficiary, uint64 startTimestamp, uint64 durationSeconds) payable VestingWallet(beneficiary, startTimestamp, durationSeconds) {}

  function checkLSP7(address target) internal view returns (bool) {
    if (!ERC165Checker.supportsERC165(target)) {
      return false;
    }
    return (
      ERC165Checker.supportsInterface(target, _INTERFACEID_LSP7) ||
      ERC165Checker.supportsInterface(target, _INTERFACEID_LSP7_V0_12_0) ||
      ERC165Checker.supportsInterface(target, _INTERFACEID_LSP7_V0_14_0)
    );
  }

  function released(address token) public view override returns (uint256) {
    return _tokensReleased[token];
  }

  function release(address token) public override {
    // releasable() uses IERC20.balanceOf, so it will work for both LSP7 and ERC20 tokens
    uint256 amount = releasable(token);
    require(amount > 0, "No tokens to release");
    _tokensReleased[token] += amount;
    if (checkLSP7(token)) {
      ILSP7DigitalAsset(token).transfer(address(this), beneficiary(), amount, true, "");
    } else {
      SafeERC20.safeTransfer(IERC20(token), beneficiary(), amount);
    }
    emit TokensReleased(token, amount);
  }
}
