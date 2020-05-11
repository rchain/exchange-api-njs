const { ec } = require("elliptic");
const secp256k1 = new ec("secp256k1");
const { RClient, VaultAPI, template } = require("..");
const { getAddrFromPrivateKey, signDeploy } = require("@tgrospic/rnode-grpc-js");
const {
  MAINNET_SERVER,
  READONLY_SERVER,
  TESTNET_OBSERVER,
  TESTNET_SERVER,
} = require("./server");

const key = secp256k1.keyFromPrivate(
  "ff4566482c3df328256a503e4f99df4a0a120c12523293546284f1ef30d7cf4b",
  "hex"
);

const key2 = secp256k1.keyFromPrivate(
  "5329d598b0bd84c20c6c6be0adaf9860c013aa502ad2514421407dd21cf7cb02",
  "hex"
);

const key3rand = secp256k1.genKeyPair();
const key4rand = secp256k1.genKeyPair();


async function main () {
  var client = new RClient(TESTNET_OBSERVER[0], 40401);

  //get the latest block number
  const lastestBlocks = await client.getBlocks(1);
  const latestBlock = lastestBlocks[0];
  const latestBlockNumber = latestBlock.blockinfo.blocknumber;

  // sign and transfer
  const fromAddr = getAddrFromPrivateKey(key.getPrivate("hex"));
  const toAddr = getAddrFromPrivateKey(key.getPrivate("hex"));
  const amount = 100000
  const contract = template.TRANSFER_ENSURE_TO_RHO_TPL.replace("$from", fromAddr)
    .replace("$toAddr", toAddr)
    .replace("$to", toAddr)
    .replace("$amount", amount);
  const phloPrice = 1
  const phloLimit = 50000
  const timestamp = Date.now()
  const signedDeploy = signDeploy(key, {
    term: contract,
    phloprice: phloPrice,
    phlolimit: phloLimit,
    validafterblocknumber: latestBlockNumber,
    timestamp: timestamp,
  });


  // send the signed deploy to the network
  const resp = await client.deployService.doDeploy(signedDeploy)
  console.log(`send deploy ${resp}`)
  // remember to close your client when you are done to save resource
  client.closeClient()
}

(async () => {
  await main();
})().catch((e) => {
  console.log(e);
});
