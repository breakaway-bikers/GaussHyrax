angular.module('gaussHyrax.nav', [])

.controller('navCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {

  $scope.reload = function() {
    // window.location.reload();
    $scope.$emit('reload');
  };

  //TODO: this is hacky, refactor into a service.
  $scope.githubUser = function() {
    return $http.get('/githubinfo').then(function(response) {
      return response.data;
    });
  };

  // $scope.facebookUser = function() {
  //   return $http.get('/facebookInfo').then(function(response) {
  //     return response.data;
  //   });
  // };

  $scope.check = function() {
    var id = $window.localStorage.getItem('com.hyrax');
    var userID;
    if (!id) {
      $scope.githubUser().then(function(response) {
        userID = response._id;
        console.log(response);
        $window.localStorage.setItem('com.hyrax', userID);
        $scope.$emit('login');
      });
    }
  };

  // $scope.checkFacebook = function() {
  //   var id = $window.localStorage.getItem('com.hyrax');
  //   var userID;
  //   if (!id) {
  //     $scope.facebookUser().then(function(response) {
  //       userID = response._id;
  //       console.log(response._id);
  //       $window.localStorage.setItem('com.hyrax', userID);
  //       $scope.$emit('login');
  //     });
  //   }
  // };

  $scope.check();

  // $scope.checkFacebook();
},]);
