//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";
import "./Token.sol";

contract Exchange{
    address public feeReceivingAccount;
    uint256 public feePersentage;
    /* 1st mapping address is the tokens. 1 single tokens map to 2nd
    address- many users address and
    the amount the value users deposited/withdraw */
    
    mapping(address => mapping( address=>uint256 )) public tokensBalance;
    event Deposit(address token,address user, uint256 amount, uint256 balance);
  
    constructor(address _feeReceivingAccount, uint256 _feePersentage){
        feeReceivingAccount = _feeReceivingAccount;
        feePersentage = _feePersentage;
    }
    
    /*  -----------------------------------------
        DEPOSIT AND WITHDRAW TOKENS   */ 
    function depositTokens(address _token, uint256 _amount) public{
        /*address(this) - this Exchange contracts address 
        Token(_token) - passing the address of token contracts; This makes the functions/public vars of token contacts
        callable*/
       //Transfer Tokens to exchange
       require( Token(_token).transferFrom(msg.sender, address(this), _amount) );
      
        //Update user Balance
        tokensBalance[_token][msg.sender] += _amount;
      
        //Emit an event
        emit Deposit(_token, msg.sender, _amount, balanceOf(_token,msg.sender));
    }

    function balanceOf(address token,address user) public view returns(uint256){
        return tokensBalance[token][user];
    }
}
