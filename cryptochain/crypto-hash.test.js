const cryptoHash = require('./crypto-hash');

describe('CryptoHash',() =>{
    const phrase = "Luke, I'm your father";
    const phraseHash = "02cca9994a1247f7f1ebf265d4807e2ea644e149810334dc9fb7aac7123728d9";
    it('gives sha-256 hash of the arguments provided', () =>{
        expect(cryptoHash(phrase)).toEqual(phraseHash);
    });

    it('generates the same hash regardless of the order of the arguments given',() =>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('one','three','two'));
    })
});