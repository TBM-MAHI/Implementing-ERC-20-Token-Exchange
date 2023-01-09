const config = require('../src/config.json');
const { ethers } = require("hardhat");

function wait(second) {
    const ms = second * 1000;
    return new Promise((resolve, reject) => setTimeout(
       resolve, ms
    ))
}
/* const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  } */
const convertToWei = (n) => ethers.utils.parseUnits(n.toString(), 'ether');

async function main() {
    //fetch Network info
    const { chainId } = await ethers.provider.getNetwork();
    console.log("using chainId "+ chainId)
    //fetch accouns from wallet-unlocked
    const accounts = await ethers.getSigners();
    //fetch the deploeyd tokens
    //(contract name, contract deployed address)
    const MAHI = await ethers.getContractAt('Token', config[chainId].MAHI.address);
    console.log(`MAHI token fetched at address ${MAHI.address}`);
    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address);
    console.log(`mDAI token fetched at address ${mDAI.address}`);
    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address);
    console.log(`mETH token fetched at address ${mETH.address}`);
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
    console.log(`Exchange token fetched at address ${exchange.address} \n`);

    //Distribute the tokens
    const deployerAccount = accounts[0];
    //setup exchange Account
    const user1 = accounts[1];
    const user2 = accounts[2];
    let amount, transaction,result;
    //sender/deployer transfers 10,000 to receviers account
    amount = 10000;
    transaction = await MAHI.connect(deployerAccount).transfer(user1.address,convertToWei(amount));
    result = await transaction.wait();
    console.log(`Transferred ${amount} MAHI tokens from ${deployerAccount.address} to ${user1.address}\n`);
    
    transaction = await mETH.connect(deployerAccount).transfer(user2.address,convertToWei(amount));
    result = await transaction.wait();
    console.log(`Transferred ${amount} mETH tokens from ${deployerAccount.address} to ${user2.address}\n`);
    /*  USER1 HAS MAHI Token
        user1 approves 10,000 MAHI tokens
    */
    transaction = await MAHI.connect(user1).approve(exchange.address, convertToWei(amount));
    result = await transaction.wait();
    console.log(`Approved ${amount} tokens from ${user1.address}`)
    //user1 deposits approved tokens
    transaction = await exchange.connect(user1).depositTokens(MAHI.address, convertToWei(amount));
    result = await transaction.wait();
    console.log(`Deposited ${amount} MAHI tokens from user 1 Address  ${user1.address}\n`)
    /*USER2 HAS mETH
     User 2 Approves mETH
     */
    transaction = await mETH.connect(user2).approve(exchange.address, convertToWei(amount))
    result = await transaction.wait()
    console.log(`Approved ${amount} mETH toknes from  user 2 Address ${user2.address}`)
    // User 2 Deposits mETH
    transaction = await exchange.connect(user2).depositTokens(mETH.address, convertToWei(amount));
    result = await transaction.wait()
    console.log(`Deposited ${amount} mETH toknes from  user 2 Address ${user2.address}\n`);

    /////////////////////////////////////////////////////////////
    // Seed a Cancelled Order
    // user1 makes order to receive mETH 
    let orderID;
    transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToWei(100), MAHI.address, convertToWei(5));
    result = await transaction.wait()
    console.log(`Order made from ${user1.address}`);
  
    // User 1 cancels order
   // console.log(result.events[0])
    orderID = result.events[0].args.id; //Order event emmited after calling makeOrder
    transaction = await exchange.connect(user1).cancelOrder(orderID);
    result = await transaction.wait();
    console.log(`Cancelled order created from ${user1.address}\n`)
    //WAIT
    await wait(2);
    
    /////////////////////////////////////////////////////////////
    // Seed Filled Orders
    // User 1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToWei(100), MAHI.address, convertToWei(10));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`)
    // user 2 fills 1st order
    orderID = result.events[0].args.id; //Order event emmited after calling makeOrder
    transaction = await exchange.connect(user2).fillOrder(orderID);
    result = await transaction.wait();
    console.log(`Filled 1st order created from ${user1.address}\n`);
    
    // User 1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToWei(50), MAHI.address, convertToWei(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)
    // User 2 fills 2nd order
    orderID = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderID)
    result = await transaction.wait()
    console.log(`Filled 2nd order created from ${user1.address}\n`)

    // Wait 1 second
    await wait(2)
    // User 1 makes final order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToWei(200), MAHI.address, convertToWei(20))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)
    // User 2 fills final-3rd order
    orderID = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderID)
    result = await transaction.wait()
    console.log(`Filled 3rd order created from ${user1.address}\n`)

    // Wait 1 second
    await wait(2)
    console.log(`Creating Open Orders.....`)
    // User 1 makes 10 orders --yet tobe filled
    let tokenCount = 5;
    for (let index = 1; index < 10; index++) {
        transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToWei(index*tokenCount), MAHI.address, convertToWei(20));
        result = await transaction.wait();
        orderID = result.events[0].args.id; 
        console.log(`Made order from ${user1.address}  order No -${orderID}`)
        await wait(1);
    }
    // User 2 makes 10 orders-- yet tobe filled
    for (let index = 1; index < 10; index++) {
        transaction = await exchange.connect(user2).makeOrder(MAHI.address, convertToWei(20), mETH.address, convertToWei(index*tokenCount));
        result = await transaction.wait();
        orderID = result.events[0].args.id; 
        console.log(`Made order from ${user2.address}  order No -${orderID}`)
        await wait(1);
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});