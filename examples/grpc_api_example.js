const { RClient } = require("..");
const { ec } = require("elliptic");
const assert = require("assert").strict;
const secp256k1 = new ec("secp256k1");
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

const blockHash =
  "0a826ff9f1e8020d663e29e52768c2714f171b48e8ab84ee93a29fa87a9a409c";
const term = "@1!(2)";

const exploratory_term = 'new return in{return!("a")}';

const deployID = '30440220057f2a3f2d02b9cf42002a3dd56dba2eac9c83d200e1606e6607fac79f388a6d02204528c8fba9a49d0323fd4bae1ae005d790453d7e4e4b3f09a93b49c0e95285e7'

async function main () {
  var client = new RClient(TESTNET_OBSERVER[0], 40401);

  //get the latest 10 block in the rnode
  var blockInfos = await client.getBlocks(10);
  console.log("get blockInfos");
  assert.equal(blockInfos.length, 10);
  //# get the detailed info in the rnode
  var blockInfo = await client.getBlock(blockHash);
  console.log("get block ");
  assert.equal(blockInfo.blockinfo.blockinfo.blockhash, blockHash);

  // last finalized block
  const finalized = await client.lastFinalizedBlock()
  // confirm if a block is finalized
  assert(await client.isFinalized(blockHash));
  console.log("is finalized");

  // get blocks from blockNumber 10 to blockNumber 20
  var blockInfosAtHeights = await client.getBlocksByHeights(10, 20);
  console.log("get blocks by heights");

  // find block info by the deployId
  var blockByDeployId = await client.findDeploy(deployId)

  var result = await client.exploratoryDeploy(exploratory_term);
  assert.equal(result.result.postblockdataList[0].exprsList[0].gString, "a");
  console.log("exploratory deploy");

  var testNetClient = new RClient(TESTNET_SERVER[0], 40401);
  var deploy = await testNetClient.deploy(
    key,
    term,
    1,
    100000,
    1000,
    Date.now()
  );
  console.log("testnet deploy");
  console.log(deploy);
  var deploy2 = await testNetClient.deployWithAfterVABNFilled(
    key,
    term,
    1,
    100000,
    Date.now()
  );
  console.log(deploy2);
}

(async () => {
  await main();
})().catch((e) => {
  console.log(e);
});
