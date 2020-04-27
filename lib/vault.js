
const {CREATE_VAULT_RHO_TPL, GET_BALANCE_RHO_TPL, TRANSFER_RHO_TPL, TRANSFER_ENSURE_TO_RHO_TPL} = require('./rho_template')

const TRANSFER_PHLO_LIMIT = 1000000;
const TRANSFER_PHLO_PRICE = 1;
module.exports = class VaultAPI {
  constructor(client) {
    this.client = client;
  }

  async getBalance(revAddr) {
    const term = GET_BALANCE_RHO_TPL.replace("$addr", revAddr);
    const resp = await this.client.exploratoryDeploy(term);
    const balance = resp.result.postblockdataList[0].exprsList[0].gInt;

    return balance;
  }

  async transfer(fromAddr, toAddr, amount, key) {
    const term = TRANSFER_RHO_TPL.replace("$from", fromAddr)
      .replace("$to", toAddr)
      .replace("$amount", amount);
    const timestamp = Date.now();
    const deployId = await this.client.deployWithAfterVABNFilled(
      key,
      term,
      TRANSFER_PHLO_PRICE,
      TRANSFER_PHLO_LIMIT,
      timestamp
    );
    return deployId;
  }

  async transferEnsure(fromAddr, toAddr, amount, key) {
    const term = TRANSFER_ENSURE_TO_RHO_TPL.replace("$from", fromAddr)
      .replace("$to", toAddr)
      .replace("$amount", amount);
    const timestamp = Date.now();
    const resp = await this.client.deployWithAfterVABNFilled(
      key,
      term,
      TRANSFER_PHLO_PRICE,
      TRANSFER_PHLO_LIMIT,
      timestamp
    );
    return resp;
  }

  async createVault(addr, key) {
    const term = CREATE_VAULT_RHO_TPL.replace("$addr", addr);
    const timestamp = Date.now();
    const resp = await this.client.deployWithAfterVABNFilled(
      key,
      term,
      TRANSFER_PHLO_PRICE,
      TRANSFER_PHLO_LIMIT,
      timestamp
    );
    return resp;
  }
};
