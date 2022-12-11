// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.


async function main() {
  //fetch contrct tobe deployed
  //fetch the contract ABI for deployment
  const Token = await ethers.getContractFactory('Token')
  //deploy the contarct
  const token = await Token.deploy();
  //get the contract info that was deployed
  await token.deployed();
  console.log(` Token deployed to addresss -- ${token.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
