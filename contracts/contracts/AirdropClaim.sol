// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol";
import {
  _INTERFACEID_LSP7,
  _INTERFACEID_LSP7_V0_12_0,
  _INTERFACEID_LSP7_V0_14_0
} from "@lukso/lsp7-contracts/contracts/LSP7Constants.sol";

/**
 * @title AirdropClaim
 * @dev Contract for claiming tokens from an airdrop using merkle proofs
 */
contract AirdropClaim is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // The merkle root of the merkle tree containing the airdrop distribution
    bytes32 public immutable merkleRoot;

    // The token being distributed
    address public immutable token;
    bool public immutable isLSP7;
    uint256 public totalClaimed;

    // Mapping of addresses that have claimed their tokens
    mapping(address => mapping(uint256 => bool)) public hasClaimed;

    // Events
    event AirdropClaimed(address indexed account, uint256 amount);

    /**
     * @dev Constructor to initialize the contract with the token address and merkle root
     * @param _token The token contract address
     * @param _merkleRoot The merkle root of the airdrop distribution
     */
    constructor(address _token, bytes32 _merkleRoot) Ownable() {
        token = _token;
        merkleRoot = _merkleRoot;
        isLSP7 = checkLSP7(token);
    }

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

    receive() external payable {
        revert("This contract does not accept ETH");
    }

    fallback() external payable {
        revert("This contract does not accept ETH");
    }

    function handleClaim(uint256 amount, bytes32[] memory merkleProof) internal {
        require(hasClaimed[msg.sender][amount] == false, "Already claimed");
        hasClaimed[msg.sender][amount] = true;
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof");
        totalClaimed += amount;
        emit AirdropClaimed(msg.sender, amount);
    }

    function claimLSP7(uint256 amount, bytes32[] memory merkleProof, bool force) external nonReentrant {
        require(isLSP7, "Token is not an LSP7 token");
        handleClaim(amount, merkleProof);
        ILSP7DigitalAsset(token).transfer(address(this), msg.sender, amount, force, "");
    }

    function claimERC20(uint256 amount, bytes32[] memory merkleProof) external nonReentrant {
        require(!isLSP7, "Token is not an ERC20 token");
        handleClaim(amount, merkleProof);
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    function recoverLSP7(address recoverToken) external onlyOwner nonReentrant {
        uint256 balance = ILSP7DigitalAsset(recoverToken).balanceOf(address(this));
        require(balance > 0, "No tokens to recover");
        ILSP7DigitalAsset(recoverToken).transfer(address(this), owner(), balance, true, "");
    }

    function recoverERC20(address recoverToken) external onlyOwner nonReentrant {
        uint256 balance = IERC20(recoverToken).balanceOf(address(this));
        require(balance > 0, "No tokens to recover");
        IERC20(recoverToken).safeTransfer(owner(), balance);
    }

    function renounceOwnership() public view override onlyOwner {
        revert("Ownership cannot be renounced");
    }
} 