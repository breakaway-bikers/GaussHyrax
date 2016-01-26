angular.module('newFamilyMemberServices', [])

.factory('NewFamilyMemberFactory', ['$http', '$window', function($http, $window) {
  var newFamilyMember = [];

  var getUserID = function() {
    return $http({
      method: 'GET',
      url: '/api/user/' + $window.localStorage.getItem('com.hyrax'),
    });
  };

  var saveMember = function(memberObj) {

    console.log('this is memberObj: ', memberObj);
    return $http({
      method: 'POST',
      url: '/api/family/' + $window.localStorage.getItem('com.hyrax'),
      headers: {
        'Content-Type': 'application/json',
      },
      data: memberObj,
    })
    .then(function(res) {
      console.log('Response from the saveUser POST Request: ', res);
      return res.data;
    });
  };

  var updateMember = function(memberObj) {
    return $http({
      method: 'PUT',
      url: '/api/family/' + $window.localStorage.getItem('com.hyrax') + '/' + memberObj._id,
      headers: {
        'Content-Type': 'application/json',
      },
      data: memberObj,
    })
    .then(function(res) {
      console.log('Response from the saveUser PUT Request: ', res);
      return res.data;
    });
  };

  var deleteMember = function(memberObj) {
    return $http({
      method: 'DELETE',
      url: '/api/family/' + $window.localStorage.getItem('com.hyrax') + '/' + memberObj._id,
    })
    .then(function(res) {
      console.log('Response from the saveUser DELETE Request: ', res);
      return res.data;
    });
  };

  return {
    getUserID: getUserID,
    saveMember: saveMember,
    updateMember: updateMember,
    deleteMember: deleteMember,
  };

}]);
