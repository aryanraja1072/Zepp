const cryptoHash = require('./crypto-hash');

describe('CryptoHash',() =>{
    const phrase = "Luke, I'm your father";
    const phraseHash = "adcf1094b4d395cef7d675ad1a0bef54c19faf9e668f331f9d87b0d0f222a53b";
    it('gives sha-256 hash of the arguments provided', () =>{
        expect(cryptoHash(phrase)).toEqual(phraseHash);
    });
    it('generates the same hash regardless of the order of the arguments given',() =>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('one','three','two'));
    });
    it('outputs different hash when the properties of an input changes',() => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['field1'] = 'bar';
        expect(cryptoHash(foo)).not.toEqual(originalHash);
    });

});