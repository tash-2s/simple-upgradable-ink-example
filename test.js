const {
  instantiateContract,
  query,
  tx,
  getApiAndPair,
  getContract,
} = require("./utils.js");

const setup = async () => {
  const { api, pair } = await getApiAndPair();

  const dataContract = await instantiateContract(
    api,
    pair,
    "./data/target/ink/data.contract",
    [false]
  );

  const logicContract = await instantiateContract(
    api,
    pair,
    "./logic/target/ink/logic.contract",
    [dataContract.address.toString()]
  );

  const forwarderContract = await instantiateContract(
    api,
    pair,
    "./forwarder/target/ink/forwarder.contract",
    [logicContract.address.toString()]
  );

  await tx(pair, dataContract, "addAllowedAccount", [
    logicContract.address.toString(),
  ]);

  // test

  await tx(pair, forwarderContract, "doSomething", []);

  const r = await query(dataContract, "get", [], pair.address);
  console.log(r.toHuman());
};

// after logic modification...
const changeLogic = async () => {
  const { api, pair } = await getApiAndPair();

  const dataContractAddress =
    "5CGv9xu3ymKphVvCoTyrnY3U8vgFEwmw9bqrpMwSUndJFKfi";
  const oldLogicContractAddress =
    "5FBh4VXVnbpGp6e3jcu6bMJdHVWtK4JP6Ai96vo8Y7UX4qPx";
  const forwarderContractAddress =
    "5DAt9CikE8qLj82JmxXi7WYvyE64cfSDEruoukHsSwcbEuUy";

  const dataContract = getContract(
    api,
    "./data/target/ink/metadata.json",
    dataContractAddress
  );
  const forwarderContract = getContract(
    api,
    "./forwarder/target/ink/metadata.json",
    forwarderContractAddress
  );

  const newLogicContract = await instantiateContract(
    api,
    pair,
    "./logic/target/ink/logic.contract",
    [dataContract.address.toString()]
  );

  await tx(pair, dataContract, "addAllowedAccount", [
    newLogicContract.address.toString(),
  ]);
  await tx(pair, forwarderContract, "changeLogicAccountId", [
    newLogicContract.address.toString(),
  ]);
  await tx(pair, dataContract, "removeAllowedAccount", [
    oldLogicContractAddress,
  ]);

  // test

  await tx(pair, forwarderContract, "doSomething", []);

  const r = await query(dataContract, "get", [], pair.address);
  console.log(r.toHuman());
};

setup().catch(console.error).finally(process.exit);
// changeLogic().catch(console.error).finally(process.exit);
