const Block = require('./block');
const {GENESIS_BLOCK_INFO} = require('./config');
const cryptoHash = require('./crypto-hash');
describe('Block', () =>{
    const timestamp = '11222';
    const data= ["elloe",'ye'];
    const hash="0x100100";
    const previousHash = "0xeff43a";
    const block = new Block({timestamp,data,hash,previousHash});

    it('has timestamp,data,hash & previousHash', () =>{
        expect(block.timestamp).toEqual(timestamp);
        expect(block.data).toEqual(data);
        expect(block.hash).toEqual(hash);
        expect(block.previousHash).toEqual(previousHash);
          
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
            expect(minedBlock.hash).toEqual(cryptoHash(previousBlock.hash,minedBlock.timestamp,data));
        });

    });
});