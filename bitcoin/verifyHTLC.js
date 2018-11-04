'use strict';

const argparse = require('argparse');

const parser = new argparse.ArgumentParser({
  addHelp: true,
});


parser.addArgument(['--transaction'], {
    required: true,
    help: 'Transaction being verified.',
});

parser.addArgument(['--contract'], {
    require: true,
    help: 'Contract used to verify transaction.'
});

const args = parser.parseArgs();

args.contract = JSON.parse(args.contract)
args.transaction = JSON.parse(args.transaction)

const htlc = require('./hashTimeLockContract.js')

var result = htlc.verifyHashTimeLockContract(args.transaction, args.contract)

console.log(result)