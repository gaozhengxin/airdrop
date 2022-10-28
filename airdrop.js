const Web3 = require('web3');
require('dotenv').config();
const { BloomFilter } = require('bloom-filters');
const fs = require('fs');

const web3 = new Web3(Web3.givenProvider || process.env.RPC);

var account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

var filter = {};
var amount = '10000000000000000'; // 0.01

function addToFilter(ele) {
    filter.add(ele);
    let exportedFilter = filter.saveAsJSON();
    fs.writeFile('filter.json', JSON.stringify(exportedFilter), console.error);
}

function init() {
    fs.readFile('filter.json', 'utf8', (err, exportedFilter) => {
        if (err) {
            console.log(err);
            filter = BloomFilter.create(1000, 0.0001);
            console.log('created new filter');
        } else {
            filter = BloomFilter.fromJSON(JSON.parse(exportedFilter));
            console.log('loaded filter');
        }
        console.log(err);
    });

    console.log('airdrop started');
}

function airdrop(addr) {
    if (filter.has(addr)) {
        console.log('already has');
    } else {
        web3.eth.sendTransaction({
            from: account.address,
            to: addr,
            value: amount
        }).on('confirmation', function (confirmationNumber, receipt) {
            addToFilter(addr);
            console.log(`airdrop to ${addr}`);
        })
    }
}

process.on('message', (addr) => {
    console.log('CHILD got message:', addr);
    airdrop(addr);
});

module.exports = {
    init: init
};