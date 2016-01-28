angular.module('gaussHyrax.nav', [])

.controller('navCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {

  $scope.reload = function() {
    // window.location.reload();
    $scope.$emit('reload');
  };

  $scope.githubUser = function() {
    return $http.get('/githubinfo').then(function(response) {
      return response.data;
    });
  };

  $scope.twitterUser = function() {
    return $http.get('/twitterinfo').then(function(response) {
      return response.data;
    });
  };

  $scope.check = function() {
    var id = $window.localStorage.getItem('com.hyrax');
    var userID;
    if (!id) {
      // NOTE NEED TO FIX THIS
      $scope.twitterUser().then(function(response) {
        userID = response._id;
        console.log(response._id);
        $window.localStorage.setItem('com.hyrax', userID);
        $scope.$emit('login');
      })
    } else {
      $scope.twitterUser().then(function(response) {
        userID = response._id;
        console.log(response._id);
        $window.localStorage.setItem('com.hyrax', userID);
        $scope.$emit('login');
      });
    }
  };



  $scope.check();
}]);
