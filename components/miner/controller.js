const axios = require('axios');
const chains = JSON.parse(process.env.NODE_CHAINS);
const abi = require('../abi/abi');
const tokens = require('../tokens/controller');
const contracts = require('../contracts/contracts');
const dbo = require('../../db/conn');
const logger = require('../../logger/logger').logger;

const Web3 = require('web3');
const { LoggerLevel, Logger } = require('mongodb');
const e = require('express');

function getMinerDetails(minerLabel) {
    let miner = {};

    if (minerLabel == 'cookedrice') {
        miner =
        {
            name: 'Cooked Rice',
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
            name: 'Baked Beans',
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
    } else if (minerLabel == 'busdfarmer') {
        miner =
        {
            name: 'BUSD Farmer',
            label: 'busdfarmer',
            chain: 'bsc',
            contract: contracts.contracts.busdFarmer,
            contractABI: abi.ABI_BUSDFARMER,
            eggsPerMiner: 1080000,
            startBlock: 17052202,
            endBlock: 32401836,
            buyMethod: 'calculateEggBuySimple(uint256)',
            sellMethod: 'calculateEggSell(uint256)',
            getEggsMethod: 'getEggsSinceLastHatch(address)',
            getMinersMethod: 'getMyMiners(address)'
        }
    } else if (minerLabel == 'grinchbucks') {
        miner =
        {
            name: 'Grinch Bucks',
            label: 'grinchbucks',
            chain: 'bsc',
            contract: contracts.contracts.grinchBucks,
            contractABI: abi.ABI_GRINCHBUCKS,
            eggsPerMiner: 1080000,
            startBlock: 17062675,
            endBlock: 32401836,
            buyMethod: 'calculateEggBuySimple(uint256)',
            sellMethod: 'calculateEggSell(uint256)',
            getEggsMethod: 'getEggsSinceLastHatch(address)',
            getMinersMethod: 'getMyMiners(address)'
        }
    } else if (minerLabel == 'roastbeef') {
        miner =
        {
            name: 'Roast Beef',
            label: 'roastbeef',
            chain: 'bsc',
            contract: contracts.contracts.roastBeef,
            contractABI: abi.ABI_ROASTBEEF,
            eggsPerMiner: 864000,
            startBlock: 16960351,
            endBlock: 32401836,
            buyMethod: 'calculateEggBuySimple(uint256)',
            sellMethod: 'calculateEggSell(uint256)',
            getEggsMethod: 'getEggsSinceLastHatch(address)',
            getMinersMethod: 'hatcheryMiners(address)'
        }
    } else if (minerLabel == 'garden') {
        miner =
        {
            name: 'Animal Farm Garden',
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
            name: 'Spooky Miner',
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
    } else if (minerLabel == 'spookedbeans') {
        miner =
        {
            name: 'Spooked Beans',
            label: 'spookedbeans',
            chain: 'ftm',
            contract: contracts.contracts.spookedbeans,
            contractABI: abi.ABI_SPOOKEDBEANS,
            eggsPerMiner: 1080000,
            startBlock: 35733677,
            endBlock: 55395965,
            buyMethod: 'calculateEggBuySimple(uint256)',
            sellMethod: 'calculateEggSell(uint256)',
            getEggsMethod: 'getEggsSinceLastHatch(address)',
            getMinersMethod: 'getMyMiners(address)'
        }

    } else if (minerLabel == 'luckycat') {
        miner =
        {
            name: 'Lucky Cat',
            label: 'luckycat',
            chain: 'bsc',
            contract: contracts.contracts.luckycat,
            contractABI: abi.ABI_LUCKYCAT,
            eggsPerMiner: 1080000,
            startBlock: 16782143,
            endBlock: 36782143,
            buyMethod: 'calculateEggBuySimple(uint256)',
            sellMethod: 'calculateEggSell(uint256)',
            getEggsMethod: 'getEggsSinceLastHatch(address)',
            getMinersMethod: 'getMyMiners(address)'
        }

    } else if (minerLabel == 'diamondmine') {
        miner =
        {
            name: 'Diamond Mine',
            label: 'diamondmine',
            chain: 'avax',
            contract: contracts.contracts.diamondmine,
            contractABI: abi.ABI_DIAMONDMINE,
            eggsPerMiner: 1080000,
            startBlock: 13184468,
            endBlock: 33184468,
            buyMethod: 'calculateDiamondBuySimple(uint256)',
            sellMethod: 'calculateDiamondSell(uint256)',
            getEggsMethod: 'getDiamondsSinceLastHarvest(address)',
            getMinersMethod: 'getMyMiners(address)'
        }

    } else if (minerLabel == 'farmhouse') {
        miner =
        {
            name: 'The Farmhouse',
            label: 'farmhouse',
            chain: 'matic',
            contract: contracts.contracts.farmhouse,
            contractABI: abi.ABI_FARMHOUSE,
            eggsPerMiner: 1080000,
            startBlock: 27005850,
            endBlock: 67005850,
            buyMethod: 'calculateSeedBuySimple(uint256)',
            sellMethod: 'calculateSeedSell(uint256)',
            getEggsMethod: 'getSeedsSincelastPlanted(address)',
            getMinersMethod: 'getMyMiners(address)'
        }
    } else if (minerLabel == 'fishfarm') {
        miner =
        {
            name: 'Fish Farm',
            label: 'fishfarm',
            chain: 'avax',
            contract: contracts.contracts.fishfarm,
            contractABI: abi.ABI_FISHFARM,
            eggsPerMiner: 1080000,
            startBlock: 27005850,
            endBlock: 67005850,
            buyMethod: 'calculateBuy(uint256, uint256)',
            sellMethod: 'calculateSell(uint256)',
            getEggsMethod: 'getSeedsSincelastPlanted(address)',
            getMinersMethod: 'getMyMiners(address)'
        }

    } else if (minerLabel == 'degenbnb') {
        miner =
        {
            name: 'Degen BNB',
            label: 'degenbnb',
            chain: 'bsc',
            contract: contracts.contracts.degenBNB,
            contractABI: abi.ABI_DEGENBNB,
            eggsPerMiner: 1080000,
            startBlock: 16862774,
            endBlock: 67005850,
            buyMethod: 'calculateCoinBuySimple(uint256)',
            sellMethod: 'calculateCoinSell(uint256)',
            getEggsMethod: 'getCoinsSinceLastHarvest(address)',
            getMinersMethod: 'getMyMiners(address)'
        }

    }


    return miner;
}

function getChainDetails(chain) {
    let minerchain = chains.find(element => element.label == chain);
    return minerchain;
}

async function getMinerData(minerlabel, wallet) {
    logger.info(`The Miner Label is ${minerlabel}`);

    let miner = getMinerDetails(minerlabel);
    let chain = getChainDetails(miner.chain);

    logger.info("Trying to get Web3 and contract for getMinerData");

    const web3 = new Web3(chain.rpcURL);
    var contract = new web3.eth.Contract(miner.contractABI, miner.contract);
    let minerData = {};
    logger.info("Got Web3 and contract for getMinerData");
    logger.info('Processing contract');
    logger.info(miner.contract);
    logger.info(chain.rpcURL);

    logger.info('getting balance');
    await contract.methods.getBalance().call(function (err, resp) {
        if (err) {
            logger.error('ERROR');
            logger.error(err);
            return minerData;
        }
        else
            minerData.balance = toDec18(resp)
    });
    logger.debug('miner.buyMethod');
    await contract.methods[miner.buyMethod](1000000000000000000n).call(function (err, resp) {
        if (err)
            logger.error(err);
        else {
            if (resp && resp > 0)
                minerData.minersPerToken = Math.round(resp / miner.eggsPerMiner);
            else
                minerData.minersPerToken = 0;
        }
    });

    minerData.eggsPerToken = minerData.minersPerToken * 86400;
    logger.info('rewardsPerToken');
    if (minerData.eggsPerToken && minerData.eggsPerToken > 0) {
        await contract.methods[miner.sellMethod](minerData.eggsPerToken).call(function (err, resp) {
            if (err) {
                logger.error('ERROR');
                logger.error(err);
            } else {
                minerData.rewardsPerToken = toDec18(resp);
            }
        });
    }


    logger.info("getMinerData - time to get rewardToken");
    if (miner.token && miner.token.type == 'lp') {
        logger.info('LP Token');
        minerData.rewardToken = {
            name: miner.token.name,
            price: (await tokens.getLPPrice(miner.token.address)).price
        }

    }
    else {
        logger.info('standard token');
        minerData.rewardToken = {
            name: chain.gasToken.name,
            price: (await tokens.getTokenPrice(chain.gasToken.address, chain.label)).price
        }
    }
    logger.info('balanceUSD');
    minerData.balanceUSD = minerData.balance * minerData.rewardToken.price;
    logger.info("getMinerData - calculate market eggs");
    minerData.marketEggs = toDec18(((minerData.balance * 1000000000000000000) * minerData.eggsPerToken -
        (minerData.eggsPerToken * minerData.rewardsPerToken)) / minerData.rewardsPerToken);
    minerData.rewardsPerDayUSD = minerData.rewardsPerToken * minerData.rewardToken.price;

    minerData.date = new Date();
    minerData.label = minerlabel;
    minerData.name = miner.name;
    if (wallet)
        minerData.wallet = wallet;

    return minerData;
}

function checkAddress(address) {
    const web3 = new Web3(Web3.givenProvider);
    return web3.utils.isAddress(address)
}

async function getMinerUserData(minerLabel, wallet, fetchExtended) {

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
        wallet: wallet
    }

    logger.info('Fetch Extended? ' + fetchExtended);
    if (fetchExtended) {
        var extendedData = await getMinerUserExtendedData(minerLabel, wallet);
        logger.debug(extendedData);
        data.tokensSpent = extendedData.tokensSpent;
        data.tokensReceived = extendedData.tokensReceived;
        data.roi = extendedData.roi;
        data.dailyRewardPercentage = data.rewardsPerDay / data.tokensSpent;
    }


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
        eggsSold = await getEggsSold(minerLabel, wallet, 0, 0, true);
        eggsBought = await getEggsBought(minerLabel, wallet, 0, 0, true);
    }

    logger.info('EGGS SOLD:' + eggsSold);
    const roi = eggsSold / eggsBought
    // logger.info("Bought: " + eggsBought.toFixed(2) + " Sold: " + eggsSold.toFixed(2) + " ROI: " + (roi * 100).toFixed(2) + "%");
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

async function getEggsSold(minerLabel, wallet, start, end, totalOnly) {

    let miner = getMinerDetails(minerLabel);
    let chain = getChainDetails(miner.chain);
    let soldLogs = [];

    logger.info('miner:getEggsSold')
    logger.info(minerLabel + ' ' + wallet + ' ' + start + ' ' + end);


    if (!checkAddress(wallet)) {
        logger.warn('INVALID WALLET SENT TO getMinerUserData');
        return {};
    };

    let eggsSold = 0;
    let value = 0;

    if (start)
        startBlock = start
    else
        startBlock = miner.startBlock;

    if (end)
        endBlock = end
    else
        endBlock = miner.endBlock

    url = chain.scanAPIURL + "?module=account&action=txlistinternal&"
        + "address=" + wallet
        + "&startblock=" + startBlock + "&endblock=" + endBlock
        + "&apikey=" + chain.scanAPIKey;

    logger.info('eggs sold url')
    logger.info(url);

    await axios.get(url).then(res => {
        const data = res.data.result;
        data.forEach(element => {
            if (element.from.toLowerCase() == miner.contract.toLowerCase()) {
                var date = new Date(element.timeStamp * 1000);
                value += parseInt(element.value);
                let soldLog = {
                    amount: parseInt(element.value),
                    from: element.from,
                    to: element.to,
                    date: date,
                    block: parseInt(element.blockNumber),
                    timeStamp: element.timeStamp,
                    hash: element.hash,
                    wallet: wallet,
                    miner: minerLabel,
                    totalRewardsClaimed: value,
                    direction: "incoming"
                }
                soldLogs.push(soldLog);

            }
            // SAVE TO MONGO

            eggsSold = toDec18(value);
        })
    })
    //await logRecords(soldLogs);
    if (totalOnly)
        return eggsSold;
    else
        return (soldLogs);
}

async function getEggsBought(minerLabel, wallet, start, end, totalOnly) {

    let miner = getMinerDetails(minerLabel);
    let chain = getChainDetails(miner.chain);
    let buyLogs = [];

    const web3 = new Web3(chain.rpcURL);

    logger.info('miner:getEggsBought')
    logger.info(minerLabel + ' ' + wallet + ' ' + start + ' ' + end);

    if (start)
        startBlock = start
    else
        startBlock = miner.startBlock;

    if (end)
        endBlock = end
    else
        endBlock = miner.endBlock

    if (!checkAddress(wallet)) {
        logger.warn('INVALID WALLET SENT TO getMinerUserData');
        return {};
    };

    let eggsBought = 0;
    let value = 0;
    url = chain.scanAPIURL + "?module=account&action=txlist&"
        + "address=" + wallet
        + "&startblock=" + startBlock + "&endblock=" + endBlock
        + "&apikey=" + chain.scanAPIKey;

    await axios.get(url).then(res => {
        let eggsSold = 0;
        let value = 0;
        if (res.data.message == "OK") {
            const data = res.data.result;
            data.forEach(element => {
                if (element.to.toLowerCase() == miner.contract.toLowerCase() && element.isError != "1") {
                    logger.info(element);
                    var date = new Date(element.timeStamp * 1000);
                    value += parseInt(element.value);
                    let buyLog = {
                        amount: parseInt(element.value),
                        from: element.from,
                        to: element.to,
                        date: date,
                        block: parseInt(element.blockNumber),
                        timeStamp: element.timeStamp,
                        hash: element.hash,
                        wallet: wallet,
                        miner: minerLabel,
                        direction: "outgoing"
                    }

                    if (buyLog.amount > 0)
                        buyLogs.push(buyLog);
                }
            })
            eggsBought = toDec18(value);
        } else {
            return "FAILED";
        }
    })
    if (totalOnly)
        return eggsBought;
    else
        return (buyLogs);
}

async function logTransactions(transactions) {
    const dbConnect = dbo.getDb();

    logger.info('saving transactions');
    var myPromise = () => {
        return new Promise((resolve, reject) => {
            transactions.forEach(record => {
                dbConnect
                    .collection("minertransactions")
                    .insertOne(record, function (err, result) {
                        if (err) {
                            logger.info(err);
                            reject(err);
                        }
                        result
                        : resolve(result)
                    })

            })

        })
    }
    let result = await myPromise();
    logger.info('done saving transactions');
}

async function logRecord(record) {
    const dbConnect = dbo.getDb();

    logger.info('saving record');
    var myPromise = () => {
        return new Promise((resolve, reject) => {

            dbConnect
                .collection("minerrecords")
                .insertOne(record, function (err, result) {
                    if (err) {
                        logger.info(err);
                        reject(err);
                    }
                    result
                    : resolve(result)
                })
        })
    }
    let result = await myPromise();
    logger.info('done saving record');
}


async function logWallet(wallet) {
    const dbConnect = dbo.getDb();
    let minerData = {};

    logger.info('miner:logWallet');

    let walletDetail = await getWallet(wallet); // pass a wallet ID and get entire wallet object
    if (walletDetail && walletDetail.miners) {
        for (const miner of walletDetail.miners) {
            const minerDetail = getMinerDetails(miner.label);
            logger.info('getting start block');
            const firstBlock = await getFirstBlock(miner.label, walletDetail);
            logger.info('received first block');
            logger.info(firstBlock);
            const startBlock = firstBlock || minerDetail.startBlock;
            const endBlock = await getLastBlock(miner.label);
            let minerData = await getMinerData(miner.label, walletDetail.wallet);
            minerData.user = await getMinerUserData(miner.label, walletDetail.wallet);
            const eggsSoldRecords = await getEggsSold(miner.label, walletDetail.wallet, startBlock, endBlock);
            const eggsBuyRecords = await getEggsBought(miner.label, walletDetail.wallet, startBlock, endBlock);
            logger.info('finished retrieving data for a logWallet loop')
    
            // LOG MINER DATA
            logRecord(minerData);
            logTransactions(eggsBuyRecords);
            logTransactions(eggsSoldRecords);
        }

    }
    
}

async function getFirstBlock(minerLabel, wallet) {
    // if we have stored data for that miner, get the last record and block
    // if not, use the default start record
    logger.info('miner:getFirstBlock(wallet)');
    const query = { miner: minerLabel, wallet: wallet.wallet }

    logger.info(query);
    const dbConnect = dbo.getDb();
    const lastRecord = await dbConnect.collection("minertransactions").find(query).sort({ block: -1 }).limit(1).toArray();
    if (lastRecord && lastRecord[0])
        return lastRecord[0].block + 1
    else
        return null;

}

async function getLastBlock(minerlabel) {

    logger.info('getlastblock(minerlabel)')
    logger.info(minerlabel)

    let miner = getMinerDetails(minerlabel);
    let chain = getChainDetails(miner.chain);

    logger.info("Trying to get Web3 and contract for getMinerData");

    const web3 = new Web3(chain.rpcURL);
    const lastBlock = await web3.eth.getBlockNumber();
    logger.info('last block: ' + lastBlock)
    return lastBlock * 1.4; // solve issue of last block, well, not being the last block...

}

async function getMinersByWallet(wallet) {
    // gets a wallet, go through wallet.miners to get them all
    logger.info('miner:getMinersByWallet(wallet)');
    logger.info(wallet);
    const dbConnect = dbo.getDb();
    let miners = [];
    let foo = [];
    let bought = {};
    for (const walletMiner of wallet.miners) {
        bought = {};
        let aggQuery = [
            {
                '$match': {
                    'wallet': wallet.wallet.toLowerCase(),
                    'label': walletMiner.label
                }
            }, {
                '$sort': {
                    'date': -1
                }
            }, {
                '$limit': 1
            }
        ]
        // get amount bought and spent
        let boughtAgg = [
            {
                '$match': {
                    'miner': walletMiner.label,
                    '$expr': {
                        '$eq': [
                            '$from', wallet.wallet.toLowerCase()
                        ]
                    }
                }
            }, {
                '$group': {
                    '_id': '$wallet',
                    'totalSpend': {
                        '$sum': {
                            '$divide': [
                                '$amount', 1000000000000000000
                            ]
                        }
                    }
                }
            }
        ]
        let soldAgg =
            [
                {
                    '$match': {
                        'miner': walletMiner.label,
                        '$expr': {
                            '$eq': [
                                '$to', wallet.wallet.toLowerCase()
                            ]
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$wallet',
                        'totalReceived': {
                            '$sum': {
                                '$divide': [
                                    '$amount', 1000000000000000000
                                ]
                            }
                        }
                    }
                }
            ]
        foo = await dbConnect.collection('minerrecords').aggregate(aggQuery).toArray();
        logger.info('got miner info:' + walletMiner.label)
        bought = await dbConnect.collection('minertransactions').aggregate(boughtAgg).toArray();
        logger.info('got bought info:' + walletMiner.label)
        sold = await dbConnect.collection('minertransactions').aggregate(soldAgg).toArray();
        logger.info('got sold info:' + walletMiner.label)
        logger.info('foo length: ' + foo[0].length)
        if (foo && foo[0]) {
            if (bought && bought[0] && bought[0].totalSpend)
                foo[0].user.tokensSpent = bought[0].totalSpend;
            else
                foo[0].user.tokensSpent = 0;
            if (sold && sold[0] && sold[0].totalReceived)
                foo[0].user.tokensReceived = sold[0].totalReceived;
            else
                foo[0].user.tokensReceived = 0;
            miners.push(foo[0]);
        }

    }
    return miners;
}

async function getWallet(wallet) {
    // const dbConnect = dbo.getDb();
    const query = { "wallet": wallet.toLowerCase() };
    logger.info("Query at miner:getWallet");
    logger.info(query);

    const dbConnect = dbo.getDb();
    const walletDetail = dbConnect.collection("wallets").findOne(query)

    logger.info('resolved');
    logger.info(walletDetail);
    return walletDetail;
}

async function getWallets(query) {
    logger.info('miner:getWallets(query)')
    logger.info(query);
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
exports.getWallet = getWallet;
exports.getMinersByWallet = getMinersByWallet;