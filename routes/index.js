var express = require('express');
var router = express.Router();
const axios = require('axios');
const assert = require('assert');
const { MongoClient } = require('mongodb');
const URI = process.env.MONGO_CONNECTION;
const dbo = require('../db/conn');
const dbConnect = dbo.getDb();

const animalfarm = require('../components/animalfarm/controller');
const tokens = require('../components/tokens/controller')
const abi = require('../components/abi/abi');
const contracts = require('../components/contracts/contracts');
const beans = require('../components/beans/controller');
const cookedRice = require('../components/cookedrice/controller');
const { resourceLimits } = require('worker_threads');
const { default: Web3 } = require('web3');
const splassive = require('../components/splassive/controller');
const drip = require('../components/drip/controller');
const piston = require('../components/piston/controller');
const miner = require('../components/miner/controller');
const logger = require('../logger/logger').logger;


lp_contract = {}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/price', (req, res) => { // function left for someone who was using it
  lp_contract = {};
  tokens.getLPPrice(contracts.contracts.pigpool).then(value => {
    animalfarm.getPiggyBankData(contracts.contracts.piggybank).then(result => {
      lp_contract.truffleRate = toDec18(result.truffleRate);
      var data = {
        pigletPrice: formatter.format(result.pigletPrice),
        poolPrice: formatter.format(value.price),
        truffleRate: result.truffleRate
      }
      res.send(data);
    })
  })
});


router.get('/api/af/piggybank/', (req, res) => {
  lp_contract = {};
  data = {};
  tokens.getLPPrice(contracts.contracts.pigpool).then(value => {
    data = value;
    animalfarm.getPiggyBankData(contracts.contracts.piggybank).then(value => {
      data.piggyBankData = value;
      res.send(data);
    })
  });
});

router.get('/api/af/piggybank/:wallet', (req, res) => {
  lp_contract = {};
  data = {};
  tokens.getLPPrice(contracts.contracts.pigpool).then(value => {
    data = value;
    animalfarm.getPiggyBankData(contracts.contracts.piggybank).then(value => {
      data.piggyBankData = value;
      res.send(data);
    })
  });
});



router.get('/api/af/garden/', (req, res) => {
  logger.warn('DEPRICATED ROUTE - /api/garden');
  lp_contract = {};
  tokens.getLPPrice(contracts.contracts.gardenpool).then(value => {
    animalfarm.getGardenData(contracts.contracts.garden).then(gardenValue => {
      value.gardenData = gardenValue;
      res.send(value);
    })
  });
});

router.get('/api/af/garden/:wallet', (req, res) => {
  logger.warn('DEPRICATED ROUTE - /api/garden/wallet');
  lp_contract = {};
  tokens.getLPPrice(contracts.contracts.gardenpool).then(value => {
    animalfarm.getGardenData(contracts.contracts.garden).then(gardenValue => {
      value.gardenData = gardenValue;
      animalfarm.getGardenUserData(contracts.contracts.garden, req.params.wallet).then(gardenUserValue => {
        value.gardenData.user = gardenUserValue;
        //let secretSauce = (CONTRACTBAL*UINT256*EGGS-(EGGS*REWARDS))/REWARDS
        value.gardenData.user.marketEggs = toDec18(((value.gardenData.balance * 1000000000000000000) * value.gardenData.user.pendingSeeds -
          (value.gardenData.user.pendingSeeds * value.gardenData.user.pendingLp)) / value.gardenData.user.pendingLp)
        res.send(value);
      })
    })
  });
});

router.put('/api/af/gardenrecords/record', (req, res) => {
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("gardenrecords")
    .insertOne(req.body, function (err, result) {
      if (err) {
        res.status(400).send("Error Inserting Data");
      } else {
        logger.info('Added new record with id ${result.insertId}');
        res.status(204).send();
      }
    })
});

router.get('/api/af/gardenrecords/records', (req, res) => {
  logger.info('sending back garden records');
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("gardenrecords")
    .find({})
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error Fetching Data");
      } else {
        res.json(result);
      }
    })
});

router.get('/api/af/gardenrecords/records/:wallet', (req, res) => {
  //logger.info('sending back garden records');
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("gardenrecords")
    .find({ wallet: req.params.wallet })
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error Fetching Data");
      } else {
        res.json(result);
      }
    })
});

router.get('/api/af/gardenrecords/process', async (req, res) => {
  const query = { "records.gardenrecords": true };
  wallets = await animalfarm.getWallets(query);
  //logger.info('wallets');
  //logger.info(wallets);
  // foreach does not do async how oe would think :)
  for (const wallet of wallets) {
    //logger.info('loop map');
    //logger.info(wallet);
    await animalfarm.logWallet(wallet.wallet);
  }
  //logger.info('done');

  res.send('Complete');

});

router.get('/api/miners/:wallet', async (req, res) => {
  miner.getWallet(req.params.wallet).then(response => {
    logger.info('got wallet');
    logger.info(response);
    if (response && response.miners && response.miners.length>0) {
      logger.info(response);
    miner.getMinersByWallet(response).then(data => {
      logger.info(data);
      res.send(data);

    })

    } else {
      res.send([]);
    }
    
  })
})



  router.get('/api/miner/:minerLabel', (req, res) => {
    logger.info('miner route');
    miner.getMinerData(req.params.minerLabel).then(minerData => {
      console.log(minerData);
      res.send(minerData);
    })
  })

  router.get('/api/miner/:minerLabel/:wallet', (req, res) => {
    logger.info('route:  miner/label/wallet');
    let minerData = {};
    miner.getMinerData(req.params.minerLabel).then(response => {
      minerData = response;
      miner.getMinerUserData(req.params.minerLabel, req.params.wallet, true).then(userValue => {
        minerData.user = userValue;

        minerData.user.marketEggs = toDec18(((minerData.balance * 1000000000000000000) * minerData.user.pendingEggs -
          (minerData.user.pendingEggs * minerData.user.pendingRewards)) / minerData.user.pendingRewards);
        minerData.user.pendingRewardsUSD = minerData.user.pendingRewards * minerData.rewardToken.price;
        minerData.user.rewardsPerDayUSD = minerData.user.rewardsPerDay * minerData.rewardToken.price;
        res.send(minerData);
      })
    })
  })

  router.get('/api/beansrecords/process', async (req, res) => {
    const query = { "records.beansrecords": true };
    wallets = await animalfarm.getWallets(query);
    for (const wallet of wallets) {
      await beans.logWallet(wallet.wallet);
    }

    res.send('Complete');

  });

  router.get('/api/miners/records/process', async (req, res) => {
    logger.info('ROUTE /api/miners/records/process');
    // process all wallets and miners and log to db.  should be called via cron/curl
   
    const query = {miners: {$exists:true}};
    const wallets = await miner.getWallets(query);

    for (const wallet of wallets) {
      await miner.logWallet(wallet.wallet);
    }

    res.send('Complete');

  });

  router.get('/api/beansrecords/records/:wallet', (req, res) => {
    const dbConnect = dbo.getDb();
    dbConnect
      .collection("beansrecords")
      .find({ wallet: req.params.wallet })
      .toArray(function (err, result) {
        if (err) {
          res.status(400).send("Error Fetching Data");
        } else {
          res.json(result);
        }
      })
  });

  router.put('/api/af/wallet', (req, res) => {
    const dbConnect = dbo.getDb();
    dbConnect
      .collection("wallets")
      .insertOne(req.body, function (err, result) {
        if (err) {
          res.status(400).send("Error Inserting Data");
        } else {
          logger.info('Added new record with id ${result.insertId}');
          res.status(204).send();
        }
      })
  });

  router.get('/api/af/price/', (req, res) => {
    animalfarm.getAnimalFarmPrices().then(value => {
      res.send(value);
    })

  })

  router.get('/api/splassive/', (req, res) => {
    lp_contract = {};
    splassive.getSplassiveData().then(value => {
      res.send(value);
    });
  });

  router.get('/api/drip/', (req, res) => {
    lp_contract = {};
    drip.getDripData().then(value => {
      res.send(value);
    });
  });

  router.get('/api/piston/', (req, res) => {
    lp_contract = {};
    piston.getPistonData().then(value => {
      res.send(value);
    });
  });

  router.get('/api/token/:chain/:token', (req, res) => {
    logger.info('get token ')
    tokens.getTokenPrice(req.params.token, req.params.chain).then(value => {
      logger.info(value);
      res.send(value);
    })
  })

  router.get('/api/token/:token', (req, res) => {
    logger.info('get token ')
    tokens.getTokenPrice(req.params.token).then(value => {
      logger.info(value);
      res.send(value);
    })
  })




  router.get('/api/lp/:lp', (req, res) => {
    lp_contract = {};
    tokens.getLPPrice(req.params.lp).then(value => {
      res.send(value);
    });
  });


  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  function toDec18(num) {
    return num / 1000000000000000000;
  }



  module.exports = router;
