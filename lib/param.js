
const hex2base64 = (hex) =>{
    const b = Buffer.from(hex, "hex")
    return b.toString('base64')
}
module.exports.MAINNET_TRANSFER_UNFOR = {
  sendsList: [],
  receivesList: [],
  newsList: [],
  exprsList: [],
  matchesList: [],

  unforgeablesList: [
    {
      gPrivateBody: {
        id: hex2base64(
          "72d0f333c719323406901bca34c2935e4d92c31402fa80a2c273422e923af550"
        ),
      },
    },
  ],
  bundlesList: [],
  connectivesList: [],
};

module.exports.TESTNET_TRANSFER_UNFOR = {
  unforgeablesList: [
    {
      gPrivateBody: {
        id: hex2base64(
          "72d0f333c719323406901bca34c2935e4d92c31402fa80a2c273422e923af550"
        ),
      },
    },
  ],
};
