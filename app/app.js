var app = angular.module('App', ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "home.html",
      controller: "HomeController"
    })
    .when("/communities", {
      templateUrl: "communities.html",
      controller: "CommunityController"
    })
    .when("/communities/0", {
      templateUrl: "education.html",
      controller: "EducationController"
    })
    .when("/communities/1", {
      templateUrl: "food.html",
      controller: "FoodController"
    })
    .when("/create_community", {
      templateUrl: "create_community.html",
      controller: "CreateCommunityController"
    })
    .when("proposals", {
      templateUrl: "proposal.html",
      controller: "ProposalController"
    })
});

app.controller("HomeController",
  ['$scope', function ($scope) {
    $scope.test = "Hello World";
  }]);

app.controller("FoodController", ['$scope', function ($scope) {
  $scope.communities = [{}]
}])

app.controller("EducationController", ['$scope', function ($scope) {
  $scope.proposals = [
    {
      name: "Build a high school in Kinshasa",
      time: "1 day",
      raised: 50000,
      goal: 80000,
      id: 0,
    },
    {
      name: "Provide new chairs and tables to a school in Cambodia	",
      time: "5 hours",
      raised: 3000,
      goal: 5000,
      id: 1
    },
    {
      name: "Research on magnetic waves",
      time: "2 weeks",
      raised: 80000,
      goal: 200000,
      id: 2
    },
  ]
  $scope.contributors = [
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
    ]
  $scope.icon = "http://smallbusinessbc.ca/wp-content/uploads/2015/04/icon-education.png"
  $scope.total_contribution = 1500000000
}])

app.controller("CommunityController", ['$scope', function ($scope) {
  $scope.communities = [{
    name: "Education",
    member_amount: 20000,
    id: 0
  }, {
    name: "Food",
    member_amount: 10000,
    id: 1
  }];
}]);

app.controller("CreateCommunityController", ['$scope', function ($scope) { }]);
