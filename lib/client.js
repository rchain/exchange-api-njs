const ec = require("elliptic");
const { rnodeDeploy, signDeploy } = require("@tgrospic/rnode-grpc-js");
const protoSchema = require("./rnode-grpc-gen/js/pbjs_generated.json");
const grpc = require("@grpc/grpc-js");
// require("../lib/rnode-grpc-gen/js/DeployServiceV1_pb");

// interface Transaction {
//   fromAddr: string
//   toAddr: string
//   amount: number
//   retUnforgeable: Par
//   success?: Boolean
//   reason?: string
// }

module.exports = class RClient {
  constructor(host, port, options) {
    this.host = host;
    this.port = port;
    this.grpcOptions = {
      grpcLib: grpc,
      host: this.host + ":" + this.port,
      protoSchema,
    };
    this.deployService = rnodeDeploy(this.grpcOptions);
  }

  configParam(transferTem) {
    this.transferTem = transferTem;
  }

  async exploratoryDeploy(term) {
    const resp = await this.deployService.exploratoryDeploy({ term: term });
    return resp;
  }

  async getBlocks(depth) {
    const resp = await this.deployService.getBlocks({ depth: depth });
    return resp;
  }

  async getBlock(blockHash) {
    const resp = await this.deployService.getBlock({ hash: blockHash });
    return resp;
  }

  async deploy(
    key,
    term,
    phloPrice,
    phloLimit,
    validAfterBlockNumber,
    timestamp
  ) {
    const signedDeploy = signDeploy(key, {
      term: term,
      phloprice: phloPrice,
      phloLimit: phloLimit,
      validafterblocknumber: validAfterBlockNumber,
      timestamp: timestamp,
    });
    const resp = await this.deployService.doDeploy(signedDeploy);
    return resp.result;
  }

  async deployWithAfterVABNFilled(key, term, phloPrice, phloLimit, timestamp) {
    const lastestBlocks = await this.getBlocks(1);
    // assert(lastestBlocks.length >= 1, "No latest block found");
    const latestBlock = lastestBlocks[0];
    const latestBlockNumber = latestBlock.blockinfo.blocknumber;
    return await this.deploy(
      key,
      term,
      phloPrice,
      phloLimit,
      latestBlockNumber,
      timestamp
    );
  }

  async findDeploy(deployId) {
    const resp = await this.findDeploy({ deployId: deployId });
    return resp;
  }
  async lastFinalizedBlock() {
    const resp = await this.deployService.lastFinalizedBlock();
    return resp;
  }
  async isFinalized(blockHash) {
    const resp = await this.deployService.isFinalized({ hash: blockHash });
    return resp;
  }
  async getBlocksByHeights(startBlockNumber, endBlockNumber) {
    const resp = await this.deployService.getBlocksByHeights(
      startBlockNumber,
      endBlockNumber
    );
    return resp;
  }
  async getEventData(blockHash) {
    const resp = await this.deployService.getEventByHash({
      hash: blockHash,
    });
    return resp;
  }

  async getTransaction(blockHash) {
    if (this.transferTem && typeof this.transferTem !== "undefined") {
      const resp = await this.getEventData(blockHash);
      var transactions = [];
      resp.result.deploysList.forEach((deploy) => {
        if (deploy.reportList.length === 2) {
        } else if (deploy.reportList.length === 3) {
          const precharge = deploy.reportList[0];
          const user = deploy.reportList[1];
          const refund = deploy.reportList[2];
          transactions = findTransferComm(user, this.transferTem)
        }
      })
      return transactions;
    }
  }
};

function findTransferComm(report, transferTemplateUnforgeable) {
  const transfers = [];
  const transactions = [];
  report.eventsList.forEach((event) => {
    if (typeof event.comm !== "undefined" && event) {
      const channel = event.comm.consume.channelsList[0];
      if (
        channel.unforgeablesList.length >0 &&
        channel.unforgeablesList[0].gPrivateBody.id ===
        transferTemplateUnforgeable.unforgeablesList[0].gPrivateBody.id
      ) {
        transfers.push(event);
        const fromAddr =
          event.comm.producesList[0].data.parsList[0].exprsList[0].gString;
        const toAddr =
          event.comm.producesList[0].data.parsList[2].exprsList[0].gString;
        const amount =
          event.comm.producesList[0].data.parsList[3].exprsList[0].gInt;
        const ret = event.comm.producesList[0].data.parsList[5];
        transactions.push({
          fromAddr: fromAddr,
          toAddr: toAddr,
          amount: amount,
          retUnforgeable: ret,
        });
      }
    }
  });
  transactions.forEach((transaction) => {
    report.eventsList.forEach((event) => {
      if (typeof event.produce !== "undefined" && event) {
        const channel = event.produce.channel;
        if (
          channel.unforgeablesList.length > 0 &&
          channel.unforgeablesList[0].gPrivateBody.id ==
          transaction.retUnforgeable.unforgeablesList[0].gPrivateBody.id
        ) {
          const data = event.produce.data;
          const result =
            data.parsList[0].exprsList[0].eTupleBody.psList[0].exprsList[0]
              .gBool;
          const reason = result
            ? ""
            : data.parsList[0].exprsList[0].eTupleBody.psList[1].exprsList[0]
            .gString;
          transaction.success = result;
          transaction.reason = reason;
        }
      }
    });
  });
  return transactions;
}
