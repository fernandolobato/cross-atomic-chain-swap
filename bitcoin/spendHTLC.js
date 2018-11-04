'use strict';

const argparse = require('argparse');

const parser = new argparse.ArgumentParser({
  addHelp: true,
});

parser.addArgument(['--recieverPrivKey'], {
  required: true,
  help: 'Private Key of transaction sender.',
});

parser.addArgument(['--secret'], {
    required: true,
    help: '',
});

parser.addArgument(['--prevTx'], {
    required: true,
    help: '',
});

parser.addArgument(['--contract'], {
  required: true,
  help: '',
});

const args = parser.parseArgs();
args.prevTx = JSON.parse(args.prevTx)
args.contract = JSON.parse(args.contract)

const htlc = require('./hashTimeLockContract.js')

var result = htlc.spendHashTimeLockContract(args.recieverPrivKey, args.secret, args.prevTx, args.contract);

console.log(JSON.stringify(result, null, 2));