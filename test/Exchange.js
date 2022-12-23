const { ethers } = require('hardhat');
const { expect } = require('chai');

const convertToWei=(n)=> ethers.utils.parseUnits(n.toString(),'ether');
describe("EXchange", () => {
    //declare vars here to make it accssable on a global scope
    let exchange, deployerAccount, feeReceivingAccount;
    const feePercent = 10;
    
    beforeEach(async () => {
        [deployerAccount, feeReceivingAccount] = await ethers.getSigners();
        //fetch the contract Abstraction for deployment
        const Exchange = await ethers.getContractFactory("Exchange");
        //passing arguments in the constructor function
        exchange = await Exchange.deploy(feeReceivingAccount.address,feePercent);
    })
    
    describe("Deployment", () => {
        it("tracks the fee Receiving Account", async() => {
            expect(await exchange.feeReceivingAccount()).to.equal(feeReceivingAccount.address);
        })
        it("tracks the fee persentage", async() => {
            expect(await exchange.feePersentage()).to.equal(feePercent);
        })
       /* it("tracks the fee acount", () => {
        })
        it("tracks the fee acount", () => {
        }) */
    })
})