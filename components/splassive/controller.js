const axios = require('axios');

const Web3 = require('web3');
const chains = JSON.parse(process.env.NODE_CHAINS);

const avax = chains.find(element => element.label == 'avax');
const web3 = new Web3(avax.rpcURL);

const abi = require('../abi/abi');
const tokens = require('../tokens/controller');
const contracts = require('../contracts/contracts');

const dbo = require('../../db/conn');

//

const splassiveContract = new web3.eth.Contract(abi.ABI_SPLASSIVE, contracts.contracts.splassive);
const splashContract = new web3.eth.Contract(abi.ABI_SPLASSIVE, "0xf5ee7f00854a5f11d3a79e5fdf3619bbe1c896e7");

async function getSplassiveData() {
    let splassive = {};
    // get AVAX Price
    await tokens.getTokenPrice('0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'avax').then(result=>{
        splassive.avaxPrice = result.price;
    });

    // get AVAX Qty in pool
    await web3.eth.getBalance("0xf5ee7f00854a5f11d3a79e5fdf3619bbe1c896e7").then(result=> {
        splassive.avaxQty = toDec18(result);
    });

    // get SPLASH QTY
    await splassiveContract.methods.balanceOf("0xf5ee7f00854a5f11d3a79e5fdf3619bbe1c896e7").call(function(error,result) {
        console.log(result);  // 
        splassive.splashQty = toDec18(result);
        console.log(error);
    });


    // compute Splassive Price
    let avaxPool = splassive.avaxPrice * splassive.avaxQty;
    console.log(avaxPool);
    let splashPrice = avaxPool/splassive.splashQty;
    splassive.splashPrice = splashPrice;

    return splassive;
}

function toDec18(num) {
    return num / 1000000000000000000;
  }

exports.getSplassiveData = getSplassiveData

