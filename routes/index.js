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
const { resourceLimits } = require('worker_threads');

lp_contract = {}

/* GET home page. */
router.get('/', function(req, res, next) {
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
    animalfarm.getPiggyBankData(contracts.contracts.piggybank).then(value=> {
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
    animalfarm.getPiggyBankData(contracts.contracts.piggybank).then(value=> {
      data.piggyBankData = value;
      res.send(data);
    })
  });
});



router.get('/api/af/garden/', (req, res) => {
  lp_contract = {};
  tokens.getLPPrice(contracts.contracts.gardenpool).then(value => {
    animalfarm.getGardenData(contracts.contracts.garden).then(gardenValue => {
      value.gardenData = gardenValue;
      res.send(value);
    })
  });
});

router.get('/api/af/garden/:wallet', (req, res) => {
  lp_contract = {};
  tokens.getLPPrice(contracts.contracts.gardenpool).then(value => {
    animalfarm.getGardenData(contracts.contracts.garden).then(gardenValue => {
      value.gardenData = gardenValue;
      animalfarm.getGardenUserData(contracts.contracts.garden, req.params.wallet).then(gardenUserValue => {
        value.gardenData.user = gardenUserValue;
        //let secretSauce = (CONTRACTBAL*UINT256*EGGS-(EGGS*REWARDS))/REWARDS
        value.gardenData.user.marketEggs = toDec18(((value.gardenData.balance*1000000000000000000)*value.gardenData.user.pendingSeeds-
            (value.gardenData.user.pendingSeeds*value.gardenData.user.pendingLp))/value.gardenData.user.pendingLp)
        res.send(value);
      })
    })
  });
});

router.put('/api/af/gardenrecords/record', (req, res) => {
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("gardenrecords")
    .insertOne(req.body, function(err, result) {
        if (err) {
            res.status(400).send("Error Inserting Data"); 
        } else {
          console.log('Added new record with id ${result.insertId}');
            res.status(204).send();
        }
    })
});

router.get('/api/af/gardenrecords/records', (req, res) => {
  console.log('sending back garden records');
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

router.get('/api/af/gardenrecords/process', async (req, res) => {
  wallets = await animalfarm.getWallets();
  //console.log('wallets');
  //console.log(wallets);
    // foreach does not do async how oe would think :)
    for (const wallet of wallets) {
      //console.log('loop map');
      //console.log(wallet);
      await animalfarm.logWallet(wallet.wallet);
    }
    //console.log('done');

    res.send('Complete');

});

router.get('/api/beans/:wallet', (req, res) => {
  lp_contract = {};
    let value = {};
    beans.getBeansData(contracts.contracts.beans).then(beansValue => {
      value.beansData = beansValue;
      beans.getBeansUserData(contracts.contracts.beans, req.params.wallet).then(beansUserValue => {
        value.beansData.user = beansUserValue;
        //let secretSauce = (CONTRACTBAL*UINT256*EGGS-(EGGS*REWARDS))/REWARDS
        value.beansData.user.marketEggs = toDec18(((value.beansData.balance*1000000000000000000)*value.beansData.user.pendingEggs-
            (value.beansData.user.pendingEggs*value.beansData.user.pendingRewards))/value.beansData.user.pendingRewards);
        value.beansData.user.pendingRewardsUSD = value.beansData.user.pendingRewards * value.beansData.bnb;
        value.beansData.user.rewardsPerDayUSD = value.beansData.user.rewardsPerDay * value.beansData.bnb;
        res.send(value);
      })
    })
  });


router.put('/api/af/wallet', (req, res) => {
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("wallets")
    .insertOne(req.body, function(err, result) {
        if (err) {
            res.status(400).send("Error Inserting Data"); 
        } else {
          console.log('Added new record with id ${result.insertId}');
            res.status(204).send();
        }
    })
});

router.get('/api/af/price/', (req, res) => {
  animalfarm.getAnimalFarmPrices().then(value => {
    res.send(value);
  })

})

router.get('/api/token/:token', (req, res) => {
  console.log('get token ')
  tokens.getTokenPrice(req.params.token).then(value => {
    console.log(value);
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
