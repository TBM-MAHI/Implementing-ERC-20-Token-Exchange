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
    mapping(uint256 => _Order) orders;
    uint256 public ordersCount;
    mapping(uint256 => bool) public cancelledOrders;  //track of cancelled orders
    //A Way to model the order
    struct _Order{
        //Attribute of an Order
        uint256 id; // UID for the order
        address user;  //User who make the order
        address tokenGet; //Address of the token they receive
        uint256 amountGet; //Amount they receive
        address tokengive;  //Address of the token they give
        uint256 amountGive; //Amount they give
        uint256 timestamp; //when the order was created
    }
    event Order(
        uint256 id,
        address user, 
        address tokenGet, 
        uint256 amountGet, 
        address tokengive, 
        uint256 amountGive,       
        uint256 timestamp
    );
    event CancelOrder(
        uint256 id,
        address user, 
        address tokenGet, 
        uint256 amountGet, 
        address tokengive, 
        uint256 amountGive,       
        uint256 timestamp
    );

    event Deposit(address token,address user, uint256 amount, uint256 balance);
    event Withdraw(address token,address user, uint256 amount, uint256 balance);
  
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
      
        //Update User's Balance under that exchange token
        tokensBalance[_token][msg.sender] += _amount;
      
        //Emit an event
        emit Deposit(_token, msg.sender, _amount, balanceOf(_token,msg.sender));
    }

    function withdrawTokens(address _token, uint256 _amount) public{
        //
        require(tokensBalance[_token][msg.sender]>=_amount);
        //Transfer Tokens to user from the Exchange
        Token(_token).transfer(msg.sender, _amount);
       
        //Update User's Balance under that exchange token
        tokensBalance[_token][msg.sender] -= _amount;

        //Emit an Event
        emit Withdraw(_token, msg.sender, _amount, tokensBalance[_token][msg.sender]);
    }
    
    function balanceOf(address token,address user) public view returns(uint256){
        return tokensBalance[token][user];
    }
     /*  -----------------------------------------
        MAKE AND CANCEL ORDERS   */
  
    function makeOrder( address _tokenGet, 
                        uint256 _amountGet,
                        address _tokengive, 
                        uint256 _amountGive) 
                        public{
        //Token Give --{ the token user wants to Spend} - which token and how much
        // Token Get --{ the token thay want to receive} - which token and how much
        // Prevent orders if tokens aren't on exchange
        require( balanceOf(_tokengive, msg.sender) >= _amountGive," REVERT! Not enough Tokens!" );  
        //Make an Order
        ordersCount += 1;
        orders[ordersCount] = _Order(
                                1, //id
                                msg.sender, //user
                                _tokenGet,
                                _amountGet,
                                _tokengive,
                                _amountGive,
                                block.timestamp //Time Of a Block Creation 
                            );
        //emit Order event
        emit Order( 1, msg.sender, _tokenGet,_amountGet, _tokengive,_amountGive,block.timestamp );
    }

    function cancelOrder(uint256 _id) public{
        /*  Fetch the order  
            anorder is the type of struct _Order 
            the **storag**e keywords denotes that something is pulled out of storage */ 
        _Order storage anOrder = orders[_id];
         //Order must exist
        require(anOrder.id == _id);
        //caller of the order must be the owner of the order  
        require(anOrder.user == msg.sender);
        //Cancel order
        cancelledOrders[_id] = true;
       
         //emit
        emit  CancelOrder(
            _id,
            msg.sender, 
            anOrder.tokenGet, 
            anOrder.amountGet, 
            anOrder.tokengive,
            anOrder.amountGive, 
            anOrder.timestamp);
    }
}
