const Blockchain = require('../blockchain');
const blockchain = new Blockchain();
let times=[];
let average,timeDiff,prevTimeStamp,nextTimeStamp;
blockchain.addBlock({data:'Temp-Transaction'});
for(let i=1;i<=10000;i++){
    prevTimeStamp = blockchain.getLastBlock().timestamp;
    blockchain.addBlock({data: `block no: ${i}`});
    nextTimeStamp = blockchain.getLastBlock().timestamp;
    timeDiff = nextTimeStamp - prevTimeStamp;
    times.push(timeDiff);
    average = times.reduce((total,num) =>(total+num),0)/times.length;
    console.log(`Time to mine block:${timeDiff}. Avg Time:${average}. Difficulty:${blockchain.getLastBlock().difficulty}`);

}