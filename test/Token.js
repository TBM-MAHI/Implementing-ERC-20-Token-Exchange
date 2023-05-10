const { ethers } = require('hardhat');
const { expect } = require('chai');

const convertToWei=(n)=> ethers.utils.parseUnits(n.toString(),'ether');

describe("Token", () => {
    //declare vars here to make it accssable on a global scope
    let token,deployerAccount,receiverAccount,exchageAccount;
    beforeEach(async() => {
        //fetch the contract Abstraction for deployment
        const Token = await ethers.getContractFactory("Token");
        //passing arguments in the constructor function
        token = await Token.deploy("Mahi Token", "MAHI", 1000000);
        [deployerAccount,receiverAccount, exchageAccount] = await ethers.getSigners();
       })
    describe("Deployment", () => {
        const name = 'Mahi Token';
        const symbol = 'MAHI';
        const decimals = '18';
        const totalSupply = convertToWei('1000000'); 
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
        it('Assigns total supply to deployer address', async () => {
           // console.log(`deployer address $ {deployerAccount.address}`);
            expect(await token.balanceOf(deployerAccount.address)).to.equal(totalSupply);
          });
    })
  
    describe("Sending Tokens", () => {
        let amount, transaction, result;
        describe("Success", () => {
            beforeEach(async() => {
                console.log("deployer balanece Before transfer", ethers.utils.formatUnits(
                    (await token.balanceOf(deployerAccount.address)).toString() ,'ether'
                  )," Ether");
                  console.log("receiver balanece Before transfer", ethers.utils.formatUnits(
                      ( await token.balanceOf(receiverAccount.address)).toString(),'ether'
                  )," ether");
                  //transfer tokens
                amount = convertToWei(100);
                 /* to sign the transfer, alter something in the BC
                  the address needs to be connected */
                transaction = await token.connect(deployerAccount).transfer(receiverAccount.address, amount);
                result =  await transaction.wait(); //waits for the transaction tobe completed and the result to include on BC
            })
            it("transfer token Balances", async () => {
                //ensure that tokens were transferred
                expect(await token.balanceOf(deployerAccount.address)).to.equal(convertToWei(999900));
                expect(await token.balanceOf(receiverAccount.address)).to.equal(amount);
                console.log("deployer balance after transfer", ethers.utils.formatUnits(
                    ( await token.balanceOf(deployerAccount.address)).toString(),'ether'
                )," Ether");
                console.log("receiver balance after transfer", ethers.utils.formatUnits(
                   ( await token.balanceOf(receiverAccount.address)).toString(),'ether'
                )," ether");
            })
            it('emits Transfer Event', async () => {
                const ev = result.events[0];
                const { from, to, value } = ev.args;
                expect(ev.event).to.equal('Transfer');
                expect(from).to.equal(deployerAccount.address);
                expect(to).to.equal(receiverAccount.address);
                expect(value).to.equal(amount);
            })
        })

        describe("Failure", () => {
            let invalidAmount;
            it("reject insufficient balances", async() => {
                invalidAmount = convertToWei(1000000000); //amount grater than total supply
                let transaction = token.connect(deployerAccount).transfer(receiverAccount.address, invalidAmount);
                await expect(transaction).to.be.reverted;
            })
            it("revert transfer to invalid address", async() => {
                invalidAmount = convertToWei(100);
                let transaction = token.connect(deployerAccount).transfer('0x000000000000000000000000000000000', invalidAmount);
                await expect(transaction).to.be.reverted
             })
        })
    })
    describe("Approve Tokens", () => {
        let amount,transaction,result;
        beforeEach( async () => {
            amount = convertToWei(1000);
            /* The deployer account is signing/approving the transaction -- that the exchangeAccount is going
            to spent how many tokens from the deployer address
            approving on behalf of the deployer */
            transaction = await token.connect(deployerAccount).approve(exchageAccount.address, amount);
            result = await transaction.wait();
        })
        describe('Success', () => {
            it('allocates an allowance for delegated token spending', async () => {
                //calling allowance mapping
                expect(await token.allowance(deployerAccount.address, exchageAccount.address)).to.equal(amount);
            }) 
            it('emits Approval Event', async () => {
                const ev = result.events[0];
                const { owner, spender, value } = ev.args;
                expect(ev.event).to.equal('Approval');
                expect(owner).to.equal(deployerAccount.address);
                expect(spender).to.equal(exchageAccount.address);
                expect(value).to.equal(amount);
            })
        })
        describe('Failure', () => {
            it('rejects invalid spenders', async () => {
                await expect(token.connect(deployerAccount).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })
   
    describe("Delegated Token Transfer", () => {
        let amount,transaction,result;
        beforeEach(async () => {
            amount = convertToWei(100); //ether
            transaction = await token.connect(deployerAccount).approve(exchageAccount.address, amount);
            result = await transaction.wait();
        })
        describe("Success", () => {
            beforeEach(async () => {
            /* the exchage Account is facilitating the swap of tokens from deployer account to receivers acc  */
            transaction = await token.connect(exchageAccount).transferFrom(deployerAccount.address, receiverAccount.address, amount);
            result = await transaction.wait();
            })
            it("transfer token balances", async()=> {
                expect(await token.balanceOf(deployerAccount.address)).to.equal(convertToWei(999900));
                expect(await token.balanceOf(receiverAccount.address)).to.equal(amount);
            })
            it("resets the allowance", async () => {
                // console.log( await token.allowance(deployerAccount.address, exchageAccount.address))
                    expect( await token.allowance(deployerAccount.address, exchageAccount.address)).to.be.equal(convertToWei(0));
            })
            it('emits Transfer Event', async () => {
                const ev = result.events[0];
                const { from, to, value } = ev.args;
                expect(ev.event).to.equal('Transfer');
                expect(from).to.equal(deployerAccount.address);
                expect(to).to.equal(receiverAccount.address);
                expect(value).to.equal(amount);
            })
        })
           
        describe("Failure", () => {
            //Attempt to pass more than approved Tokens
            const invalidAmont = convertToWei(1000);
            it("revert invalid amount transfer", async () => {
               await expect(token.connect(exchageAccount).transferFrom(deployerAccount.address,receiverAccount.address,invalidAmont)).to.be.reverted;
            })
        })
    })
})

