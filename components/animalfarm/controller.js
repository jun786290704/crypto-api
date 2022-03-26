const axios = require('axios');

const Web3 = require('web3');
const web3 = new Web3("https://late-delicate-bush.bsc.quiknode.pro/dcaa02475fb30815fe3558ad3360b234c806ff0d/");

const abi = require('../abi/abi');
const tokens = require('../tokens/controller');

const AF_RATIO = 2592000 // used for both piggybank and garden



async function getGardenData(contractAddress) {
    var seeds = 50000;
    var contract = new web3.eth.Contract(abi.ABI_GARDEN, contractAddress);
    let results = await Promise.all([
    contract.methods.getBalance().call(function(error, result){}),
    contract.methods.calculateSeedSell(2592000).call(function(error,result){}),
    contract.methods.calculateSeedSell(seeds).call(function(error,result){}),
    
    ]);
    let lpPerDay = 0;
    
    let lpPerPlant = toDec18(results[1]*.95);
    return({
        balance: toDec18(results[0]),
        lpPerPlant: lpPerPlant,
        costPerPlant: lpPerPlant*lp_contract.price,
    })
  }
  
  async function getGardenUserData(contractAddress, wallet) {
    var contract = new web3.eth.Contract(abi.ABI_GARDEN, contractAddress);
    let totalPlants = 0;
    await contract.methods.hatcheryPlants(wallet).call().then(result=> {
      totalPlants = parseInt(result);
    });
    
    await  contract.methods.calculateSeedSell(totalPlants*86400).call().then(result => {
        lpPerDay = toDec18(result*.95);
      })
  
      return ({
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
  
    await contract.methods.getBalance().call(function(error, result){
      piggyBankData.balance = toDec18(result);
    }),
    await contract.methods.calculateTruffleSell(AF_RATIO).call(function(error,result){
      piggyBankData.pigletPrice = toDec18(lp_contract.price * result);
      piggyBankData.truffleRate = toDec18(result);
    })
    
    return(piggyBankData);
  }

  function toDec18(num) {
    return num / 1000000000000000000;
  }

  exports.getGardenData = getGardenData;
  exports.getGardenUserData = getGardenUserData;
  exports.getAnimalFarmPrices = getAnimalFarmPrices;
  exports.getPiggyBankData = getPiggyBankData;