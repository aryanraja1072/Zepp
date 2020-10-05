const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../utils');
describe('Transaction',() => {
    let transaction,senderWallet,recipient,amount;
    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recepient-public-key';
        amount = 50;
        transaction = new Transaction({senderWallet,recipient,amount});
    });

    it('has an `id`',() => {
            expect(transaction).toHaveProperty('id');
    });
    describe('outputMap',() => {
        it('has an `outputMap`',() => {
            expect(transaction).toHaveProperty('outputMap');
        });
        it('outputs amount to the `recipient`',() => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });
        it('outputs the remaining balance for the `senderWallet`',() => {
            expect(transaction.outputMap[senderWallet.publicKey])
            .toEqual(senderWallet.balance - amount);
        });
    });
    describe('input',() => {
        it('has an `input`',() => {
            expect(transaction).toHaveProperty('input');
        });
        it('has `timestamp` in the input',() => {
            expect(transaction.input).toHaveProperty('timestamp');
        });
        it('sets `amount` in the input to the `senderWallet` balance',() => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });
        it('sets `address` in the input to `senderWallet` publicKey ',() => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });
        it('signs the input',() => {
            expect(
                verifySignature({
                    publicKey:senderWallet.publicKey,
                    data:transaction.outputMap,
                    signature:transaction.input.signature
                })
            ).toBe(true);
        });
        
    });
    describe('isValidTransaction()', () => {
        describe('when the transaction is valid',() => {
            it('returns true',() =>{
                expect(Transaction.isValidTransaction(transaction)).toBe(true);
            });
        });
        describe('when the transaction is invalid',() =>{
            describe('when transaction outputMap value is invalid',() => {
                it('returns false', () => {
                    transaction.outputMap[senderWallet.publicKey] = 1212121;
                    expect(Transaction.isValidTransaction(transaction)).toBe(false);
                });
            });
            describe('when transaction input has an invalid signature',() => {
                it('returns false', () => {
                    transaction.input.signature = (new Wallet()).sign('Dummy-Data');
                    expect(Transaction.isValidTransaction(transaction)).toBe(false);
                });
            });
            
        });
        
    });
    describe('update()',  () => {
        let originalSignature,originalSenderOutput,nextRecipient,nextAmount;
        describe('and the amount is invalid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({
                        senderWallet,
                        recipient:'foo-bar',
                        amount:121212
                    }); 
                })
                .toThrow('Amount Exceeds Balance');
            });
        });
        describe('and the amount is valid',() => {
            beforeEach(() => {
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                originalSignature = transaction.input.signature;
                nextRecipient = 'Next-Recipient';
                nextAmount = 50;
    
                transaction.update(
                    {senderWallet,
                    recipient:nextRecipient,
                    amount:nextAmount}
                    );
                
            });
            it('outputs amount to the next recipient',() => {
                expect(transaction.outputMap[nextRecipient]).toEqual(amount);
            });
            it('subtracts the amount from the original sender output amount',() => {
                expect(transaction.outputMap[senderWallet.publicKey]).
                toEqual(originalSenderOutput-nextAmount);
            });
            it('maintains the total output that matches the input amount',() => {
                expect(
                    Object.values(transaction.outputMap)
                    .reduce((total,amt) => total+amt))
                    .toEqual(transaction.input.amount);
                
            });
            it('re-signs the transaction',() => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });
            describe('and another update for the same recipient',() => {
                let addedAmount;
                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update(
                        {senderWallet,
                        recipient:nextRecipient,
                        amount:addedAmount});

                });
                it('adds to recipient amount', () =>{
                    expect(transaction.outputMap[nextRecipient])
                    .toEqual(nextAmount + addedAmount);
                });
                it('subtracts the amount from the original sender output amount',() => {
                    expect(transaction.outputMap[senderWallet.publicKey]).
                    toEqual(originalSenderOutput-nextAmount-addedAmount);
                });
            });
        });
        
        
    });
});