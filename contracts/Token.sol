//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";
contract Token{
    /*  the public visibility inside name variable
        solidity automatically creates a function for accessing the name var */
    string public name;
    string public symbol;
    uint256 public decimals=18;//how many decimal points are after fractional ether val
    uint public totalSupply;
    
    constructor(string memory _name ,string memory _symbol,uint256 _totalSupply){
        name=_name;
        symbol=_symbol;
        totalSupply=_totalSupply*(10**decimals);  // 1000000*10^18
    }   
}

