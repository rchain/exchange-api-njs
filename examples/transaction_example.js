const { ec } = require("elliptic");
const secp256k1 = new ec("secp256k1");
const { RClient, VaultAPI, param } = require("..");
const { getAddrFromPrivateKey } = require("@tgrospic/rnode-grpc-js");
const {
  MAINNET_SERVER,
  READONLY_SERVER,
  TESTNET_OBSERVER,
  TESTNET_SERVER,
} = require("./server");

const blockHash =
  "8012e93f480d561045f1046d74f8cb7c31a96206e49dbdf15b22a636e18a4693";

async function main() {
  const client = new RClient(TESTNET_OBSERVER[0], 40401);
  client.configParam(param.TESTNET_TRANSFER_UNFOR);
  const transaction = await client.getTransaction(blockHash);
  console.log(transaction);
}

(async () => {
  await main();
})().catch((e) => {
  console.log(e);
});
