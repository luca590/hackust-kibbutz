let Community = artifacts.require("Community");

// TODO

// Found here https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
  var transactionReceiptAsync;
  interval = interval ? interval : 500;
  transactionReceiptAsync = function(txnHash, resolve, reject) {
    try {
      var receipt = web3.eth.getTransactionReceipt(txnHash);
      if (receipt == null) {
        setTimeout(function () {
          transactionReceiptAsync(txnHash, resolve, reject);
        }, interval);
      } else {
        resolve(receipt);
      }
    } catch(e) {
      reject(e);
    }
  };

  return new Promise(function (resolve, reject) {
      transactionReceiptAsync(txnHash, resolve, reject);
  });
};

// Found here https://gist.github.com/xavierlepretre/afab5a6ca65e0c52eaf902b50b807401
var getEventsPromise = function (myFilter, count) {
  return new Promise(function (resolve, reject) {
    count = count ? count : 1;
    var results = [];
    myFilter.watch(function (error, result) {
      if (error) {
        reject(error);
      } else {
        count--;
        results.push(result);
      }
      if (count <= 0) {
        resolve(results);
        myFilter.stopWatching();
      }
    });
  });
};

// Found here https://gist.github.com/xavierlepretre/d5583222fde52ddfbc58b7cfa0d2d0a9
var expectedExceptionPromise = function (action, gasToUse) {
    return new Promise(function (resolve, reject) {
	try {
	    resolve(action());
	} catch(e) {
	    reject(e);
	}
    })
	.then(function (txn) {
	    return web3.eth.getTransactionReceiptMined(txn);
	})
        .then(function (receipt) {
	    // We are in Geth
	    assert.equal(receipt.gasUsed, gasToUse, "should have used all the gas");
	})
        .catch(function (e) {
	    let errMsg = e + "";
	    if (errMsg.indexOf("invalid JUMP") > -1 || errMsg.indexOf("invalid opcode") > -1) {
		// We are in TestRPC
	    } else {
		throw e;
	    }
	});
};

contract('Community', (accounts) => {
    let creator = accounts[0];
    let proposer = accounts[1];
    let member0 = accounts[2];
    let deposit0 = 100000;
    let member1 = accounts[3];
    let deposit1 = 200000;
    let member2 = accounts[4];
    let deposit2 = 150000;

    let budget0 = 200000;
    let duration = 3;

    describe("Constructor Tests", () => {
	return Community.new({from: creator});
    });

    describe("Test Set 1", () => {
	let contract;

	beforeEach(() => {
	    return Community.new(duration, {from: creator})
		.then(instance => {
		    contract = instance;
		    return contract.deposit({from: member0, value: deposit0});
		})
		.then(txn => {
		    return contract.deposit({from: member1, value: deposit1});
		})
	    	.then(txn => {
		    return contract.deposit({from: member2, value: deposit2});
		});
	});

	it('should registered the members', () => {
	    return contract.members(member0)
		.then(instance => {
		    assert.equal(instance[1].toNumber(), deposit0);
		    return contract.members(member1);
		}).then(instance => {
		    assert.equal(instance[1].toNumber(), deposit1);
		});
	});

	it('should have available funds', () => {
	    return contract.availableFunds.call()
		.then(funds => {
		    assert.equal(funds.toNumber(), deposit0+deposit1+deposit2);
		})
	});
	

	it('should create new successful proposal', () => {
	    let origAvailFunds;
	    return contract.createProposal(budget0, proposer, {from: proposer})
		.then(proposal => {
		    return contract.approveProposal(0, false, {from: member0});
		})
		.then(txn => {
		    return contract.approveProposal(0, true, {from: member1});
		})
	    	.then(txn => {
		    return contract.availableFunds.call();
		})
		.then(funds => {
		    origAvailFunds = funds;
		    return contract.confirmProposal(0, {from: proposer});
		})
		.then(txn => {
		    return contract.availableFunds.call();
		})
		.then(funds => {
		    assert.equal(funds, origAvailFunds-budget0);
		});
	});

	it('should create new unsuccessful proposal', () => {
	    let origAvailFunds;
	    return contract.createProposal(budget0, proposer, {from: proposer})
		.then(proposal => {
		    return contract.approveProposal(0, false, {from: member0});
		})
		.then(txn => {
		    return contract.approveProposal(0, false, {from: member1});
		})
	    	.then(txn => {
		    return contract.availableFunds.call();
		})
		.then(funds => {
		    origAvailFunds = funds;
		    return contract.confirmProposal(0, {from: proposer});
		})
		.then(txn => {
		    return contract.availableFunds.call();
		})
		.then(funds => {
		    assert.equal(funds, origAvailFunds);
		});
	});


    });
});
