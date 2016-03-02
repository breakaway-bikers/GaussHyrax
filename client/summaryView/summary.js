angular.module('gaussHyrax.summary', ['SummaryServicesModule'])

.controller('summaryCtrl', ['$scope', 'SummaryFactory', '$http', function ($scope, SummaryFactory, $http) {

  $scope.selected = null;

  $scope.mapFlag = false;
  $scope.eta;
  $scope.etaFlag = false;
  $scope.spinner = false;
  $scope.showmap = function (familyInfo) {
    $scope.spinner = true;
    $scope.mapFlag = !$scope.mapFlag;
    $scope.restaurantFlag = false;
    var useraddress = familyInfo.streetAddress + ',+' + familyInfo.city + ',+' + familyInfo.state;
    SummaryFactory.getFamilyLocation(useraddress).then(function (response) {
      var familyLat = response.results[0].geometry.location.lat;
      var familyLng = response.results[0].geometry.location.lng;
      var directionsDisplay = new google.maps.DirectionsRenderer();
      var directionsService = new google.maps.DirectionsService();
      function success(position) {
        var mapcanvas = document.createElement('div');
        mapcanvas.id = 'mapcontainer';
        mapcanvas.style.height = '460px';
        mapcanvas.style.width = '810px';

        document.querySelector('article').appendChild(mapcanvas);
        var origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var destination = new google.maps.LatLng(familyLat, familyLng);
        var options = {
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        var map = new google.maps.Map(document.getElementById('mapcontainer'), options);
        directionsDisplay.setMap(map);

        var request = {
          origin: origin,
          destination: destination,
          travelMode: google.maps.DirectionsTravelMode.DRIVING,
        };
        directionsService.route(request, function (response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            $scope.$evalAsync(function () {
              $scope.eta = response.routes[0].legs[0].duration.text;
              $scope.etaFlag = true;
              $scope.spinner = false;
              directionsDisplay.setDirections(response);
            });
          }
        });

        directionsDisplay.setPanel(document.getElementById('mapcontainer'));
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
      } else {
        error('Geo Location is not supported');
      }
    });
  };

  $scope.toggleMap = function () {
    $scope.mapFlag = !$scope.mapFlag;
    if ($scope.etaFlag) {
      $scope.etaFlag = false;
    }
  };

  //Open Table integration
  $scope.restaurantFlag = false;
  $scope.nomList;

  $scope.findRestaurants = function (familyInfo) {
    $scope.spinner = true;
    $scope.restaurantFlag = true;
    $scope.mapFlag = false;
    SummaryFactory.getTable(familyInfo)
      .then(function (response) {
        $scope.$evalAsync(function () {
          $scope.spinner = false;
          $scope.nomList = response.data.restaurants;
        });
      });
  };

  $scope.restaurantToggle = function () {
    $scope.restaurantFlag = !$scope.restaurantFlag;
    if ($scope.spinner) {
      $scope.spinner = false;
    }
  };

  $scope.editMember = function () {
    $scope.$parent.toggleModal();
    $scope.$emit('editMe');
  };

  $scope.selectOption = function (value) {
    $scope.selected = value;
  };

  //will change the plot to a single family member when the active member is changed (clicked on page)
  //activeFamilyMember is set by familyController
  $scope.$watch('activeFamilyMember', function () {
    if ($scope.mapFlag) {
      var map = document.getElementById('mapcontainer');
      document.querySelector('article').removeChild(map);
      $scope.mapFlag = !$scope.mapFlag;
      $scope.etaFlag = false;
      $scope.restaurantFlag = false;
    }

    if ($scope.activeFamilyMember.twitterHandle) {
      SummaryFactory.getTweet($scope.activeFamilyMember).then(function (res) {
        $scope.activeFamilyMember.tweet = res.data.text;
      });
    }

    if ($scope.activeFamilyMember._id) {
      var singlePlot = SummaryFactory.calculateGraphForOneFamilyMember($scope.activeFamilyMember._id);

      //this is where I can pull the whole object and not just the ID.....
      // var weeklyPlot = SummaryFactory.filteringHistoryPeriod($scope.activeFamilyMember);
      SummaryFactory.makeChart(singlePlot);

      // SummaryFactory.makeChart(weeklyPlot);
    }
  });

  $scope.$watch('selected', function () {
      var data = SummaryFactory.calculateGraphForSetOfFamilyMembers($scope.familyData, $scope.selected);
      SummaryFactory.makeChart(data, true);
      $scope.$emit('points', SummaryFactory.currentPointValue);
    });

  //will recompute all the graphs when familyData is changed
  //will also emit a points event so that family controller knows that the points were updated
  $scope.$on('familyChange', function (event, familyData) {
    var data = SummaryFactory.calculateGraphForSetOfFamilyMembers($scope.familyData, $scope.selected);
    SummaryFactory.makeChart(data, true);

    $scope.$emit('points', SummaryFactory.currentPointValue);
  });

  //will add a single event to be graphed when a new action is saved in the actionView
  //will also emit a points event so that family controller knows that the points were updated
  $scope.$on('updateGraph', function (event, famMemberId, historyEvent) {
    SummaryFactory.addSingleEvent(famMemberId, historyEvent);
    $scope.$emit('points', SummaryFactory.currentPointValue);
  });

  //let the familyView controller know that this controller has loaded
  $scope.$emit('summaryCtrlLoaded');
},]);
