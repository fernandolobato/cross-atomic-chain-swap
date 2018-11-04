BITCOIN="bitcoin-cli -regtest -rpcuser=someuser -rpcpassword=somepass -rpcport=8332 -datadir=/Users/fernandolobato/Desktop/"
NODEJS=/usr/local/bin/node;

CONTRACT=$(cat ./LockContract.json)
SECRET="thisIsASecret"

ALICE_BTC_ADDRESS=$(/bin/echo $CONTRACT | /usr/bin/env python3 -c 'import json, sys, decimal; data=json.load(sys.stdin); print(data["bitcoin"]["sender"]);');

TX=$($BITCOIN listunspent 1 100 '["'$ALICE_BTC_ADDRESS'"]')

ALICE_PRIVKEY=$($BITCOIN dumpprivkey $ALICE_BTC_ADDRESS)

RESULT=$($NODEJS ./createHTLC.js --contract "$CONTRACT" --senderPrivKey $ALICE_PRIVKEY --secret $SECRET --transaction "$TX")

DEPOSIT_TRANSACTION=$(/bin/echo $RESULT | /usr/bin/env python3 -c 'import json, sys, decimal; data=json.load(sys.stdin); print(data["depositTransaction"]["raw"]);');
REFUND_TRANSACTION=$(/bin/echo $RESULT | /usr/bin/env python3 -c 'import json, sys, decimal; data=json.load(sys.stdin); print(data["refundTransaction"]["raw"]);');





