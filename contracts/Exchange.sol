//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";
contract Exchange{
    address public feeReceivingAccount;
    uint256 public feePersentage;
    constructor(address _feeReceivingAccount, uint256 _feePersentage){
        feeReceivingAccount = _feeReceivingAccount;
        feePersentage = _feePersentage;
    }
}