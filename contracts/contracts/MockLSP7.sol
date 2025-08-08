// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol";

/**
 * @title MockLSP7
 * @dev Mock LSP7 token for testing
 */
contract MockLSP7 is LSP7DigitalAsset {
    /**
     * @notice Sets the token-Metadata
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the the token-Metadata.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_) {
        _mint(newOwner_, 10 ** 30, true, "");
    }
} 