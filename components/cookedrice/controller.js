const axios = require('axios');

const chains = JSON.parse(process.env.NODE_CHAINS);
const chain = chains.find(element => element.label == 'avax');
const NODE_HTTP = chain.rpcURL;
const api = chain.scanAPIURL;
const key = chain.scanAPIKey;
console.log(chain);

const Web3 = require('web3');
const web3 = new Web3(NODE_HTTP);
const BSC_API = chain.api;

const abi = require('../abi/abi');
const tokens = require('../tokens/controller');
const contracts = require('../contracts/contracts');

const dbo = require('../../db/conn');

startBlock = "12774852";
endBlock = "43198904"



async function getCookedRiceData(contractAddress) {

    var contract = new web3.eth.Contract(abi.ABI_COOKEDRICE, contractAddress);
    let cookedRiceData = {};

    cookedRiceData.balance = toDec18(await contract.methods.getBalance().call());

    cookedRiceData.minersPerAvax = Math.round(await contract.methods.calculateEggBuySimple(1000000000000000000n).call() / 1080000)
    cookedRiceData.eggsPerAvax = cookedRiceData.minersPerAvax * 86400;
    cookedRiceData.rewardsPerAvax = toDec18(await contract.methods.calculateRiceSell(cookedRiceData.eggsPerAvax).call());
    cookedRiceData.avax = (await tokens.getTokenPrice('0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', 'avax')).price;

    cookedRiceData.marketEggs = toDec18(((cookedRiceData.balance * 1000000000000000000) * cookedRiceData.eggsPerAvax -
        (cookedRiceData.eggsPerAvax * cookedRiceData.rewardsPerAvax)) / cookedRiceData.rewardsPerAvax);
    cookedRiceData.rewardsPerDayUSD = cookedRiceData.rewardsPerAvax * cookedRiceData.avax;

    return cookedRiceData;
}

async function getCookedRiceUserData(contractAddress, wallet) {
    console.log("time to get rice user data for " + contractAddress);
    var contract = new web3.eth.Contract(abi.ABI_COOKEDRICE, contractAddress);
    let miners = 0;
    let pendingEggs = 0;
    let pendingRewards = 0;

    pendingEggs = parseInt(await contract.methods.getEggsSinceLastHatch(wallet).call()); 
    pendingRewards = toDec18(await contract.methods.calculateRiceSell(pendingEggs).call()) 
    miners = parseInt(await contract.methods.getMyMiners(wallet).call());
    rewardsPerDay = toDec18(await contract.methods.calculateRiceSell(miners * 86400).call());
    console.log("rewards per day:");
    console.log(rewardsPerDay);
    var data = {
        pendingEggs: pendingEggs,
        pendingRewards: pendingRewards,
        rewardsPerDay: rewardsPerDay,
        miners: miners,
    }

    var extendedData = await getCookedRiceExtendedData(contractAddress, wallet);
    data.avaxSpent = extendedData.avaxSpent;
    data.avaxReceived = extendedData.avaxReceived;
    data.roi = extendedData.roi;
    data.dailyRewardPercentage = data.rewardsPerDay / data.avaxSpent;

    return data;
}

async function getCookedRiceExtendedData(contractAddress, wallet) {
    let eggsSold, eggsBought = 0;
    eggsSold = await getEggsSold(wallet);
    eggsBought = await getEggsBought(wallet);
    const roi = eggsSold / eggsBought
    console.log("Bought: " + eggsBought.toFixed(2) + " Sold: " + eggsSold.toFixed(2) + " ROI: " + (roi * 100).toFixed(2) + "%");
    return {
        avaxSpent: eggsBought,
        avaxReceived: eggsSold,
        roi: roi
    }
}

async function getEggsSold(wallet) {
    let eggsSold = 0;
    let value = 0;
    url = "https://api.snowtrace.io/api?module=account&action=txlistinternal&"
        + "address=" + wallet
        + "&startblock=" + startBlock + "&endblock=" + endBlock
        + "&apikey=" + chain.scanAPIKey;

    console.log(url);

    await axios.get(url).then(res => {
        const data = res.data.result;
        data.forEach(element => {
            if (element.from == contracts.contracts.cookedRice) {
                var date = new Date(element.timeStamp * 1000);
                value += parseInt(element.value);
            }
            eggsSold = toDec18(value);
        })
    })
    return (eggsSold);
}

async function getEggsBought(wallet) {
    let eggsBought = 0;
    let value = 0;
    url = "https://api.snowtrace.io/api?module=account&action=txlist&"
        + "address=" + wallet
        + "&startblock=" + startBlock + "&endblock=" + endBlock
        + "&apikey=" + chain.scanAPIKey;

    await axios.get(url).then(res => {
        let eggsSold = 0;
        let value = 0;
        if (res.data.message == "OK") {
            const data = res.data.result;
            data.forEach(element => {
                if (element.to.toLowerCase() == contracts.contracts.cookedRice.toLowerCase()) {
                    var date = new Date(element.timeStamp * 1000);
                    value += parseInt(element.value);
                }
            })
            eggsBought = toDec18(value);
        } else {
            return "FAILED";
        }
    })
    return (eggsBought);
}


async function logWallet(wallet) {
    console.log("Calling cookedRiceData for wallet" + wallet);
    const dbConnect = dbo.getDb();
    let cookedRiceData = {};

    await getcookedRiceData(contracts.contracts.cookedRice).then(cookedRiceValue => {
        cookedRiceData = cookedRiceValue;
    });

    await getcookedRiceUserData(contracts.contracts.cookedRice, wallet).then(gardenUserValue => {
        cookedRiceData.user = gardenUserValue;
    });

    cookedRiceData.createDate = new Date();
    cookedRiceData.wallet = wallet;
    cookedRiceData._id = null;  // make sure the loop does not have previous id
    console.log('saving wallet data');
    var myPromise = () => {
        return new Promise((resolve, reject) => {
            dbConnect
                .collection("cookedRicerecords")
                .insertOne(cookedRiceData, function (err, result) {
                    if (err) console.log(err);
                    result
                    : resolve(result)
                })
        })
    }
    await myPromise();
    cookedRiceData = {};
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

exports.getCookedRiceData = getCookedRiceData;
exports.getCookedRiceUserData = getCookedRiceUserData;
exports.logWallet = logWallet;
exports.getWallets = getWallets;