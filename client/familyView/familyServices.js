angular.module('FamilyServices', [])

.factory('FamilyFactory', ['$http', '$window', function($http, $window) {

  var familyFactory = {};

  // Get all the family Members data from the Mongo Database using the user id
  familyFactory.getAllFamilyMembers = function(id) {

    return $http({
      method: 'GET',
      url: '/api/family/' + id,
    })
    .then(function(res) {
      return res;
    });
  },

  //this is added by Juan. Attempting to send a post request to remove history.
  familyFactory.updateMember = function(memberObj) {
    return $http({
      method: 'PUT',
      url: '/api/family/' + $window.localStorage.getItem('com.hyrax') + '/' + memberObj._id,
      headers: {
        'Content-Type': 'application/json',
      },
      data: memberObj,
    })
    .then(function(res) {
      return res.data;
    });
  };

  return familyFactory;

},]);
