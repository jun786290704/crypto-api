const axios = require('axios');

const Web3 = require('web3');
const NODE_HTTP = process.env.NODE_HTTP;
const web3 = new Web3(NODE_HTTP);

const abi = require('../abi/abi');
const tokens = require('../tokens/controller');
const contracts = require('../contracts/contracts');

const dbo = require('../../db/conn');
const { logger } = require('../../logger/logger');
const dripContract = new web3.eth.Contract(abi.ABI_DRIP, "0xffe811714ab35360b67ee195ace7c10d93f89d8c");

async function getDripData() {
    let drip = {};
    // get PCS Price
    await tokens.getTokenPrice(contracts.contracts.dripToken, 'bsc').then(result=>{
        drip.PCSPrice = result.price;
    });

    await tokens.getTokenPrice("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 'bsc').then(result=>{
        // get BNB Price
        drip.BNBPrice = result.price;
    });

    // cheat and use the drip API
    await axios.get("https://api.drip.community/prices/").then(function(result) {
        let currentPrice = result.data[result.data.length-1];
        drip.dripPrice =currentPrice.value;
    })

  
    return drip;
  }
  
  function toDec18(num) {
    return num / 1000000000000000000;
  }

  exports.getDripData = getDripData;