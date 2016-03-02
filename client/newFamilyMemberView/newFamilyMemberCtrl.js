angular.module('gaussHyrax.newFamilyMember', ['rzModule', 'newFamilyMemberServices'])

.controller('memberCtrl', ['$scope', 'NewFamilyMemberFactory',
function ($scope, NewFamilyMemberFactory) {
  // Slider for the contact frequency.
  $scope.member = {};

  $scope.slider_toggle = {
      value: 1,
      options: {
        floor: 1,
        ceil: 14,
        step: 1,
        showSelectionBar: true,
        onEnd: function () {
          $scope.nextDate = moment().add($scope.slider_toggle.value, 'days').format('MMM DD YYYY');
        },
      },
    };

  // Save family member to userId
  $scope.saveMember = function () {
      $scope.member.nextContactDate = $scope.nextDate;
      $scope.member.contactFrequency = $scope.slider_toggle.value;
      NewFamilyMemberFactory.saveMember($scope.member)
      .then(function (data) {
        data.nextContactDate = moment(data.nextContactDate).format('MMM DD YYYY');
        data.points = 0;
        $scope.familyData.push(data);
        $scope.$emit('addedFam');
      });

      $scope.member = {};
      $scope.$parent.toggleModal();
    };

  $scope.update = function () {
      $scope.member.nextContactDate = $scope.nextDate;
      $scope.member.contactFrequency = $scope.slider_toggle.value;

      NewFamilyMemberFactory.updateMember($scope.member)
      .then(function (data) {
        $scope.$parent.toggleModal();
      });
    };

  $scope.delete = function () {
      NewFamilyMemberFactory.deleteMember($scope.member)
      .then(function (data) {
        $scope.$emit('removeFam', $scope.member._id);
        $scope.$parent.toggleModal();
      }.bind($scope));
    };

  $scope.$on('editThisGuy', function () {
    $scope.savebtn = false;
    $scope.updatebtn = true;
    $scope.deletebtn = true;
    $scope.member = $scope.activeFamilyMember;
  });

  $scope.$on('addThisGuy', function () {
      $scope.savebtn = true;
      $scope.updatebtn = false;
      $scope.deletebtn = false;
      $scope.member = {};
    });

},]);
