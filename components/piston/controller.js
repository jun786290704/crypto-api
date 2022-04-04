const axios = require('axios');

const Web3 = require('web3');
const NODE_HTTP = process.env.NODE_HTTP;
const web3 = new Web3(NODE_HTTP);

const abi = require('../abi/abi');
const tokens = require('../tokens/controller');
const contracts = require('../contracts/contracts');

const dbo = require('../../db/conn');

async function getPistonData() {
    let piston = {};
    // get Piston/BUSD info
    await tokens.getLPPrice(contracts.contracts.pistonPool, 'bsc').then(result=>{
        //console.log(result);
        piston.PCSPrice = result.token1_reserve/result.token0_reserve;
        piston.price = piston.PCSPrice;
    });

    
    return piston;
  }
  
  function toDec18(num) {
    return num / 1000000000000000000;
  }

  exports.getPistonData = getPistonData;