const { ethers } = require("hardhat");
const config = require("../src/config.json");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  const accounts = await ethers.getSigners();

  //Fetch networks
  const { chainId } = await ethers.provider.getNetwork();
  console.log("Using chainId:", chainId);

  const DApp = await ethers.getContractAt(
    "Token",
    config[chainId].DApp.address
  );
  console.log(`DApp Token fetched: ${DApp.address}`);

  const mETH = await ethers.getContractAt(
    "Token",
    config[chainId].mETH.address
  );
  console.log(`mETH Token fetched: ${mETH.address}`);

  const mDAI = await ethers.getContractAt(
    "Token",
    config[chainId].mDAI.address
  );
  console.log(`mDAI Token fetched: ${mDAI.address}`);
  const exchange = await ethers.getContractAt(
    "Exchange",
    config[chainId].exchange.address
  );
  console.log(`Exchange fetched :${exchange.address}`);

  const sender = accounts[0];
  const receiver = accounts[1];
  let amount = tokens(10000);

  let transaction, result;
  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  console.log(
    `Transferred ${amount} token from ${sender.address} to ${receiver.address}\n`
  );

  const user1 = accounts[0];
  const user2 = accounts[1];
  amount = tokens(10000);

  transaction = await DApp.connect(user1).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} tokens from ${user1.address}`);

  transaction = await exchange
    .connect(user1)
    .depositToken(DApp.address, amount);
  console.log(`Deposited ${amount} Ether from ${user1.address}\n`);

  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} tokens from ${user2.address}`);

  transaction = await exchange
    .connect(user2)
    .depositToken(mETH.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} tokens from ${user2.address}\n`);

  /////////////////////////////
  //Seed a cancel Order Order
  /////////////////////////////

  //User 1 makes order to get tokens
  let orderId;
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), DApp.address, tokens(5));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //User 1 cancel Order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Cancelled order from ${user1.address}\n`);
  await wait(1);

  //////////////////////////////////////////////////////////
  //Seed Filled Orders
  //

  //User 1 makes order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), DApp.address, tokens(10));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //User2 fill order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user1.address}\n`);

  await wait(1);

  //User 1 makes another order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(50), DApp.address, tokens(15));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //User 2 fills another order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user1.address}\n`);

  await wait(1);

  //User 1 makes final order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(200), DApp.address, tokens(20));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}\n`);

  //User 2 fills final order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user1.address}\n`);

  await wait(1);

  ////////////////////////////////////////
  //Seed Open orders
  //

  //User 1 makes 10 orders

  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user1)
      .makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10));

    result = await transaction.wait();

    console.log(`Made order from ${user1.address}`);

    await wait(1);
  }

  //User 2 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user2)
      .makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i));
    result = await transaction.wait();

    console.log(`Made order from ${user2.address}`);

    await wait(1);
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
