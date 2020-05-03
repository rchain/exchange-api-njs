# exchange-api-njs

## Introduction

Nodejs-based api RChain RNode RPC.

## Install

    npm install --save-dev grpc-tools protobufjs
    npm install --save git://github.com/rchain/exchange-api-njs.git#exchange 

## Examples

The features below are provided.

1. [generate private key and public key](./examples/key_example.js)
2. [sign a deploy with the private key](./examples/sign_and_verify_example.js)
3. [use grpc api to interact with rnode](./examples/grpc_api_example.js)
4. [Vault Api of rchain to do transfer and check balance](./examples/vault_example.js)
5. [Get transaction info from block event data](./examples/transaction_example.js)
