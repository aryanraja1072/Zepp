const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
//const path = require('path');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubnub');

const DEFAULT_PORT = 3000;
let PEER_PORT;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const app = express();
const blockchain = new Blockchain();
const pubSub = new PubSub({blockchain});

const syncChain = () => {
    request({url:`${ROOT_NODE_ADDRESS}\api\blocks`}, (error,response,body) => {
        if(!error && response.statusCode === 200){
            const rootChain =  JSON.parse(body);
            
            blockchain.replaceChain(rootChain);
        }
    });
};

app.use(bodyParser.json());
app.use(express.static(__dirname+"/client/dist/"))

app.get('/api/blocks',function(req,res){
    return res.json(blockchain.chain);
});
app.post('/api/mine',function(req,res){
    const {data} = req.body;
    blockchain.addBlock({data});
    pubSub.broadCastChain();
    res.redirect('/api/blocks');
});
app.get('*', (req,res) => {
    res.sendFile('/client/dist/index.html',{root:'.'});
});
if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT,function(){
    console.log(`Server Started. Listening at http:\\\\localhost:${PORT}.`);
    
    if(PORT !== DEFAULT_PORT){
    console.log(`Chain sync initiated on a peer node.`);
    syncChain();
    }
});