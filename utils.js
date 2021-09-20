const { readFileSync } = require("fs");
const { WsProvider, ApiPromise } = require("@polkadot/api");
const { CodePromise, ContractPromise } = require("@polkadot/api-contract");
const { Keyring } = require("@polkadot/keyring");
const { cryptoWaitReady } = require("@polkadot/util-crypto");

exports.instantiateContract = async (
  api,
  pair,
  contractFileName,
  constructorArgs
) => {
  const contractJson = readFileSync(contractFileName, "utf8");

  const code = new CodePromise(api, contractJson);

  const endowment = 1000000000n * 1000000n;
  const gasLimit = 200000n * 1000000n;

  const contract = await new Promise(async (resolve) => {
    const unsub = await code.tx
      .new(endowment, gasLimit, ...constructorArgs)
      .signAndSend(pair, (result) => {
        if (result.status.isInBlock) {
          unsub();
          if (result.findRecord("system", "ExtrinsicSuccess")) {
            console.log(
              `contract instantiated: ${contractFileName} ${result.contract.address.toString()}`
            );
            resolve(result.contract);
            return;
          } else {
            reject(`contract instantiation error: ${contractFileName}`);
            return;
          }
        }
      });
  });

  return contract;
};

exports.getContract = (api, metadataFileName, address) => {
  const metadataJson = readFileSync(metadataFileName, "utf8");
  return new ContractPromise(api, metadataJson, address);
};

exports.query = async (contract, fnName, fnArgs, caller) => {
  const { gasConsumed, result, output } = await contract.query[fnName](
    caller,
    { value: 0, gasLimit: -1 },
    ...fnArgs
  );
  if (result.isOk) {
    console.log(
      `query success: ${fnName} (gasConsumed: ${gasConsumed.toBigInt()}), returned: ${output.toHuman()}`
    );
    return output;
  } else {
    throw new Error(`query error: ${fnName}, error: ${result.asErr.toHuman()}`);
  }
};

exports.tx = async (pair, contract, fnName, fnArgs) => {
  await new Promise(async (resolve, reject) => {
    if (!contract.tx[fnName]) {
      reject(`tx fn not found: ${fnName}`);
      return;
    }
    const unsub = await contract.tx[fnName](
      { value: 0, gasLimit: 100000n * 1000000n },
      ...fnArgs
    ).signAndSend(pair, (result) => {
      if (result.status.isInBlock) {
        unsub();
        if (result.findRecord("system", "ExtrinsicSuccess")) {
          console.log(`tx success: ${fnName}`);
          resolve();
          return;
        } else {
          reject(`tx error: ${fnName}`);
          return;
        }
      }
    });
  });
};

exports.getApiAndPair = async () => {
  const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  const api = await ApiPromise.create({
    provider: wsProvider,
  });

  await cryptoWaitReady();
  const keyring = new Keyring({ ss58Format: 42, type: "sr25519" });
  const pair = keyring.addFromUri("//Alice");

  return { api, pair };
};
