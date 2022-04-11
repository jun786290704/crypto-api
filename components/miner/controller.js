const axios = require('axios');
const chains = JSON.parse(process.env.NODE_CHAINS);
const abi = require('../abi/abi');
const tokens = require('../tokens/controller');
const contracts = require('../contracts/contracts');
const dbo = require('../../db/conn');
const logger = require('../../logger/logger').logger;

const Web3 = require('web3');

function getMinerDetails(minerLabel) {
    let miner = {};

    if (minerLabel == 'cookedrice') {
        miner =
        {
            named: 'Cooked Rice',
            label: 'cookedrice',
            chain: 'avax',
            contract: contracts.contracts.cookedRice,
            contractABI: abi.ABI_COOKEDRICE,
            eggsPerMiner: 1080000,
            startBlock: 12774852,
            endBlock: 32774852,
            buyMethod: 'calculateEggBuySimple(uint256)',
            sellMethod: 'calculateRiceSell(uint256)',
            getEggsMethod: 'getEggsSinceLastHatch(address)',
            getMinersMethod: 'getMyMiners(address)'

        }
    } else if (minerLabel == 'bakedbeans') {
        miner =
        {
            named: 'Baked Beans',
            label: 'bakedbeans',
            chain: 'bsc',
            contract: contracts.contracts.bakedBeans,
            contractABI: abi.ABI_BAKEDBEANS,
            eggsPerMiner: 1080000,
            startBlock: 12401836,
            endBlock: 32401836,
            buyMethod: 'calculateEggBuySimple(uint256)',
            sellMethod: 'calculateEggSell(uint256)',
            getEggsMethod: 'getEggsSinceLastHatch(address)',
            getMinersMethod: 'getMyMiners(address)'
        }
    } else if (minerLabel == 'garden') {
        miner =
        {
            named: 'Animal Farm Garden',
            label: 'garden',
            chain: 'bsc',
            contract: contracts.contracts.garden,
            contractABI: abi.ABI_GARDEN,
            eggsPerMiner: 2592000,
            startBlock: 13531485,
            endBlock: 32401836,
            buyMethod: 'calculateSeedsBuySimple(uint256)',
            sellMethod: 'calculateSeedSell(uint256)',
            getEggsMethod: 'getSeedsSinceLastPlant(address)',
            getMinersMethod: 'hatcheryPlants(address)',
            token: {
                type: 'lp',
                name: 'Drip/BUSD',
                address: contracts.contracts.gardenpool
            },
            transactionMethod: 'logs'
        }

    } else if (minerLabel == 'spookyminer') {
        miner =
        {
            named: 'Spooky Miner',
            label: 'spookyminer',
            chain: 'ftm',
            contract: contracts.contracts.spooky,
            contractABI: abi.ABI_SPOOKY,
            eggsPerMiner: 1080000,
            startBlock: 35395965,
            endBlock: 55395965,
            buyMethod: 'calculateBonesBuySimple(uint256)',
            sellMethod: 'calculateBonesSell(uint256)',
            getEggsMethod: 'getBonesSinceLastHatch(address)',
            getMinersMethod: 'getMyMiners(address)'
        }

    }

    return miner;
}

function getChainDetails(chain) {
    let minerchain = chains.find(element => element.label == chain);
    return minerchain;
}

async function getMinerData(minerlabel) {
    logger.info(`The Miner Label is ${minerlabel}`);

    let miner = getMinerDetails(minerlabel);
    let chain = getChainDetails(miner.chain);

    logger.info("Trying to get Web3 and contract for getMinerData");

    const web3 = new Web3(chain.rpcURL);
    var contract = new web3.eth.Contract(miner.contractABI, miner.contract);
    let minerData = {};
    logger.info("Got Web3 and contract for getMinerData");

    minerData.balance = toDec18(await contract.methods.getBalance().call());

    minerData.minersPerToken = Math.round(await contract.methods[miner.buyMethod](1000000000000000000n).call() / miner.eggsPerMiner)
    minerData.eggsPerToken = minerData.minersPerToken * 86400;
    minerData.rewardsPerToken = toDec18(await contract.methods[miner.sellMethod](minerData.eggsPerToken).call());
    logger.info("getMinerData - time to get rewardToken");
    if (miner.token && miner.token.type == 'lp') {
        minerData.rewardToken = {
            name: miner.token.name,
            price: (await tokens.getLPPrice(miner.token.address)).price
        }

    }
    else {
        minerData.rewardToken = {
            name: chain.gasToken.name,
            price: (await tokens.getTokenPrice(chain.gasToken.address, chain.label)).price
        }
    }
    minerData.balanceUSD = minerData.balance * minerData.rewardToken.price;
    logger.info("getMinerData - calculate market eggs");
    minerData.marketEggs = toDec18(((minerData.balance * 1000000000000000000) * minerData.eggsPerToken -
        (minerData.eggsPerToken * minerData.rewardsPerToken)) / minerData.rewardsPerToken);
    minerData.rewardsPerDayUSD = minerData.rewardsPerToken * minerData.rewardToken.price;

    return minerData;
}

function checkAddress(address) {
    const web3 = new Web3(Web3.givenProvider);
    return web3.utils.isAddress(address)
}

async function getMinerUserData(minerLabel, wallet) {

    let miner = getMinerDetails(minerLabel);
    let chain = getChainDetails(miner.chain);

    logger.info("Trying to get Web3 and contract for getMinerData");
    const web3 = new Web3(chain.rpcURL);
    var contract = new web3.eth.Contract(miner.contractABI, miner.contract);

    logger.info("Got Web3 and contract for getMinerUserData");

    if (!checkAddress(wallet)) {
        logger.warn('INVALID WALLET SENT TO getMinerUserData');
        return {};
    };

    let miners = 0;
    let pendingEggs = 0;
    let pendingRewards = 0;
    let rewardsPerDay = 0;

    logger.info('calling getEggs');

    await contract.methods[miner.getEggsMethod](wallet).call(function (err, resp) {
        if (err) {
            logger.error(err);
        } else {
            pendingEggs = parseInt(resp);
        }
    })

    logger.info('calling sellMetho');
    if (pendingEggs && pendingEggs > 0) {
        await contract.methods[miner.sellMethod](pendingEggs).call(function (err, resp) {
            if (err) {
                logger.error(err);

            } else {
                pendingRewards = toDec18(resp);
            }
        });
    }

    logger.info('calling getMiners');
    await contract.methods[miner.getMinersMethod](wallet).call(function (err, resp) {
        if (err) {
            logger.error(err);
        } else {
            miners = parseInt(resp);
        }
    });
    logger.info('calling sellMethod');
    if (miners && miners > 0) {
        await contract.methods[miner.sellMethod](miners * 86400).call(function (err, resp) {
            if (err) {
                logger.error(err);
            } else {
                rewardsPerDay = toDec18(resp);
            }
        });
    }


    var data = {
        pendingEggs: pendingEggs,
        pendingRewards: pendingRewards,
        rewardsPerDay: rewardsPerDay,
        miners: miners,
    }

    logger.debug(data);

    var extendedData = await getMinerUserExtendedData(minerLabel, wallet);
    logger.debug(extendedData);
    data.tokensSpent = extendedData.tokensSpent;
    data.tokensReceived = extendedData.tokensReceived;
    data.roi = extendedData.roi;
    data.dailyRewardPercentage = data.rewardsPerDay / data.tokensSpent;

    logger.info('sending back user and extended data');
    logger.info(data);

    return data;
}

async function getMinerUserExtendedData(minerLabel, wallet) {

    let miner = getMinerDetails(minerLabel);
    let chain = getChainDetails(miner.chain);

    const web3 = new Web3(chain.rpcURL);
    var contract = new web3.eth.Contract(miner.contractABI, miner.contract);

    if (!checkAddress(wallet)) {
        logger.warn('INVALID WALLET SENT TO getMinerUserExtendedData');
        return {};
    };

    let eggsSold, eggsBought = 0;
    if (miner.transactionMethod && miner.transactionMethod == 'logs') {
        let eggs = await getTransactions(minerLabel, wallet);
        eggsSold = eggs.sold;
        eggsBought = eggs.bought;

    } else {
        eggsSold = await getEggsSold(minerLabel, wallet);
        eggsBought = await getEggsBought(minerLabel, wallet);
    }

    logger.info('EGGS SOLD:' + eggsSold);
    const roi = eggsSold / eggsBought
    logger.info("Bought: " + eggsBought.toFixed(2) + " Sold: " + eggsSold.toFixed(2) + " ROI: " + (roi * 100).toFixed(2) + "%");
    return {
        tokensSpent: eggsBought,
        tokensReceived: eggsSold,
        roi: roi
    }
}

async function getTransactions(minerLabel, wallet) {

    let miner = getMinerDetails(minerLabel);
    let chain = getChainDetails(miner.chain);

    const web3 = new Web3(chain.rpcURL);

    if (!checkAddress(wallet)) {
        logger.warn('INVALID WALLET SENT TO getTransactions');
        return {};
    };

    walletHex = web3.eth.abi.encodeParameter('address', wallet);
    logger.info('hexxy');
    logger.info(walletHex);

    soldURL = "https://api.bscscan.com/api?module=logs&action=getLogs&"
        + "fromBlock=13531485&toBlock=32401836&"
        + "address=0xa0feB3c81A36E885B6608DF7f0ff69dB97491b58&"
        + "topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic0_1_opr=and&"
        + "topic1=0x000000000000000000000000685bfdd3c2937744c13d7de0821c83191e3027ff&"
        + "topic2=" + walletHex
        + "&apikey=24M2SK66EWEEMMCF138I6Q2I2J75DN54VA"

    boughtURL = "https://api.bscscan.com/api?module=logs&action=getLogs&"
        + "fromBlock=13531485&toBlock=32401836&"
        + "address=0xa0feB3c81A36E885B6608DF7f0ff69dB97491b58&"
        + "topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic0_1_opr=and&"
        + "topic2=0x000000000000000000000000685bfdd3c2937744c13d7de0821c83191e3027ff&"
        + "topic1=" + walletHex
        + "&apikey=24M2SK66EWEEMMCF138I6Q2I2J75DN54VA"
    // get transactions from PCS where the contract was the garden, type of transfer, from the garden to wallet
    // read the data line

    logger.info("GETTING TRANSACTIONS");
    let sold = 0;
    let bought = 0;

    await axios.get(soldURL).then(res => {
        const data = res.data.result;
        data.forEach(element => {
            let soldlp = parseInt(element.data, 16) / Math.pow(10, 18);
            sold += soldlp;
        })
    })

    await axios.get(boughtURL).then(res => {
        const data = res.data.result;
        data.forEach(element => {
            let boughtlp = parseInt(element.data, 16) / Math.pow(10, 18);
            bought += boughtlp;
        })
    })
    return {
        bought: bought,
        sold: sold
    }
}

async function getEggsSold(minerLabel, wallet) {

    let miner = getMinerDetails(minerLabel);
    let chain = getChainDetails(miner.chain);

    if (!checkAddress(wallet)) {
        logger.warn('INVALID WALLET SENT TO getMinerUserData');
        return {};
    };

    let eggsSold = 0;
    let value = 0;
    url = chain.scanAPIURL + "?module=account&action=txlistinternal&"
        + "address=" + wallet
        + "&startblock=" + miner.startBlock + "&endblock=" + miner.endBlock
        + "&apikey=" + chain.scanAPIKey;

    logger.info(url);

    await axios.get(url).then(res => {
        const data = res.data.result;
        data.forEach(element => {
            if (element.from == miner.contract) {
                var date = new Date(element.timeStamp * 1000);
                value += parseInt(element.value);
            }
            eggsSold = toDec18(value);
        })
    })
    return (eggsSold);
}

async function getEggsBought(minerLabel, wallet) {

    let miner = getMinerDetails(minerLabel);
    let chain = getChainDetails(miner.chain);

    if (!checkAddress(wallet)) {
        logger.warn('INVALID WALLET SENT TO getMinerUserData');
        return {};
    };

    let eggsBought = 0;
    let value = 0;
    url = chain.scanAPIURL + "?module=account&action=txlist&"
        + "address=" + wallet
        + "&startblock=" + miner.startBlock + "&endblock=" + miner.endBlock
        + "&apikey=" + chain.scanAPIKey;

    await axios.get(url).then(res => {
        let eggsSold = 0;
        let value = 0;
        if (res.data.message == "OK") {
            const data = res.data.result;
            data.forEach(element => {
                if (element.to.toLowerCase() == miner.contract.toLowerCase()) {
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
    // const dbConnect = dbo.getDb();
    // let cookedRiceData = {};

    // await getcookedRiceData(contracts.contracts.cookedRice).then(cookedRiceValue => {
    //     cookedRiceData = cookedRiceValue;
    // });

    // await getcookedRiceUserData(contracts.contracts.cookedRice, wallet).then(gardenUserValue => {
    //     cookedRiceData.user = gardenUserValue;
    // });

    // cookedRiceData.createDate = new Date();
    // cookedRiceData.wallet = wallet;
    // cookedRiceData._id = null;  // make sure the loop does not have previous id
    // logger.info('saving wallet data');
    // var myPromise = () => {
    //     return new Promise((resolve, reject) => {
    //         dbConnect
    //             .collection("cookedRicerecords")
    //             .insertOne(cookedRiceData, function (err, result) {
    //                 if (err) logger.info(err);
    //                 result
    //                 : resolve(result)
    //             })
    //     })
    // }
    // await myPromise();
    // cookedRiceData = {};
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

exports.getMinerData = getMinerData;
exports.getMinerUserData = getMinerUserData;
exports.logWallet = logWallet;
exports.getWallets = getWallets;