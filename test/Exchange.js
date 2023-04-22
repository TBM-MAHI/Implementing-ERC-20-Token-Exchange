const { ethers } = require('hardhat');
const { expect } = require('chai');

const convertToWei = (n) => ethers.utils.parseUnits(n.toString(), 'ether');
describe("EXchange", () => {
    //declare vars here to make it accssable on a global scope
    let exchange, deployerAccount, feeReceivingAccount, token1, token2, user1, user2;
    const feePercent = 10;
    
    beforeEach(async () => {
        //importing Token Contract for testing
        const Token = await ethers.getContractFactory("Token");
        token1 = await Token.deploy("Mahi Token", "MAHI", 1000000);
        token2 = await Token.deploy("Mock DAI", "DAI", 1000000);
        //transfering intial tokens to user1
        [deployerAccount, feeReceivingAccount, user1, user2] = await ethers.getSigners();
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
               // console.log("aproving tokens...");
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
                //console.log(typeof result);
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
                // Don't try to Deposit without approveing any tokens
                await expect(exchange.connect(user1).depositTokens(token1.address, amount)).to.be.reverted;
            })
        })
    })
    
    describe("Withdrawing Tokens", () => {
        let transaction, amount, result;
        amount = convertToWei(10);
        describe('Success', () => {
            
            beforeEach(async () => {
                //Depositing tokens Before Withdrawing
                
                //Approve the tokens
                //console.log("aprovinng tokens...");
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
                //Deposit tokens
                transaction = await exchange.connect(user1).depositTokens(token1.address, amount);
                result = await transaction.wait();
                //Withdaiwng Tokens
                transaction = await exchange.connect(user1).withdrawTokens(token1.address, amount);
                result = await transaction.wait();
            })
            it('track/verify the token Withdrawn from the Exchange ', async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(0);
                expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(0);
            }) 
            it('emits Withdraw Event', async () => {
                const ev = result.events[1];
                //console.log(typeof result);
                const { token, user, amount, balance } = ev.args;
                expect(ev.event).to.equal('Withdraw');
                expect(token).to.equal(token1.address);
                expect(user).to.equal(user1.address);
                expect(amount).to.equal(amount);
                expect(balance).to.equal(0);
            })
        })
        describe('Failure', () => {
            it('fails for insufficient Balance', async () => {
                // Attempt to withdraw tokens without depositing
                await expect(exchange.connect(user1).withdrawTokens(user1.address, amount)).to.be.reverted;
            })
        })
    })

    describe("Checking Deposited Balances of User ", () => {
        let transaction, amount, result;
        amount = convertToWei(123);
        beforeEach(async () => {
           //Approve the tokens
            console.log("aprovinng tokens...");
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();
            //Deposit tokens
            transaction = await exchange.connect(user1).depositTokens(token1.address, amount);
            result = await transaction.wait();
        })
        it('returns user balance ', async () => {
            expect(await token1.balanceOf(exchange.address)).to.equal(amount)
            expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount);
        }) 
    })

    describe("Making Orders", () => {
        let transaction, result, tokenAmount;
        let amount = convertToWei(200);
        console.log(typeof amount)
        describe('Success', () => {
            beforeEach(async () => {
                //Approve and DEPOSIT the tokens before making Orders
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
                //Deposit tokens
                transaction = await exchange.connect(user1).depositTokens(token1.address, amount);
                result = await transaction.wait();
                //MAKE ORDERS
                tokenAmount = convertToWei(100);
                transaction = await exchange.connect(user1).makeOrder(token2.address,tokenAmount , token1.address, tokenAmount);
                result = await transaction.wait();
            })
            it('tracks the newly created orders', async () => {
                expect(await exchange.ordersCount()).to.be.equal(1);
            })
            it('emits Order Event', async () => {
                const ev = result.events[0];
                const { id,user,tokenGet,amountGet,tokengive,amountGive,timestamp } = ev.args;
                expect(ev.event).to.equal('Order');
                expect(id).to.equal(1);
                expect(user).to.equal(user1.address);
                expect(tokenGet).to.equal(token2.address);
                expect(amountGet).to.equal(convertToWei(100));
                expect(tokengive).to.equal(token1.address);
                expect(amountGive).to.equal(convertToWei(100));
                expect(timestamp).to.at.least(100);
            })
        })
        describe('Failure', () => {
            it('Rejects orders with no tokens Approved/deposited ', async () => {
                await expect(exchange.connect(user1).makeOrder(token2.address, tokenAmount, token1.address, tokenAmount)).to.be.reverted;
            })
        })
    })
    describe("ORDER Actions", () => {
        let transaction, result;
        let amount = convertToWei(100);
        let amountGive = convertToWei(30);
        let amountGet = convertToWei(20);
        beforeEach(async () => {
            // USER 1 Approve and DEPOSIT the tokens before making Orders
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();
            transaction = await exchange.connect(user1).depositTokens(token1.address, convertToWei(100));
            result = await transaction.wait();
            //Give tokens to User2
            transaction = await token2.connect(deployerAccount).transfer(user2.address, convertToWei(1000));
            result = await transaction.wait();
            // USER 2 Approve and DEPOSIT the tokens before making Orders
            transaction = await token2.connect(user2).approve(exchange.address, amount);
            result = await transaction.wait();
            transaction = await exchange.connect(user2).depositTokens(token2.address, convertToWei(50));
            result = await transaction.wait();
            
            //USER 1 MAKES ORDER
            tokenAmount = convertToWei(100);
            transaction = await exchange.connect(user1).makeOrder(token2.address, amountGet , token1.address, amountGive);
            result = await transaction.wait();
        })
       
        describe('Cancelling orders ', () => {
            beforeEach( async () => {
                transaction = await exchange.connect(user1).cancelOrder(1);
                result = await transaction.wait();  
            })
            describe('Success', () => {
                it('updates cancelled orders', async () => {
                    expect( await exchange.cancelledOrders(1) ).to.equal(true);
                })
                it('emits CancelOrder Event', async () => {
                const ev = result.events[0];
                const { id,user,tokenGet,amountGet,tokengive,amountGive,timestamp } = ev.args;
                expect(ev.event).to.equal('CancelOrder');
                expect(id).to.equal(1);
                expect(user).to.equal(user1.address);
                expect(tokenGet).to.equal(token2.address);
                expect(amountGet).to.equal(amountGet);
                expect(tokengive).to.equal(token1.address);
                expect(amountGive).to.equal(amountGive);
                expect(timestamp).to.at.least(100);
                })
            })
            describe('Failure', () => {
                beforeEach(async () => {
                    //Approve and DEPOSIT the tokens before making Orders
                    transaction = await token1.connect(user1).approve(exchange.address, amount);
                    result = await transaction.wait();
                    //Deposit tokens
                    transaction = await exchange.connect(user1).depositTokens(token1.address, amount);
                    result = await transaction.wait();
                    //MAKE ORDERS
                    tokenAmount = convertToWei(100);
                    transaction = await exchange.connect(user1).makeOrder(token2.address,tokenAmount , token1.address, tokenAmount);
                    result = await transaction.wait();
                })
                it(' reject invalid order ids', async () => {
                    let invalid_id = 89;
                    await expect(exchange.connect(user1).cancelOrder(invalid_id)).to.be.reverted;
                })
                it(' reject unauthorized cancelation', async () => {
                    let invalid_id = 89;
                    //user2 cannot cancel the order made by user1
                    await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
                })
            })
        })
        describe("Filling Actions", async () => {
            describe('success', async () => {
                beforeEach(async () => {
                    transaction = await exchange.connect(user2).fillOrder(1);
                    result = await transaction.wait();
                });
                it('execute the trading and charge fees', async () => {
                    //GET Tokens
                    expect( await exchange.balanceOf(token2.address, user2.address)).to.equal(convertToWei(28));
                    expect( await exchange.balanceOf(token2.address, user1.address)).to.equal(convertToWei(20))
                    //fee TOKEN
                    expect( await exchange.balanceOf(token2.address, feeReceivingAccount.address)).to.equal(convertToWei(2));
                    //GIVE TOKEN
                    expect( await exchange.balanceOf(token1.address, user1.address)).to.equal(convertToWei(70))
                    expect( await exchange.balanceOf(token1.address, user2.address)).to.equal(convertToWei(30))
                })
                it('updates filled orders', async () => {
                    expect(await exchange.ordersFilled(1)).to.equal(true)
                })
                it('emits Trade Event', async () => {
                    const ev = result.events[0];
                    const { id, user, tokenGet, amountGet, tokengive, amountGive, creator,timestamp } = ev.args;
                    expect(ev.event).to.equal('Trade');
                    expect(id).to.equal(1);
                    expect(user).to.equal(user2.address);
                    expect(tokenGet).to.equal(token2.address);
                    expect(amountGet).to.equal(amountGet);
                    expect(tokengive).to.equal(token1.address);
                    expect(amountGive).to.equal(amountGive);
                    expect(creator).to.equal(user1.address);
                    expect(timestamp).to.at.least(100);
                })
            })
            describe('failure', async () => {
                it("rejects invalid order id", async () => {
                    let invalid_id = 999;
                    await expect((exchange.connect(user1).fillOrder(invalid_id))).to.be.reverted;
                })
                it('rejects already filled orders', async () => {
                    transaction = await exchange.connect(user2).fillOrder(1)
                    result = await transaction.wait();
                    //Cant fill same order twice
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
                  })
          
                  it('rejects canceled orders', async () => {
                    transaction = await exchange.connect(user1).cancelOrder(1)
                      result = await transaction.wait();
          
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
                  })
            })
        })
    })
})
module.exports = convertToWei;