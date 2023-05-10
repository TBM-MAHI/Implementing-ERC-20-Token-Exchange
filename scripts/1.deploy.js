// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function main() {
  console.log("prepare deployment......\n");
  //fetch contract to be deployed
  //fetch the contract ABI for deployment
  const Token = await ethers.getContractFactory("Token");
  const Exchange = await ethers.getContractFactory("Exchange");
  //Fetch Accounts
  const [deployerAccount, feeReceivingAccount] = await ethers.getSigners();
  console.log(
    ` Deployer account ${deployerAccount.address} \n feeReceving Account ${feeReceivingAccount.address} \n`
  );
  //Deploy The Contract
  //MAHI
  const MAHI = await Token.deploy("Mahi Token", "MAHI", 1000000);
  //get the contract info that was deployed
  await MAHI.deployed();
  console.log(` MAHI Token deployed to addresss -- ${MAHI.address}`);
  //mDAI
  const mDAI = await Token.deploy("Mock DAI", "mDAI", 1000000);
  await mDAI.deployed();
  console.log(` mDAI Token deployed to addresss -- ${mDAI.address}`);
  //mETH
  const mETH = await Token.deploy("MOCK ETH", "mETH", 1000000);
  await mETH.deployed();
  console.log(` mETH Token deployed to address's -- ${mETH.address}`);

  const exchange = await Exchange.deploy(feeReceivingAccount.address, 10);
  await exchange.deployed();
  console.log(` Exchange contract deployed to address-- ${exchange.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
