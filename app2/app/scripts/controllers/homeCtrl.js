'use strict';

/**
 * @ngdoc function
 * @name AniTheme.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of AniTheme
 */
angular.module('AniTheme').controller('HomeCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
  
  $scope.communities = [{
    name: "Education in Africa",
    desc: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
    image: "https://s-media-cache-ak0.pinimg.com/originals/00/f6/b7/00f6b7e6d734647c56904f77bda0992a.jpg",
    members: 153,
    total: "100,000 USD",
    id: 0
  },{
    name: "Sustainable Communes in Cambodia",
    desc: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
    image: "http://www.cambodianguide.com/images/dyimg/140128094626Cambodian%20rice.jpg",
    members: 23,
    total: "11,000 USD",
    id: 1
  }];

  $scope.setActive = function(id) {
    console.log("Set active", id);
    $scope.community = $scope.communities[id];
  }
  $scope.setActive(0);
  
}]);
