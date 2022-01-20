const { ethers } = require("hardhat");
const { expect } = require("chai");
const BigNumber = require('bignumber.js');

let token;

let deployer;
let user1;
let user2;
let user3;

before(async () => {
  // Set up addresses
  [deployer, user1, user2, user3] = await ethers.getSigners();

  // Deploy ERC20 TEST coin contract
  const Contract = await ethers.getContractFactory("ModifiedERC20");
  // THIS IS WHERE THE TIME/BLOCK THRESHOLDS ARE SET
  // Mess with these numbers ** \/  \/ ** and watch the tests fail 
  token = await Contract.deploy(9, 20);
  await token.deployed();

  // Deploy Contributions contract
  const Contract2 = await ethers.getContractFactory("Contributions");
  cont = await Contract2.deploy(token.address);
  await cont.deployed();

  // Add contributions contract as a minter on the token contract
  await token.addCont(cont.address);
});

describe("ModifiedERC20", function () {

  it("Should return token name - sanity check", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());
    expect(await token.symbol()).to.equal("TEST");
  });

  it("Should send 20 wei to contribute() from user1", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());
    await cont.connect(user1).contribute({value: 20});

    expect(await token.balanceOf(user1.address)).to.equal(20);
  });

  it("Should send 305 wei to contribute() from user2", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());
    await cont.connect(user2).contribute({value: 305});

    expect(await token.balanceOf(user2.address)).to.equal(305);
  });

  it("Should try to mint TEST token directly and fail, because it's restricted", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());

    await expect(token.mint(user1.address, 100)).to.be.revertedWith("Only the 'Contributions' contract can call this.");
    // Try with a smaller amount?
    await expect(token.connect(user1).mint(user1.address, 1)).to.be.revertedWith("Only the 'Contributions' contract can call this.");
  });

  it("Should try to transfer from user1 to user3, but should fail because of time restrictions", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());

    await expect(token.connect(user1).transfer(user3.address, 5)).to.be.revertedWith("Current time does not fall within defined start/end parameters.");

    expect(await token.balanceOf(user1.address)).to.equal(20);

    console.log("Current Block # is ", await ethers.provider.getBlockNumber());
  });


  it("Should try transferring again, but now succeeding because time threshold is past.", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());
    // Test for emitted transfer event
    await expect(token.connect(user1).transfer(user3.address, 5))
    .to.emit(token, "ERC20Transfer")
    .withArgs(user1.address, user3.address, 5);

    expect(await token.balanceOf(user1.address)).to.equal(15);
    expect(await token.balanceOf(user3.address)).to.equal(5);
  });

  it("Should contribute from user3, checking balances to confirm.", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());
    // Check user3 balance before ETH contribution
    let user3Balance = ethers.utils.formatEther(await ethers.provider.getBalance(user3.address));
    console.log('user3Balance before = ', user3Balance);
    expect(parseInt(user3Balance)).to.be.greaterThan(99);
    // Contribute 1,000 ETH, so it's easily testable - Default is 10,000
    testAmnt = ethers.utils.parseEther('1000');
    await expect(cont.connect(user3).contribute({value: testAmnt}))
    .to.emit(cont, "NewContribution")
    .withArgs(user3.address, testAmnt);

    // user3's balance should be less than 9000 ETH
    user3Balance = ethers.utils.formatEther(await ethers.provider.getBalance(user3.address));
    console.log('user3Balance after = ', user3Balance);
    // Check that user's balance is less than 9000 ETH
    expect(parseInt(user3Balance)).to.be.lessThan(9000);
  });

  it("Should refund user3.", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());
    // Check Contributions contract balance
    let contBalance = ethers.utils.formatEther(await ethers.provider.getBalance(cont.address));
    console.log('contBalance before = ', contBalance);
    // Must be called from deployer address, since it's restricted to onlyOwner
    await cont.refund(user3.address);

    contBalance = ethers.utils.formatEther(await ethers.provider.getBalance(cont.address));
    console.log('contBalance after = ', contBalance);

    user3Balance = ethers.utils.formatEther(await ethers.provider.getBalance(user3.address));
    expect(parseInt(user3Balance)).to.be.greaterThan(9900);
  });

  it("Should burn some blocks.", async function () {
    // Function for burning blocks, to test transfer time window
    async function mineNBlocks(n) {
      for (let index = 0; index < n; index++) {
        await ethers.provider.send('evm_mine');
      }
    }

    await mineNBlocks(8);

    console.log("Current Block # is ", await ethers.provider.getBlockNumber());
  });

  it("Should transfer from user1 to user3, successfully.", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());

    await expect(token.connect(user1).transfer(user2.address, 5))
    .to.emit(token, "ERC20Transfer")
    .withArgs(user1.address, user2.address, 5);

    expect(await token.balanceOf(user1.address)).to.equal(10);
    expect(await token.balanceOf(user2.address)).to.equal(310);
  });

  it("Should attempt to transfer from user1 to user3, and fail.", async function () {
    console.log("Current Block # is ", await ethers.provider.getBlockNumber());

    await expect(token.connect(user1).transfer(user2.address, 5)).to.be.revertedWith("Current time does not fall within defined start/end parameters.");

    // Token balances should remain unchanged, because the transaction failed.
    expect(await token.balanceOf(user1.address)).to.equal(10);
    expect(await token.balanceOf(user2.address)).to.equal(310);
  });

});