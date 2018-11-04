BITCOIN="bitcoin-cli -regtest -rpcuser=someuser -rpcpassword=somepass -rpcport=8332 -datadir=/Users/fernandolobato/Desktop/"
NODEJS=/usr/local/bin/node;


CONTRACT=$(cat ../LockContract.json)

TXID=$(/bin/echo $CONTRACT | /usr/bin/env python3 -c 'import json, sys, decimal; data=json.load(sys.stdin); print(data["bitcoin"]["transactionId"]);');
RAWTX=$($BITCOIN getrawtransaction $TXID)
TX=$($BITCOIN decoderawtransaction $RAWTX)


BOB_ADDR=$(/bin/echo $CONTRACT | /usr/bin/env python3 -c 'import json, sys, decimal; data=json.load(sys.stdin); print(data["bitcoin"]["reciever"]);');

PRIV_KEY=$($BITCOIN dumpprivkey $BOB_ADDR)

SECRET="thisIsASecret"
    
RESULT=$($NODEJS ./spendHTLC.js --recieverPrivKey $PRIV_KEY --secret $SECRET --prevTx "$TX" --contract "$CONTRACT")


#RESULT=$($NODEJS ./verify.js --transaction "$TX" --contract "$CONTRACT")

