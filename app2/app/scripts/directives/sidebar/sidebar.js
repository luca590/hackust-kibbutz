'use strict';

angular.module('AniTheme')
	.directive('sidebar',function(){
		return {
        templateUrl:'scripts/directives/sidebar/sidebar.html?v='+window.app_version,
        restrict: 'E',
        replace: true,

        controller: function($scope){

			setTimeout(function(){
    			$('.sidenav-outer').perfectScrollbar();
			}, 100);
			
    	}
   

	}
});
