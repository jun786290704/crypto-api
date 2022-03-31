const axios = require('axios');

const Web3 = require('web3');
const NODE_HTTP = process.env.NODE_HTTP;
const web3 = new Web3(NODE_HTTP);

const abi = require('../abi/abi');
const tokens = require('../tokens/controller');
const contracts = require('../contracts/contracts');

const dbo = require('../../db/conn');

const AF_RATIO = 2592000 // used for both piggybank and garden



async function getBeansData(contractAddress) {
let bnb = 0;
  var contract = new web3.eth.Contract(abi.ABI_BEANS, contractAddress);
  let results = await Promise.all([
    contract.methods.getBalance().call(function (error, result) {
        console.log(result)
     }),
  //  contract.methods.getEggsSinceLastHatch(2592000).call(function (error, result) { }),
    
  bnb = tokens.getTokenPrice('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c')

  ]);
  //let lpPerDay = 0;


  //let lpPerPlant = toDec18(results[1] * .95);
  return ({
    balance: toDec18(results[0]),
    bnb: results[1].price
   // lpPerPlant: lpPerPlant,
   // costPerPlant: lpPerPlant * lp_contract.price,
  })
}

async function getBeansUserData(contractAddress, wallet) {
  console.log("time to get beans user data for " + contractAddress);
  //console.log(abi.ABI_GARDEN);
  var contract = new web3.eth.Contract(abi.ABI_BEANS, contractAddress);
  console.log("contract");
  //console.log(contract);
  let miners = 0;
  let pendingEggs = 0;
  let pendingRewards = 0;

  await contract.methods.getEggsSinceLastHatch(wallet).call(function (error, result) {
      pendingEggs = parseInt(result);

   }),
  await contract.methods.calculateEggSell(pendingEggs).call(function (error, result) {
      pendingRewards = toDec18(result);
   }),

   await contract.methods.getMyMiners(wallet).call().then(result => {
    miners = parseInt(result);
  });

  await contract.methods.calculateEggSell(miners * 86400).call().then(result => {
    rewardsPerDay = toDec18(result);
  })

  


  console.log("time to go");

  return ({
    pendingEggs: pendingEggs,
    pendingRewards: pendingRewards,
    rewardsPerDay: rewardsPerDay,
    miners: miners,
  })

}

async function getBNBPrice() {
  bnb = await tokens.getTokenPrice('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c');

  return {
    bnb: bnb
  }
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

exports.getBeansData = getBeansData;
exports.getBeansUserData = getBeansUserData;
//exports.getAnimalFarmPrices = getAnimalFarmPrices;
//exports.getPiggyBankData = getPiggyBankData;
//exports.logWallet = logWallet;
//exports.getWallets = getWallets;