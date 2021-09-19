const { readFileSync } = require("fs");
const { WsProvider, ApiPromise } = require("@polkadot/api");
const { CodePromise, ContractPromise } = require("@polkadot/api-contract");
const { Keyring } = require("@polkadot/keyring");
const { cryptoWaitReady } = require("@polkadot/util-crypto");

const instantiateNewContract = async (
  keyringPair,
  api,
  contractJson,
  initValue
) => {
  const code = new CodePromise(api, contractJson);

  const endowment = 1000000000n * 1000000n;
  const gasLimit = 200000n * 1000000n;

  const contract = await new Promise(async (resolve) => {
    const unsub = await code.tx
      .new(endowment, gasLimit, initValue)
      .signAndSend(keyringPair, (result) => {
        if (result.status.isInBlock || result.status.isFinalized) {
          unsub();
          resolve(result.contract);
          return;
        }
        // should handle failure here
      });
  });

  return contract;
};

const getContract = (api, contractJson, address) =>
  new ContractPromise(api, contractJson, address);

const main = async () => {
  const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  const api = await ApiPromise.create({
    provider: wsProvider,
  });

  await cryptoWaitReady();
  const keyring = new Keyring({ ss58Format: 42, type: "sr25519" });
  const alicePair = keyring.addFromUri("//Alice");

  const contractJson = readFileSync("./data/target/ink/data.contract", "utf8");

  const data = await instantiateNewContract(alicePair, api, contractJson, true);
  console.log(data.address.toString());

  // const data = getContract(
  //   api,
  //   contractJson,
  //   "5Ff5LcqNym56A5t1XMNsr7YeJH8bRpzSNJDQrfTJdAP12b1S"
  // );

  const { gasConsumed, result, output } = await data.query.get(
    alicePair.address,
    {
      value: 0,
      gasLimit: -1,
    }
  );

  console.log(
    gasConsumed.toBigInt(),
    result.isOk ? output.toHuman() : result.asErr.toHuman()
  );
};

main().catch(console.error); //.finally(process.exit);
