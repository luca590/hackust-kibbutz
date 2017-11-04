var app = angular.module('App', ["ngRoute"]);

app.config(function($routeProvider) {
  $routeProvider
  .when("/", {
    templateUrl: "home.html",
    controller: "HomeController"
  })
  .when("/communities", {
    templateUrl: "communities.html",
    controller: "CommunityController"
  })
});

app.controller("HomeController", 
  [ '$scope', function($scope) {
      $scope.test = "Hello World";
}]);

app.controller("CommunityController", [ '$scope', function($scope) {
    $scope.communities = [{
	name: "Test1"
    }, {
	name: "Test2"
    }];
}]);
