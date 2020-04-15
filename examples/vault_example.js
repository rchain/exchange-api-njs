const { ec } = require("elliptic");
const secp256k1 = new ec("secp256k1");
const { RClient, VaultAPI } = require("..");
const { getAddrFromPrivateKey } = require("@tgrospic/rnode-grpc-js");
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

async function main() {
  const client = new RClient(TESTNET_OBSERVER[0], 40401);
  const vault = new VaultAPI(client);
  const addr = getAddrFromPrivateKey(key.getPrivate("hex"));
  const toAddr = getAddrFromPrivateKey(key2.getPrivate("hex"));
  const randAddr = getAddrFromPrivateKey(key3rand.getPrivate("hex"));
  const randAddr2 = getAddrFromPrivateKey(key4rand.getPrivate("hex"));
  const balance = await vault.getBalance(addr.revAddr);
  console.log(balance);

  const Tclient = new RClient(TESTNET_SERVER[0], 40401);
  const vaultT1 = new VaultAPI(Tclient);
  const deploy = await vaultT1.transfer(
    addr.revAddr,
    toAddr.revAddr,
    10000,
    key
  );
  console.log(deploy);

  const T2client = new RClient(TESTNET_SERVER[1], 40401);
  const vaultT2 = new VaultAPI(T2client);
  const deploy2 = await vaultT2.transferEnsure(
    addr.revAddr,
    toAddr.revAddr,
    10,
    key
  );
  console.log(deploy2);

  const T3client = new RClient(TESTNET_SERVER[2], 40401);
  const vaultT3 = new VaultAPI(T3client);
  const deploy3 = await vaultT3.createVault(randAddr2.revAddr, key);
  console.log(deploy3);
}

(async () => {
  await main();
})().catch((e) => {
  console.log(e);
});
