angular.module('newFamilyMemberServices', ['angular-md5'])

.factory('NewFamilyMemberFactory', ['$http', '$window', 'md5', function($http, $window, md5) {
  var newFamilyMember = [];

  var getUserID = function() {
    return $http({
      method: 'GET',
      url: '/api/user/' + $window.localStorage.getItem('com.hyrax'),
    });
  };

  var getEmailHash = function (email) {
    var hashed = md5.createHash(email);
    console.log(hashed);
    return hashed;
  };

  var saveMember = function(memberObj) {

    //Raph NOTE: I added this check for an image, if none is present, default to batman.
    if (!memberObj.image) {
      memberObj.image = 'http://www.gravatar.com/avatar/' + getEmailHash(memberObj.email) + '?d=http://media.dcentertainment.com/sites/default/files/styles/character_thumb_160x160/public/CharThumb_215x215_batman_52ab7a8c79da39.68474144.jpg?itok=iHwyI5Vh'
    };
    //Raph NOTE end

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

    //Raph NOTE: I added this check for an image, if none is present, default to batman.
    if (!memberObj.image) {
      memberObj.image = 'http://www.gravatar.com/avatar/' + getEmailHash(memberObj.email) + '?d=http://media.dcentertainment.com/sites/default/files/styles/character_thumb_160x160/public/CharThumb_215x215_batman_52ab7a8c79da39.68474144.jpg?itok=iHwyI5Vh'
    };

    //Raph NOTE end

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
