const hexToBin = require('hex-to-binary');
const Block = require('./block');
const {GENESIS_BLOCK_INFO, MINE_RATE} = require('../config');
const {cryptoHash} = require('../utils');
describe('Block', () =>{
    const timestamp = 11222;
    const data= ["elloe",'ye'];
    const hash="0x100100";
    const previousHash = "0xeff43a";
    const difficulty = 3;
    const nonce = 1;
    const block = new Block({timestamp,data,hash,previousHash,difficulty,nonce});

    it('has timestamp,data,hash & previousHash', () =>{
        expect(block.timestamp).toEqual(timestamp);
        expect(block.data).toEqual(data);
        expect(block.hash).toEqual(hash);
        expect(block.previousHash).toEqual(previousHash);
        expect(block.difficulty).toEqual(difficulty);
        expect(block.nonce).toEqual(nonce);
          
    });
    describe('getGenesisBlock()',()=>{
        const genesisBlock = Block.getGenesisBlock();
        it('returns a Block instance',()=>{
            expect( genesisBlock instanceof Block).toBe(true);
        });
        it('has genesis_info',() =>{
            expect(genesisBlock).toEqual(GENESIS_BLOCK_INFO);
        });
    });
    describe('mineBlock()',() => {
        const previousBlock = Block.getGenesisBlock();
        const data = "0101010100001110";
        const minedBlock = Block.mineBlock({previousBlock,data});

        it('returns Block instance',() =>{
            expect( minedBlock instanceof Block).toBe(true);
        });

        it('sets `hash` of the previousBlock to be equal to `previousHash` of the minedBlock',() =>{
            expect(minedBlock.previousHash).toEqual(previousBlock.hash);
        });

        it('sets timestamp of the minedBlock',() =>{
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates correct `hash` based on the arguments provided',() =>{
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    previousBlock.hash,
                    minedBlock.timestamp,
                    minedBlock.difficulty,
                    minedBlock.nonce,
                    data));
        });
        it('creates `hash` with same number of leading zeros as the difficulty value',() => {
            expect(hexToBin(minedBlock.hash).substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });
        it('adjusts difficulty to one of the possible values of {`difficulty`+1,`difficulty`-1}',() => {
            const possibleDifficultyVals = [previousBlock.difficulty+1,previousBlock.difficulty-1];
            expect(possibleDifficultyVals.includes(minedBlock.difficulty)).toBe(true);
        });

    });
    describe('adjustDifficulty()',() => {
        it('increases the difficulty when the block is mined too quickly',() =>{
            expect(Block.adjustDifficulty({originalBlock:block,timestamp:block.timestamp + MINE_RATE - 100})).toEqual(difficulty+1);

        });
        it('decreases the difficulty when the block is mined too slowly',() =>{
           expect(Block.adjustDifficulty({originalBlock:block,timestamp:block.timestamp + MINE_RATE + 100})).toEqual(difficulty-1);
        });
        it('sets difficulty lower limit to 1',() =>{
            block.difficulty=-1;
            expect(Block.adjustDifficulty({originalBlock:block})).toEqual(1);
        });
    });
});