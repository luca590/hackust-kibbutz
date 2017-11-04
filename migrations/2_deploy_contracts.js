var Community = artifacts.require("./Community.sol");

module.exports = function(deployer) {
  web3.eth.getAccounts(function(err, res) {
    deployer.deploy(Community);
  });
};
