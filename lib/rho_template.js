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
        @vault!("transfer", "$toAddr", $amount, *key, *resultCh) |
        for (_ <- resultCh) { Nil }
      }
    }
  }
  `;


module.exports.TRANSFER_ENSURE_TO_RHO_TPL = TRANSFER_ENSURE_TO_RHO_TPL
module.exports.TRANSFER_RHO_TPL = TRANSFER_RHO_TPL
module.exports.GET_BALANCE_RHO_TPL = GET_BALANCE_RHO_TPL
module.exports.CREATE_VAULT_RHO_TPL = CREATE_VAULT_RHO_TPL