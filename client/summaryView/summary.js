angular.module('gaussHyrax.summary', ['SummaryServicesModule'])

.controller('summaryCtrl', ['$scope', 'SummaryFactory', function($scope, SummaryFactory) {

  $scope.mapFlag = false;

  $scope.showmap = function(familyInfo){
    $scope.mapFlag = !$scope.mapFlag;
    var useraddress = familyInfo.streetAddress + ',+' + familyInfo.city + ',+' + familyInfo.state;
    console.log('The mapflag is ', $scope.mapFlag);
    SummaryFactory.getFamilyLocation(useraddress).then(function(response){
      var familyLat = response.results[0].geometry.location.lat;
      var familyLng = response.results[0].geometry.location.lng;
      var directionsDisplay = new google.maps.DirectionsRenderer();
      var directionsService = new google.maps.DirectionsService();
      function success(position) {
        var mapcanvas = document.createElement('div');
        mapcanvas.id = 'mapcontainer';
        mapcanvas.style.height = '400px';
        mapcanvas.style.width = '600px';

        document.querySelector('article').appendChild(mapcanvas);
        var origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var destination = new google.maps.LatLng(familyLat, familyLng);
        var options = {
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("mapcontainer"), options);
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('mapcontainer'));

        var request = {
          origin: origin,
          destination: destination,
          travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
        });
      }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
      } else {
        error('Geo Location is not supported');
      }
    });
  };
  $scope.toggleMap = function(){
    $scope.mapFlag = !$scope.mapFlag;
    console.log($scope.mapFlag);
  };
  // $scope.$on('reload', function(){
  // });
  //shows modal when edit button is clicked
  $scope.editMember = function() {
    $scope.$parent.toggleModal();
    $scope.$emit('editMe');
  };

  $scope.selectOption = function(value) {
    $scope.selected = value;
    console.log('this is the selected property: ', $scope.selected);
  };

  //will change the plot to a single family member when the active member is changed (clicked on page)
  //activeFamilyMember is set by familyController
  $scope.$watch('activeFamilyMember', function() {
    console.log('familyMember selected, changing graph...');
    if($scope.mapFlag){
      var map = document.getElementById("mapcontainer");
      document.querySelector('article').removeChild(map);
      $scope.mapFlag = !$scope.mapFlag;
    }


    if ($scope.activeFamilyMember._id) {
      var singlePlot = SummaryFactory.calculateGraphForOneFamilyMember($scope.activeFamilyMember._id);

      //this is where I can pull the whole object and not just the ID.....
      // var weeklyPlot = SummaryFactory.filteringHistoryPeriod($scope.activeFamilyMember);
      SummaryFactory.makeChart(singlePlot);

      // SummaryFactory.makeChart(weeklyPlot);
    } else {
      console.log('cannot plot, family member not specified');
    }
  });

  if ($scope.selected) {
    $scope.$watch('activeFamilyMember', function() {
      console.log('family mamber selected for filtering');
      SummaryFactory.filteringHistoryPeriod($scope.activeFamilyMember);
    });

  }

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
