const { ec } = require("elliptic");
const { getAddrFromPrivateKey,verifyRevAddr } = require("@tgrospic/rnode-grpc-js");
const secp256k1 = new ec("secp256k1");

// generate key pair
const key = secp256k1.genKeyPair();

// generate key from hex string
const key2 = secp256k1.keyFromPrivate(
  "ff2ba092524bafdbc85fa0c7eddb2b41c69bc9bf066a4711a8a16f749199e5be"
);

// generate key from list of numbers
const key3 = secp256k1.keyFromPrivate([1, 2, 3]);

// generate rev address and eth address from  key pair
const addr = getAddrFromPrivateKey(key.getPrivate("hex"));
console.log(addr);

// verify if the rev address is a valid rev address
verifyRevAddr(addr.revAddr)
