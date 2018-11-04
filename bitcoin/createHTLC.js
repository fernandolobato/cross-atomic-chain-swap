'use strict';

const argparse = require('argparse');

const parser = new argparse.ArgumentParser({
  addHelp: true,
});

parser.addArgument(['--contract'], {
    required: true,
    help: 'Timelock for contract (blocknumber or timestamp)',
});

parser.addArgument(['--senderPrivKey'], {
  required: true,
  help: 'Private Key of transaction sender.',
});

parser.addArgument(['--secret'], {
    required: true,
    help: 'Timelock for contract (blocknumber or timestamp)',
});

parser.addArgument(['--transaction'], {
  required: true,
  help: 'Previous transaction to reference.',
});

const args = parser.parseArgs();
args.transaction = JSON.parse(args.transaction)[0]
args.contract = JSON.parse(args.contract)

const htlc = require('./hashTimeLockContract.js')

var contract = htlc.newHashTimeLockedContract(args.contract, args.senderPrivKey, args.secret, args.transaction);

console.log(JSON.stringify(contract, null, 2));