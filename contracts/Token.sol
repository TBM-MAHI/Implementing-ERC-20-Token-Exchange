//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";
contract Token{
    /*  the public visibility inside name variable
        solidity automatically creates a function for accessing the name var */
    //STATE VARIABLES    
    string public name;
    string public symbol;
    uint256 public decimals=18;//how many decimal points are after fractional ether val
    uint public totalSupply;
    mapping(address => uint256) public balanceOf;  //track balances
    /* 1st mapping the owner address points to another mapping
    2nd mapping points that induvidual spenders address and how many token they are
    allowed/reponsible to spend */
    mapping( 
        address => mapping(address => uint256)
        ) public allowance; //in 
    //indexed keyword help keeping track of addresses
    event Transfer(address indexed from, address indexed to,uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        string memory _name ,
        string memory _symbol,
        uint256 _totalSupply
        ){
        name=_name;
        symbol=_symbol;
        totalSupply=_totalSupply*(10**decimals);  // 1000000*10^18
        balanceOf[msg.sender]=totalSupply;
    }
    function transfer(address _to, uint256 _value) public returns (bool success){
        //REQUIRE that sender has enough
        require(balanceOf[msg.sender]>=_value);
        _transfer(msg.sender, _to, _value);
        return true;
    }
    /* this is an internal function not publicly visible 
        used under the hood*/
    function _transfer(address _from, address _to, uint256 _value) internal{
        require(_to!= address(0));
        //deduct tokens from sender
        //here _from is the account who is calling the transfer function
        balanceOf[_from] = balanceOf[_from]-_value;
        //credit to receiver 
        balanceOf[_to] = balanceOf[_to]+_value;
        emit Transfer(_from, _to, _value);
    }
    function approve(address _spender, uint256 _val) public returns(bool sucsess) {
        require(_spender!=address(0));
        allowance[msg.sender][_spender] = _val;
        emit Approval(msg.sender, _spender, _val);
        return true;
    } 
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool sucess){
    //check approval, check to make sure that amount being sent is less than
    //what has been approved 
    /*console.log("from token.sol", _from, _to, _value);
    console.log("bal",balanceOf[_from]);*/
    require(_value <= allowance[_from][msg.sender],"Sending more than Approved!");
    require(balanceOf[_from] >= _value," Not Enough Balance! ");
    /*  UPDATE the Allowance
        Deduct how much token msg.sender has SPENT from Aloowance */
   allowance[_from][msg.sender] = allowance[_from][msg.sender]-_value;

    //spend token
    _transfer(_from, _to, _value);
    return true;
    }
}
