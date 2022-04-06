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
  let miners = 0;
  let rewardsPerBNB = 0;
  let balance = 0;
  var contract = new web3.eth.Contract(abi.ABI_BEANS, contractAddress);
  let beansData = {};

  await contract.methods.getBalance().call(function (error, result) {
    console.log("BALANCE:");
    console.log(result);
    beansData.balance = toDec18(result);
  }),
    await contract.methods.calculateEggBuySimple(1000000000000000000n).call(function (error, result) {
      beansData.minersPerBNB = Math.round(result / 1080000);
      beansData.eggsPerBNB = beansData.minersPerBNB * 86400;
    })

    await contract.methods.calculateEggSell(beansData.eggsPerBNB).call(function (error, result) {
      console.log(result);
      beansData.rewardsPerBNB = toDec18(result);
    })

    await tokens.getTokenPrice('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c').then(function (result) {
      bnb = result;
      beansData.bnb = bnb.price;
      console.log(beansData);
    })

    beansData.marketEggs = toDec18(((beansData.balance*1000000000000000000)*beansData.eggsPerBNB-
            (beansData.eggsPerBNB*beansData.rewardsPerBNB))/beansData.rewardsPerBNB);
    beansData.rewardsPerDayUSD = beansData.rewardsPerBNB * beansData.bnb;

  return beansData;
}

async function getBeansUserData(contractAddress, wallet) {
  console.log("time to get beans user data for " + contractAddress);
  var contract = new web3.eth.Contract(abi.ABI_BEANS, contractAddress);
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
  console.log("Calling beansData for wallet" + wallet);
  const dbConnect = dbo.getDb();
  let beansData = {};

  await getBeansData(contracts.contracts.beans).then(beansValue => {
    beansData = beansValue;
  });

  await getBeansUserData(contracts.contracts.beans, wallet).then(gardenUserValue => {
    beansData.user = gardenUserValue;
  });

  beansData.createDate = new Date();
  beansData.wallet = wallet;
  beansData._id = null;  // make sure the loop does not have previous id
  console.log('saving wallet data');
  var myPromise = () => {
    return new Promise((resolve, reject) => {
      dbConnect
        .collection("beansrecords")
        .insertOne(beansData, function (err, result) {
          if (err) console.log(err);
          result
          : resolve(result)
        })
    })
  }
  await myPromise();
  beansData = {};
}

async function getWallets(query) {
  const dbConnect = dbo.getDb();
  var myPromise = () => {
    return new Promise((resolve, reject) => {
      dbConnect
        .collection("wallets")
        .find(query)
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
exports.logWallet = logWallet;
exports.getWallets = getWallets;