const CREATE_VAULT_RHO_TPL = `new rl(\`rho:registry:lookup\`), RevVaultCh in {
  rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
  for (@(_, RevVault) <- RevVaultCh) {
    @RevVault!("findOrCreateVault", "$addr", Nil)
  }
}`;

const GET_BALANCE_RHO_TPL = `new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh, balanceCh in {
  rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
  for (@(_, RevVault) <- RevVaultCh) {
    @RevVault!("findOrCreate", "$addr", *vaultCh) |
    for (@(true, vault) <- vaultCh) {
      @vault!("balance", *balanceCh) |
      for (@balance <- balanceCh) {
        return!(balance)
      }
    }
  }
}
`;

const TRANSFER_RHO_TPL = `
new rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh, revVaultKeyCh, deployerId(\`rho:rchain:deployerId\`), stdout(\`rho:io:stdout\`), resultCh in {
  rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
  for (@(_, RevVault) <- RevVaultCh) {
    @RevVault!("findOrCreate", "$from", *vaultCh) |
    @RevVault!("deployerAuthKey", *deployerId, *revVaultKeyCh) |
    for (@(true, vault) <- vaultCh; key <- revVaultKeyCh) {
      @vault!("transfer", "$to", $amount, *key, *resultCh) |
      for (_ <- resultCh) { Nil }
    }
  }
}
`;

const TRANSFER_ENSURE_TO_RHO_TPL = `
new rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh, toVaultCh, deployerId(\`rho:rchain:deployerId\`), revVaultKeyCh, resultCh in {
  rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
  for (@(_, RevVault) <- RevVaultCh) {
    @RevVault!("findOrCreate", "$from", *vaultCh) |
    @RevVault!("findOrCreate", "$to", *toVaultCh) |
    @RevVault!("deployerAuthKey", *deployerId, *revVaultKeyCh) |
    for (@(true, vault) <- vaultCh; key <- revVaultKeyCh; @(true, toVault) <- toVaultCh) {
      @vault!("transfer", "$to", $amount, *key, *resultCh) |
      for (_ <- resultCh) { Nil }
    }
  }
}
`;

module.exports.TRANSFER_ENSURE_TO_RHO_TPL = TRANSFER_ENSURE_TO_RHO_TPL
module.exports.TRANSFER_RHO_TPL = TRANSFER_RHO_TPL

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
