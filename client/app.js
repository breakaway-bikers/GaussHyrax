angular.module('gaussHyrax', ['ngAnimate', 'ui.router',
'gaussHyrax.login',
'gaussHyrax.family',
'gaussHyrax.newFamilyMember',
'gaussHyrax.action',
'gaussHyrax.summary',
'gaussHyrax.nav',
])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: '/dashboard/dashboard.html',
      controller: 'navCtrl',
    })

    .state('login', {
      url: '/login',
      templateUrl: '/login/login.html',
      controller: 'loginController',
    });

  $urlRouterProvider.otherwise('/login');

});
