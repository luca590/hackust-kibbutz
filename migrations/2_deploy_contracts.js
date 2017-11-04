var Community = artifacts.require("./Community.sol");

module.exports = function(deployer) {
  deployer.then(() => {
    return deployer.deploy(Community, 10);
  }).then(() => {
    return Community.deployed();
  })
};
