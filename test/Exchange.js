const { ethers } = require('hardhat');
const { expect } = require('chai');

const convertToWei=(n)=> ethers.utils.parseUnits(n.toString(),'ether');
describe("EXchange", () => {
    //declare vars here to make it accssable on a global scope
    let exchange, deployerAccount, feeReceivingAccount, token1, user1;
    const feePercent = 10;
    
    beforeEach(async () => {
         //importing Token Contract for testing
         const Token = await ethers.getContractFactory("Token");
         token1 = await Token.deploy("Mahi Token", "MAHI", 1000000);
        
        [deployerAccount, feeReceivingAccount, user1] = await ethers.getSigners();
        let transaction = await token1.connect(deployerAccount).transfer(user1.address, convertToWei(1000));
        let result = await transaction.wait();
        //fetch the contract Abstraction for deployment
        const Exchange = await ethers.getContractFactory("Exchange");
        //passing arguments in the constructor function
        exchange = await Exchange.deploy(feeReceivingAccount.address, feePercent);
    })
    
    describe("Deployment", () => {
        it("tracks the fee Receiving Account", async () => {
            expect(await exchange.feeReceivingAccount()).to.equal(feeReceivingAccount.address);
        })
        it("tracks the fee persentage", async () => {
            expect(await exchange.feePersentage()).to.equal(feePercent);
        })
    })
    
    describe("Depositing Tokens", () => {
        let transaction, amount, result;
        amount = convertToWei(10);
        describe('Success', () => {
            
            beforeEach(async () => {
                //Approve the tokens
                console.log("aprovinng tokens...");
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
               //Deposit tokens
                transaction = await exchange.connect(user1).depositTokens(token1.address, amount);
                result = await transaction.wait();
            })
            it('track/verify the token deposited to the Exchange ', async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount);
            }) 
            it('emits Deposit Event', async () => {
                const ev = result.events[1];
                console.log(typeof result);
                const { token, user, amount, balance } = ev.args;
                expect(ev.event).to.equal('Deposit');
                expect(token).to.equal(token1.address);
                expect(user).to.equal(user1.address);
                expect(amount).to.equal(amount);
                expect(balance).to.equal(amount);
            })
        })
        describe('Failure', () => {
            it('fails when no tokens approved', async () => {
                await expect(exchange.connect(user1).depositTokens(token1.address, amount)).to.be.reverted;
            })
        })
    })
})