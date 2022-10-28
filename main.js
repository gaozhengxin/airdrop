const Web3 = require('web3');
require('dotenv').config();
const web3 = new Web3(Web3.givenProvider || process.env.PRIVATE_KEY);

async function scan(start, checkLog) {
    console.log('scanner started');
    while (true) {
        var end = await web3.eth.getBlockNumber();
        end = end - start > 2000 ? start + 2000 : end;
        console.log(`start : ${start}, end : ${end}`);

        web3.eth.getPastLogs({
            fromBlock: start,
            toBlock: end,
            address: [
                '0x4f3aff3a747fcade12598081e80c6605a8be192f' // router
            ],
            topics: ['0xaac9ce45fe3adf5143598c4f18a369591a20a3384aedaf1b525d29127e1fcd55'] // LogSwapin
        })
            .then(checkLog)
            .catch(console.error);
        start = end;
        setTimeout(() => { }, 300);
    }
}

const address = [
    '0xd69b31c3225728cc57ddaf9be532a4ee1620be51',
    '0xe3eeda11f06a656fcaee19de663e84c7e61d3cac'
];

function checkLog(events, callback) {
    events.map((event) => {
        let token = web3.utils.toHex(web3.utils.BN(event.topics[2]));
        if (address.includes(token)) {
            let addr = web3.utils.toHex(web3.utils.BN(event.topics[3]));
            callback(addr);
        }
    })
}

async function main(start) {
    var airdrop = require(`${__dirname}/airdrop.js`);
    airdrop.init();
    const cp = require('child_process');
    const airdrop_process = cp.fork(`${__dirname}/airdrop.js`);

    scan(start, (events) => {
        checkLog(events, (addr) => {
            airdrop_process.send(addr);
        })
    });
}

main(34890000);