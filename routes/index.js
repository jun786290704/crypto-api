var express = require('express');
var router = express.Router();
const axios = require('axios');

const animalfarm = require('../components/animalfarm/controller');
const tokens = require('../components/tokens/controller')
const abi = require('../components/abi/abi');
const contracts = require('../components/contracts/contracts');

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
        res.send(value);
      })
    })
  });
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
