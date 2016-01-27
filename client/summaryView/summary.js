angular.module('gaussHyrax.summary', ['SummaryServicesModule'])

.controller('summaryCtrl', ['$scope', 'SummaryFactory', function($scope, SummaryFactory) {

  $scope.mapFlag = false;

  $scope.showmap = function(){
    $scope.mapFlag = !$scope.mapFlag;
    console.log('The mapflag is ', $scope.mapFlag);
  };

  //shows modal when edit button is clicked
  $scope.editMember = function() {
    $scope.$parent.toggleModal();
    $scope.$emit('editMe');
  };

  //will change the plot to a single family member when the active member is changed (clicked on page)
  //activeFamilyMember is set by familyController
  $scope.$watch('activeFamilyMember', function() {
    console.log('familyMember selected, changing graph...');
    if ($scope.activeFamilyMember._id) {
      var singlePlot = SummaryFactory.calculateGraphForOneFamilyMember($scope.activeFamilyMember['_id']);
      SummaryFactory.makeChart(singlePlot);
    } else {
      console.log('cannot plot, family member not specified');
    }
  });

  //will recompute all the graphs when familyData is changed
  //will also emit a points event so that family controller knows that the points were updated
  $scope.$on('familyChange', function(event, familyData) {
    console.log('familyData changed, recomputing all graphs...');
    var data = SummaryFactory.calculateGraphForSetOfFamilyMembers($scope.familyData);
    SummaryFactory.makeChart(data, true);
    $scope.$emit('points', SummaryFactory.currentPointValue);
  });

  //will add a single event to be graphed when a new action is saved in the actionView
  //will also emit a points event so that family controller knows that the points were updated
  $scope.$on('updateGraph', function(event, famMemberId, historyEvent) {
    console.log('heard history in summary summaryCtrl');
    SummaryFactory.addSingleEvent(famMemberId, historyEvent);
    $scope.$emit('points', SummaryFactory.currentPointValue);
  });

  //let the familyView controller know that this controller has loaded
  $scope.$emit('summaryCtrlLoaded');
}]);
