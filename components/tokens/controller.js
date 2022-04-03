const axios = require('axios');
const coingecko = require('coingecko-api');

const Web3 = require('web3');
const NODE_HTTP = process.env.NODE_HTTP;
const web3 = new Web3(NODE_HTTP);

const abi = require('../abi/abi');

const chains = JSON.parse(process.env.NODE_CHAINS);

const geckoClient = new coingecko();

var Contract_LP = new web3.eth.Contract(abi.ABI_LP, "0xba6418100db9b93356bfb6a472411fdcfa2e4141");
var PCS_API = "https://api.pancakeswap.info/api/v2/tokens/";

async function getLPPrice(contractAddress) {
    var Contract_LP = new web3.eth.Contract(abi.ABI_LP, contractAddress);
  
    let results = await Promise.all([
      Contract_LP.methods.totalSupply().call(function (error, result) {
        if (error) { console.log(error); return false; };
        lp_contract.supply = toDec18(result);
      }),
      Contract_LP.methods.getReserves().call(function (error, result) {
        if (error) { console.log(error); return false; };
        lp_contract.token0_reserve = toDec18(parseInt(result._reserve0));
        lp_contract.token1_reserve = toDec18(parseInt(result._reserve1));
      }),
      Contract_LP.methods.token0().call(function (error, result) {
        if (error) { console.log(error); return false; };
      }),
      Contract_LP.methods.token1().call(function (error, result) {
        if (error) { console.log(error); return false; };
      })
    ]);
  
    await Promise.all([
      axios.get(PCS_API + results[2])
          .then(res => {
            lp_contract.token0_price = parseFloat(res.data.data.price);
            lp_contract.token0_name = res.data.data.name;
          }),
          axios.get(PCS_API + results[3])
          .then(res => {
            lp_contract.token1_price = parseFloat(res.data.data.price);
            lp_contract.token1_name = res.data.data.name;
          })
          .catch(error => {
            console.error("ERROR!" + error)
          })
    ]);
  
    lp_contract.lp_ratio = 1 / lp_contract.supply;
    lp_contract.price = (lp_contract.token0_reserve * lp_contract.lp_ratio * lp_contract.token0_price)
        + (lp_contract.token1_reserve * lp_contract.lp_ratio * lp_contract.token1_price);
    lp_contract.value = (lp_contract.token0_price * lp_contract.token0_reserve) + (lp_contract.token1_price * lp_contract.token1_reserve)
  
    return lp_contract;
  }


  async function getTokenPrice(contractAddress, chainId) {
    let tokenData = {};
    let chain = {};
    let rpc;
    if (chainId) {
        chain = chains.find(element => element.label == chainId);
        rpc = chain.priceURL;
    } else 
        chain.label = 'pcs'

    if (chain.label == 'avax') {
        await geckoClient.coins.fetchCoinContractInfo(contractAddress, 'avalanche').then(result => {
            tokenData.price = result.data.market_data.current_price.usd;
            tokenData.symbol = result.data.symbol;
            tokenData.name = result.data.name;
        });
    } else  { // old routes did not require the chain
        await axios.get(PCS_API + contractAddress).then(res => {
            tokenData = res.data.data;
            tokenData.price = parseFloat(tokenData.price);
            tokenData.price_BNB = parseFloat(tokenData.price_BNB);
          })
          .catch(error=>{
              console.log('boom');
              return 404;
          })
    }
    return tokenData;
  }

  function toDec18(num) {
    return num / 1000000000000000000;
  }

  exports.getLPPrice = getLPPrice;
  exports.getTokenPrice = getTokenPrice;