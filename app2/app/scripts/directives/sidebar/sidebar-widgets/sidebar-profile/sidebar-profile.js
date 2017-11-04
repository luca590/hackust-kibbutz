'use strict';


angular.module('AniTheme')
	.directive('sidebarProfile',function(){
		return {
        templateUrl:'scripts/directives/sidebar/sidebar-widgets/sidebar-profile/sidebar-profile.html?v='+window.app_version,
        restrict: 'E',
        replace: true,
    	}
	});
