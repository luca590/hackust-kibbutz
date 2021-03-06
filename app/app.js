const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");

// Not to forget our built contract
const communityJson = require("../build/contracts/Community.json");

//mock db
var communities = [{
  name: "Education",
  member_amount: 20000,
  id: 0
}, {
  name: "Food",
  member_amount: 10000,
  id: 1
}]
var community_data = [{
  proposals: [
    {
      name: "Build a high school in Kinshasa",
      time: "1 day",
      raised: 50000,
      goal: 80000,
      voting_status: 50,
      id: 0
    },
    {
      name: "Provide new chairs and tables to a school in Cambodia	",
      time: "5 hours",
      raised: 3000,
      goal: 5000,
      voting_status: 60,
      id: 1
    },
    {
      name: "Research on magnetic waves",
      time: "2 weeks",
      raised: 80000,
      goal: 200000,
      voting_status: -250,
      id: 2
    },
  ],
  contributors: [
    {
      name: "Paul Jack",
      amount: 50000
    },
    {
      name: "James Ryan",
      amount: 25000
    },
    {
      name: "Anon",
      amount: 10000
    }
  ],
  icon: "http://smallbusinessbc.ca/wp-content/uploads/2015/04/icon-education.png",
  total_contribution: 1000000000,
  community_name: "Education"
},
{
  proposals: [],
  contributors: [],
  icon: "",
  total_contribution: 1000,
  community_name: "Food"
}]

var proposals = [];

communities.forEach(c => {
  proposals.push(c.proposals)
})

function change_raised(cid, pid, amount) {
  community_data[cid].proposals[pid].raised = amount + community_data[cid].proposals[pid].raised;
}

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
  // Use the Mist/wallet/Metamask provider.
  console.log("Using Mist/Wallet/Metamask");
  window.web3 = new Web3(web3.currentProvider);
} else {
  // Your preferred fallback.
  console.log("Using testRPC/geth");
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

const Community = truffleContract(communityJson);
Community.setProvider(web3.currentProvider);

var app = angular.module('App', ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "home.html",
      controller: "HomeController"
    })
    .when("/communities", {
      templateUrl: "communities.html",
      controller: "CommunitiesController"
    })
    .when("/communities/:id", {
      templateUrl: "community.html",
      controller: "CommunityController"
    })
    .when("/create_community", {
      templateUrl: "create_community.html",
      controller: "CreateCommunityController"
    })
    .when("/communities/:cid/:pid", {
      templateUrl: "proposal.html",
      controller: "ProposalController"
    })
});

app.controller("HomeController",
  ['$scope', function ($scope) {
    $scope.test = "Hello World";
  }]);


app.controller("ProposalController", function ($scope, $routeParams) {
  let pid = $routeParams.pid;
  let cid = $routeParams.cid;

  $scope.data = community_data;

  $scope.donate = function () {
    change_raised(cid, pid, $scope.donationAmount);
  }

  $scope.vote = function () {
    let voting_power = 5;
    if($scope.approve == "0"){
      communities[cid].proposals[pid].voting_status -= voting_power;
    }
    else{
      communities[cid].proposals[pid].voting_status += voting_power;
    }
  }

  $scope.name = $scope.data[cid].proposals[pid].name;
  $scope.time = $scope.data[cid].proposals[pid].time;
  $scope.raised = $scope.data[cid].proposals[pid].raised;
  $scope.goal = $scope.data[cid].proposals[pid].goal;
  $scope.id = $scope.data[cid].proposals[pid].id;
  $scope.voting_status = $scope.data[cid].proposals[pid].voting_status
})

app.controller("CommunityController", function ($scope, $routeParams) {
  let cid = $routeParams.id;
  $scope.data = community_data;

  $scope.createProposal = function () {
    community_data[cid].proposals.push({
      name: "Build a high school in Cambodia",
      time: "3 days",
      raised: 0,
      goal: 60000,
      id: 4
    })
  }

  $scope.proposals = $scope.data[cid].proposals;
  $scope.contributors = $scope.data[cid].contributors;
  $scope.total_contribution = $scope.data[cid].total_contribution;
  $scope.icon = $scope.data[cid].icon;
  $scope.community_name = communities[cid].name;
  $scope.member_amount = communities[cid].member_amount;
  $scope.id = cid;
})

app.controller("CommunitiesController", ['$scope', function ($scope) {
  $scope.communities = communities;

  $scope.createCommunity = function () {
    communities.push(
      {
        name: $scope.communityName,
        member_amount: 0,
        id: communities.length
      }
    )
  }
}]);

app.controller("CreateCommunityController", ['$scope', function ($scope) { }]);

app.controller("ProjectsController", ['$scope', function ($scope) {
  $scope.community = "Test Community";
  $scope.projects = [{
    name: "Build hospital",
    description: "Test 123",
    timeline: "2 years",
    budget: "1500 ETH",
    status: "VOTING"
  }, {
    name: "SOS Kinderdorf",
    description: "Test 123",
    timeline: "6 months",
    budget: "100 ETH",
    status: "APPROVED"
  }];

  var contract;
  Community.deployed().then(instance => {
    contract = instance;
    //$scope.address = contract.address;
  });

  $scope.getProjects = function () {
    console.log("klicked!");
    contract.proposals.call(0)
      .then(proposals => {
        console.log(proposals);
      });
  }

}]);
