# Bitcoin and Ethereum Cross Atomic Chain Swaps

## Work in progress!!

This repo contains the tools to exchange assets across the Bitcoin and Ethereum blockchains between two parties in an intractive and decentralized manner.

This repo contains:

The required tools to perform a cross atomic chain swap between the Ethereum and Bitcoin blockchain. For a more detailed explanation on Swaps, you can read this blog post.

We use the ethereum Web3 provider to interact with an Ethereum full node and Bitcore library to interact with a Bitcoin full node. You can connect to any Ethereum client (geth or parity)
to perform this on MainNet or any etherum testnet (...). For Bitcoin we interact directly with bitcoind, there is an alternate version interacting with btcd in the future.

The contract to perform the Swap in Ethereum is a library to perform Hash Time Lock Contracts for Ethereum. See More Here.

In the bitcoin side we use a simple script inspired on BIP-199 to perform the Hash Time Lock Contract. You can also perform this using nay Ethereum local network (testrpc or ganache) and bitcoin in regtest mode.

If you want to run it locally downlaod Ganache for Ethereum and Use this Bitcoin docker image.

How to use:



# Prerequisites:

    ## Bitcoin:

        

    ## Ethereum:


Workflow:

    First get bitcoind running:

        docker-compose up!

        $ BITCOIN="docker run bitcoin-cli -params "
        $ NODE="/path/exec"
    
    For Ganache:

        $ ethereum_commands.js
    

    Alice and Bob have a BTC and ETH address, create one on both blockchains:

    Alice Testnet: 
        BTC: mjJ5wHeLYyNcERUgT7imQVvYU7mzAMcD6w
        ETH: 

    Bob Testnet:
        BTC: mu8gJj8abXv2LaKmsqEDp3RSvwJHuixPnj

    Alice and Bob somehow agree on a 10 : 1 exchange rate BTC ETH. 

    Alice makes the following BTC Transaction:

        (using the following SCRIPT)

    Alice also sends the transaction to Bob, who verifies it, timestamp and amounts check.

    Bob blocks his funds in the Ethereum blockchain sending 10 ether to the following contract:

        HASHTIMELOCK in the following transaction (Get the receipt)

    PUM!

    Alice claims the Money in this transaction:

    Bob claims the Money using that hash in the bitcoin blockchain.

    They walk away.


    