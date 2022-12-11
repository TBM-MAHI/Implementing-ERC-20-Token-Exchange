const { ethers } = require('hardhat');
const { expect } = require('chai');

const convertToGwei=(n)=> ethers.utils.parseUnits(n,'ether');

describe("Token", () => {
    //declare vars here to make it accssable on a global scope
    let token,deployerAccount;
    beforeEach(async() => {
        //fetch the contract Abstraction for deployment
        const Token = await ethers.getContractFactory("Token");
        //passing arguments in the constructor function
        token = await Token.deploy("Mahi Token", "MAHI", 1000000);
        [deployerAccount] = await ethers.getSigners();
        
    })
    describe("deployment", () => {
        const name = 'Mahi Token';
        const symbol = 'MAHI';
        const decimals = '18';
        const totalSupply = convertToGwei('1000000'); 
         //tests cases go here...
        it("has correct name", async () => {
            //read token name
            const tokenname = await token.name();
            //check the name correct or not
            expect(tokenname).to.equal(name);
        })
        it("has correct symbol", async () => expect(await token.symbol()).to.equal(symbol));
        it("has correct decimal", async () => expect(await token.decimals()).to.equal(decimals));
        it("has correct totalSupply", async () => expect(await token.totalSupply()).to.equal(totalSupply));
        it('Assigns total supply to deployers address', async () => {
            console.log(deployerAccount.address);
            expect(await token.balanceOf(deployerAccount.address)).to.equal(totalSupply);
          });
    })
})
