require(['angular', 'mango-3.0/maDashboardApp', 'jquery',
         'bootstrap', 'angular-ui-router', 'oclazyload', 'angular-loading-bar', 'angular-bootstrap',
         'metisMenu'],
         function(angular, maDashboardApp, $) {

'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 */
angular.module('sbAdminApp', [
    'oc.lazyLoad',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'maDashboardApp'
  ])
  .run(['$rootScope', '$state', function($rootScope, $state) {
	  $rootScope.Math = Math;

	  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
		  if (error.status === 403) {
			  $state.go('login');
		  }
	  });
	  
  }])
  .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider',
      function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {

    $ocLazyLoadProvider.config({
      debug:false,
      events:true,
    });

    $urlRouterProvider.otherwise('/dashboard/home');

    $stateProvider
      .state('dashboard', {
        url:'/dashboard',
        templateUrl: 'views/dashboard/main.html',
        resolve: {
        	auth: ['$rootScope', 'User', function($rootScope, User) {
        		$rootScope.user = User.current();
        		return $rootScope.user.$promise;
        	}],
        	translations: ['$rootScope', 'User', function($rootScope, User) {
        		$rootScope.user = User.current();
        		return $rootScope.user.$promise;
        	}],
            loadMyDirectives: function($ocLazyLoad) {
                return $ocLazyLoad.load(
                {
                    name:'sbAdminApp',
                    files:[
                    'scripts/directives/header/header.js',
                    'scripts/directives/header/header-notification/header-notification.js',
                    'scripts/directives/sidebar/sidebar.js',
                    'scripts/directives/sidebar/sidebar-search/sidebar-search.js',
                    'scripts/directives/sidebar/sidebar-date-controls/sidebar-date-controls.js'
                    ]
                }),
                $ocLazyLoad.load(
                {
                   name:'toggle-switch',
                   files:["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                          "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                      ]
                }),
                $ocLazyLoad.load(
                {
                  name:'ngAnimate',
                  files:['bower_components/angular-animate/angular-animate.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngCookies',
                  files:['bower_components/angular-cookies/angular-cookies.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngResource',
                  files:['bower_components/angular-resource/angular-resource.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngSanitize',
                  files:['bower_components/angular-sanitize/angular-sanitize.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngTouch',
                  files:['bower_components/angular-touch/angular-touch.js']
                })
            }
        }
    })
      .state('dashboard.home',{
        url:'/home',
        controller: 'MainCtrl',
        templateUrl:'views/dashboard/home.html',
        resolve: {
          loadMyFiles:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'sbAdminApp',
              files:[
              'scripts/controllers/main.js',
              'scripts/directives/timeline/timeline.js',
              'scripts/directives/notifications/notifications.js',
              'scripts/directives/chat/chat.js',
              'scripts/directives/dashboard/stats/stats.js'
              ]
            })
          }
        }
      })
      .state('dashboard.form',{
        templateUrl:'views/form.html',
        url:'/form'
    })
      .state('dashboard.blank',{
        templateUrl:'views/pages/blank.html',
        url:'/blank'
    })
      .state('login', {
        templateUrl: 'views/pages/login.html',
        url: '/login',
        resolve: {
        	deps: ['$ocLazyLoad', function($ocLazyLoad) {
        		return $ocLazyLoad.load('scripts/directives/login/login.js');
        	}]
        }
    })
    .state('dashboard.examples', {
    	'abstract': true,
    	url: '/examples',
    	template: '<ui-view/>',
    	resolve: {
            loadMyFile: ['$ocLazyLoad', function($ocLazyLoad) {
            	return $ocLazyLoad.load({
            		name: 'ace.js',
            		files:['bower_components/ace-builds/src-min-noconflict/ace.js']
            	}).then(function() {
            		return $ocLazyLoad.load({
                		name: 'ui.ace',
                		files:['bower_components/angular-ui-ace/ui-ace.min.js']
                	});
            	}).then(function() {
            		return $ocLazyLoad.load(
            			['scripts/directives/liveEditor/liveEditor.js',
            			 'scripts/directives/liveEditor/livePreview.js',
            			 'scripts/directives/liveEditor/dualPaneEditor.js',]
                	);
            	});
            }]
        }
    })
    .state('dashboard.examples.toggle', {
        templateUrl:'views/toggle.html',
        url:'/toggle'
    })
    .state('dashboard.examples.serialChart',{
        templateUrl:'views/serialChart.html',
        url:'/serialChart'
    })
    .state('dashboard.thermal', {
    	'abstract': true,
    	url: '/thermal',
    	template: '<ui-view/>'
    })
    .state('dashboard.thermal.mdf', {
        templateUrl:'views/thermal/mdf.html',
        url:'/mdf'
    })
    .state('dashboard.electric', {
    	'abstract': true,
    	url: '/electric',
    	template: '<ui-view/>'
    })
    .state('dashboard.electric.total', {
        templateUrl:'views/electric/total.html',
        url:'/total'
    })
      .state('dashboard.table',{
        templateUrl:'views/table.html',
        url:'/table'
    })
      .state('dashboard.panels-wells',{
          templateUrl:'views/ui-elements/panels-wells.html',
          url:'/panels-wells'
      })
      .state('dashboard.buttons',{
        templateUrl:'views/ui-elements/buttons.html',
        url:'/buttons'
    })
      .state('dashboard.notifications',{
        templateUrl:'views/ui-elements/notifications.html',
        url:'/notifications'
    })
      .state('dashboard.typography',{
       templateUrl:'views/ui-elements/typography.html',
       url:'/typography'
   })
      .state('dashboard.icons',{
       templateUrl:'views/ui-elements/icons.html',
       url:'/icons'
   })
      .state('dashboard.grid',{
       templateUrl:'views/ui-elements/grid.html',
       url:'/grid'
   });
}]);

angular.element(document).ready(function() {
	angular.bootstrap(document.documentElement, ['sbAdminApp']);
});

});
