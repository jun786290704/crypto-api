const axios = require('axios');

const Web3 = require('web3');
const NODE_HTTP = process.env.NODE_HTTP;
const web3 = new Web3(NODE_HTTP);

const abi = require('../abi/abi');
const tokens = require('../tokens/controller');
const contracts = require('../contracts/contracts');

const dbo = require('../../db/conn');

const AF_RATIO = 2592000 // used for both piggybank and garden



async function getGardenData(contractAddress) {
  var seeds = 50000;
  var contract = new web3.eth.Contract(abi.ABI_GARDEN, contractAddress);
  let results = await Promise.all([
    contract.methods.getBalance().call(function (error, result) { }),
    contract.methods.calculateSeedSell(2592000).call(function (error, result) { }),
    contract.methods.calculateSeedSell(seeds).call(function (error, result) { }),

  ]);
  let lpPerDay = 0;

  let lpPerPlant = toDec18(results[1] * .95);
  return ({
    balance: toDec18(results[0]),
    lpPerPlant: lpPerPlant,
    costPerPlant: lpPerPlant * lp_contract.price,
  })
}

async function getGardenUserData(contractAddress, wallet) {
  console.log("time to get garden user data for " + contractAddress);
  //console.log(abi.ABI_GARDEN);
  var contract = new web3.eth.Contract(abi.ABI_GARDEN, contractAddress);
  console.log("contract");
  //console.log(contract);
  let totalPlants = 0;
  let pendingSeeds = 0;
  let pendingLp = 0;

  await contract.methods.hatcheryPlants(wallet).call().then(result => {
    console.log(result);
    totalPlants = parseInt(result);
  });

  await contract.methods.getSeedsSinceLastPlant(wallet).call().then(result => {
    console.log(result);
    pendingSeeds = parseInt(result);
  });



  await contract.methods.calculateSeedSell(totalPlants * 86400).call().then(result => {
    console.log("calculating seeds");
    console.log(result)
    lpPerDay = toDec18(result);
  })

  await contract.methods.calculateSeedSell(pendingSeeds).call().then(result => {
    console.log("calculating pending seeds");
    console.log(result)
    pendingLp = toDec18(result);
  })


  console.log("time to go");

  return ({
    pendingSeeds: pendingSeeds,
    pendingLp: pendingLp,
    lpPerDay: lpPerDay,
    totalPlants: totalPlants,
    lpPerPlant: lpPerDay / totalPlants,
    usdPerDay: lpPerDay * lp_contract.price
  })

}

async function getAnimalFarmPrices() {
  pig = await tokens.getTokenPrice('0x3a4c15f96b3b058ab3fb5faf1440cc19e7ae07ce');
  dog = await tokens.getTokenPrice('0xdbdc73b95cc0d5e7e99dc95523045fc8d075fb9e');

  return {
    pig: pig,
    dog: dog
  }
}

async function getPiggyBankData(contractAddress) {
  var seeds = 50000;
  var contract = new web3.eth.Contract(abi.ABI_PIGGYBANK, contractAddress);
  let piggyBankData = {};

  await contract.methods.getBalance().call(function (error, result) {
    piggyBankData.balance = toDec18(result);
  }),
    await contract.methods.calculateTruffleSell(AF_RATIO).call(function (error, result) {
      piggyBankData.pigletPrice = toDec18(lp_contract.price * result);
      piggyBankData.truffleRate = toDec18(result);
    })

  return (piggyBankData);
}

async function logWallet(wallet) {
  console.log("Calling gardenUserData for wallet" + wallet);
  const dbConnect = dbo.getDb();
  let gardenData = {};
  await tokens.getLPPrice(contracts.contracts.gardenpool).then(value => {
    gardenData = value;
  });
  await getGardenData(contracts.contracts.garden).then(gardenValue => {
    gardenData.gardenData = gardenValue;
  });
  await getGardenUserData(contracts.contracts.garden, wallet).then(gardenUserValue => {
    gardenData.gardenData.user = gardenUserValue;
  });

  gardenData.createDate = new Date();
  gardenData.wallet = wallet;
  gardenData._id = null;  // make sure the loop does not have previous id
  console.log('saving wallet data');
  var myPromise = () => {
    return new Promise((resolve, reject) => {
      dbConnect
        .collection("gardenrecords")
        .insertOne(gardenData, function (err, result) {
          if (err) console.log(err);
          result
          : resolve(result)
        })
    })
  }
  await myPromise();
  gardenData = {};
}

async function getWallets() {
  const dbConnect = dbo.getDb();
  var myPromise = () => {
    return new Promise((resolve, reject) => {
      dbConnect
        .collection("wallets")
        .find({})
        .toArray(function (err, result) {
          err
            ? reject(err)
            : resolve(result);
        });
    })
  }

  wallets = await myPromise();
  return wallets;
}

function toDec18(num) {
  return num / 1000000000000000000;
}

exports.getGardenData = getGardenData;
exports.getGardenUserData = getGardenUserData;
exports.getAnimalFarmPrices = getAnimalFarmPrices;
exports.getPiggyBankData = getPiggyBankData;
exports.logWallet = logWallet;
exports.getWallets = getWallets;