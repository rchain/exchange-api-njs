const { ec } = require("elliptic");
const secp256k1 = new ec("secp256k1");
const { signDeploy, verifyDeploy } = require("@tgrospic/rnode-grpc-js");
require("..");
const key = secp256k1.genKeyPair();
// const key = '1bf36a3d89c27ddef7955684b97667c75454317d8964528e57b2308947b250b0'
const sampleRholangCode = "Nil";
const deployData = {
  term: sampleRholangCode,
  phloprice: 1,
  phlolimit: 10e3,
  validafterblocknumber: 0,
  tiemstamp: Date.now()
};
const deploy = signDeploy(key, deployData);
console.log("SIGNED DEPLOY", deploy);

const isValidDeploy = verifyDeploy(deploy);
console.log("DEPLOY IS VALID", isValidDeploy);
