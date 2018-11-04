const bitcore = require('bitcore-lib');

const network = bitcore.Networks.testnet

const newSwapLockScript = (senderAddress, recieverAddress, timeLock, secretHash) => {
    return bitcore.Script.empty()
    .add('OP_IF')
        .add('OP_SHA256')
        .add(secretHash)
        .add('OP_EQUALVERIFY')
        .add('OP_DUP')
        .add('OP_HASH160')
        .add(recieverAddress)
    .add('OP_ELSE')
        .add(bitcore.crypto.BN.fromNumber(Number(timeLock)).toScriptNumBuffer())
        .add('OP_CHECKLOCKTIMEVERIFY')
        .add('OP_DROP')
        .add('OP_DUP')
        .add('OP_HASH160')
        .add(senderAddress)
    .add('OP_ENDIF')
    .add('OP_EQUALVERIFY')
    .add('OP_CHECKSIG');
}

const toSatoshi = (x) => (x * (10 ** 8))

exports.newHashTimeLockedContract = (contract, senderPrivateKeyWIF, secretString, fundingTx) => {
    
    var senderPrivateKey = bitcore.PrivateKey.fromWIF(senderPrivateKeyWIF, network);
    var senderAddress = bitcore.crypto.Hash.sha256ripemd160(senderPrivateKey.toPublicKey().toBuffer())

    var secretHash = bitcore.crypto.Hash.sha256(Buffer.from(secretString))
    var reciever = bitcore.Address.fromString(contract.bitcoin.reciever).hashBuffer

    var lockingScript = newSwapLockScript(senderAddress, reciever, contract.bitcoin.timelock, secretHash)
    
    var p2shAddress = bitcore.Address.payingTo(lockingScript);

    var satoshis = parseInt(toSatoshi(fundingTx.amount))

    var depositTransaction = new bitcore.Transaction().from({
        txid: fundingTx.txid, 
        vout: Number(fundingTx.vout), 
        scriptPubKey: fundingTx.scriptPubKey,
        satoshis: Number(satoshis),
      })
      .to(p2shAddress, Number(satoshis) - 100000)
      .sign(senderPrivateKey);

    var refundTransaction = new bitcore.Transaction().from({
        txid: depositTransaction.id,
        vout: 0,
        scriptPubKey: lockingScript.toScriptHashOut(),
        satoshis: Number(satoshis) - 100000,
      })
      .to(senderPrivateKey.toAddress(), Number(satoshis) - 200000) 
      .lockUntilBlockHeight(Number(contract.bitcoin.timeLock));

      refundTransaction.inputs[0].sequenceNumber = 0;

      var senderSignature = bitcore.Transaction.sighash.sign(refundTransaction, senderPrivateKey, bitcore.crypto.Signature.SIGHASH_ALL, 0, lockingScript);

      refundTransaction.inputs[0].setScript(
        bitcore.Script.empty()
        .add(senderSignature.toTxFormat())
        .add(senderPrivateKey.toPublicKey().toBuffer())
        .add('OP_FALSE') 
        .add(lockingScript.toBuffer())
      );

      const result = {
          depositTransaction:  {
              txid: depositTransaction.id,
              raw: depositTransaction.serialize(true)
          },
          refundTransaction: {
            txid: refundTransaction.id,
            raw: refundTransaction.serialize(true)  
          },
          lockScript: lockingScript.toBuffer().toString('hex')
      }

      return result;
}

exports.spendHashTimeLockContract = (privateKeyWIF, secretString, prevTx, contract) => {
    
    var privateKey = bitcore.PrivateKey.fromWIF(privateKeyWIF, network);
    var secret = Buffer.from(secretString)

    var satoshis = parseInt(toSatoshi(prevTx.vout[0].value))

    const spendTransaction = new bitcore.Transaction().from({
        txid: prevTx.txid,
        vout: 0,
        scriptPubKey: prevTx.vout[0].scriptPubKey.hex,
        satoshis: Number(satoshis) - 100000,
      })
      .to(privateKey.toAddress(), Number(satoshis) - 200000)

    var rawScript = Buffer.from(contract.bitcoin.lockScript, 'hex')
    var script = new bitcore.Script(rawScript);
    
    const signature = bitcore.Transaction.sighash.sign(spendTransaction, privateKey, bitcore.crypto.Signature.SIGHASH_ALL, 0, script);

    spendTransaction.inputs[0].setScript(
        bitcore.Script.empty()
        .add(signature.toTxFormat())
        .add(privateKey.toPublicKey().toBuffer())
        .add(secret)
        .add('OP_TRUE') 
        .add(script.toBuffer())
      );

    const result = {
        spendTransaction: {
            txid: spendTransaction.id,
            raw: spendTransaction.serialize(true),
            script: script.toBuffer().toString('hex')
        }
    }

    return result
}

const isP2SH = (script) => script[0] == "OP_HASH160" && script[2] == "OP_EQUAL" && script[1].length == 40

const isHTCL = (script) => {
    
    return script.length && 
    script[0] == 'OP_IF' && 
    script[1] == 'OP_SHA256' &&
    script[2] == '32' && 
    script[3] &&
    script[4] == 'OP_EQUALVERIFY' &&
    script[5] == 'OP_DUP' && 
    script[6] == 'OP_HASH160' && 
    script[7] == '20' && 
    script[8] && 
    script[9] == 'OP_ELSE' && 
    script[10] && 
    script[11] && 
    script[12] == 'OP_NOP2' && 
    script[13] == 'OP_DROP'&& 
    script[14] == 'OP_DUP' && 
    script[15] == 'OP_HASH160' && 
    script[16] == '20' && 
    script[17] && 
    script[18] == 'OP_ENDIF' && 
    script[19] =='OP_EQUALVERIFY' && 
    script[20] == 'OP_CHECKSIG' 
}

exports.verifyHashTimeLockContract = (depositTransaction, htlcContract) => {
    
    var p2sh = depositTransaction.vout[0].scriptPubKey.asm.split(' ')
    var scriptHash = p2sh[1]

    var script = new bitcore.Script(Buffer.from(htlcContract.bitcoin.lockScript, 'hex'));        
    var tenativeScriptHash = bitcore.crypto.Hash.sha256ripemd160(script.toBuffer());

    var scriptData = script.toString().split(' ') 
    var recieverTransactionPublicKeyHash = scriptData[8]

    var reciverContractPublicKeyHash = '0x' + bitcore.Address.fromString(htlcContract.bitcoin.reciever).hashBuffer.toString('hex')

    locktime = parseInt(scriptData[11].substring(0, scriptData[11].length - 2))

    if (isP2SH(p2sh) && isHTCL(scriptData)) {
        
        if(scriptHash.toString('hex') == tenativeScriptHash.toString('hex')) { 
            
            if (recieverTransactionPublicKeyHash == reciverContractPublicKeyHash) { 
                
                if (depositTransaction.vout[0].value ==  htlcContract.bitcoin.amount) {
                    
                    if (locktime == htlcContract.bitcoin.timelock) {
                        return true
                    }
                }
            }
        }
    }

    return false

}   