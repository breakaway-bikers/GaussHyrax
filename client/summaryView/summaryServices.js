angular.module('SummaryServicesModule', [])

.filter('niceDate', function () {
  return function (input) {
    return moment(input).format('MMM D, YYYY');
  };
})

.factory('SummaryFactory', ['$http', '$window', '$timeout', function ($http, $window, $timeout) {

  var dateFormat = 'MMM D, YYYY'; //used to format dates
  var chart;  //c3 line chart object
  var donut;  //c3 donut chart object

  var xIdx = {};            //store the lookup for dates, example xIdx['1/1/16'] = 4 indicates that 1/1/16 is the 4th element
  var familyLookUp = {};    //object used for finding family info by _id
  var historyLookUp = {};   //object used for tooltip info.  Can find tasks by _id and date.
  var xLines = [];          //vertical lines that separate the months
  var factory = {};

  factory.currentPointValue = {}; //will contain the point values to be displayed on the familyView
  factory.pointGraph = {};        //will contain the data for the line plot in c3
  factory.actionsDonut = {};      //will contain the data for the donut plot in c3
  factory.xLabels = [];           //will contain the x labels for the line plot in c3

  //helper function to calculate line graph based on the history that was stored
  var calculatePointsGraphFromHistory = function (history) {

    var points = [];//stores all the points
    var lastPoints = 0; //stores the previous point value
    var numDays = Object.keys(xIdx).length;

    //initialize points array to be 0
    for (var i = 0; i < numDays; i++) {
      points[i] = 0;
    }

    //add points that are earned
    for (var i = 0; i < history.length; i++) {
      points[xIdx[moment(history[i].date).format(dateFormat)]] += history[i].points;
    }

    //interpolate
    for (var i = 0; i < numDays; i++) {

      if (points[i] === 0) {
        //interpolate
        if (lastPoints > 1) {
          points[i] = lastPoints - 1;
        } else {
          points[i] = 0;
        }
      } else {
        //add points to earned value
        points[i] += lastPoints;
      }

      //update the previous point value
      lastPoints = points[i];
    }

    return points;
  };

  //add filter here becuase the below function is in closure.
  //////////////////////////Note///////////////////////////
  //I'm not capturing the correct information. At some point a unknown set of values is being passed to this function and I cant track it.
  //I'm moving on to a new feature until I can work with nick further on this.
  var calculateC3DataForOneFamilyMember = function (familyMember, numOfDays) {
    //just what is says ^^^

    var actionCount = {};   //object used for quick insertion
    var actionArray = [];   //data needed to plot
    var action;             //temp variable to store single action
    var keepItGoing = false;

    //calculate data for line graph
    //I need to set up a conditonal to only run filter when 'days' is passed in.
    //'days' is contructed from the dropdown and will be passed in with any calculation request requiring time period.

    //add a filter on what is on graph
    console.log('this is days inside of calculateC3', numOfDays);

    var filteringHistoryPeriod = function (familyMember, numOfDays) {
      //just what is says ^^^
      var currentDate = moment();
      var filteredPeriod = [];

      console.log('two arguments inside inside', familyMember);
      historyLookUp[familyMember._id] = {};

      for (var i = 0; i < familyMember.history.length; i++) {
        var then = moment(familyMember.history[i].date);

        //locating relative date..
        var difference = currentDate.diff(then, 'days');

        if (difference < numOfDays) {
          filteredPeriod.push(familyMember.history[i]);

          // filteredFamilyHi
        }
      };

      return filteredPeriod;
    };

    //'this is the conditional I need to work on',
    if (numOfDays) {
      var filteredHistory = filteringHistoryPeriod(familyMember, numOfDays);
      console.log('this is trial: ', filteredHistory);

      var points = calculatePointsGraphFromHistory(filteredHistory);
      var keepItGoing = true;

    } else {

      var points = calculatePointsGraphFromHistory(familyMember.history);
    };

    if (keepItGoing) {
      //loop through history and store counts of the different action types for the donut plot
      for (var i = 0; i < filteredHistory.length; i++) {
        action = filteredHistory[i].action.toLowerCase();
        if (!actionCount[action]) {
          actionCount[action] = 0;
        }

        actionCount[action]++;
      }

      //turn actionCount object into an array, so it can be used in c3
      var actionArray = _.map(actionCount, function (value, index) {
        return [index, value];
      });

      //return data to be used in c3, both line and donut
      return {
        linePlot: _.flatten([familyMember._id, points]),
        donutPlot: actionArray,
      };
    } else {
      //original version
      for (var i = 0; i < familyMember.history.length; i++) {
        action = familyMember.history[i].action.toLowerCase();
        if (!actionCount[action]) {
          actionCount[action] = 0;
        }

        actionCount[action]++;
      }

      //turn actionCount object into an array, so it can be used in c3
      var actionArray = _.map(actionCount, function (value, index) {
        return [index, value];
      });

      //return data to be used in c3, both line and donut
      return {
        linePlot: _.flatten([familyMember._id, points]),
        donutPlot: actionArray,
      };
    };
  };

  //end of edited version.

  factory.calculateGraphForSetOfFamilyMembers = function (family, numOfDays) {
    //just what is says ^^^

    //check if there is anything to plot
    if (!family || !family[0]) {
      //return empty data to plot
      return {
        linePlot: [],
        donutPlot: [],
      };
    }

    var now = moment();
    var minDate = moment().subtract(3, 'months');  //determines min date to plot
    var day = minDate;

    var series;
    var actions = {};
    var actionArray = [];
    var days = [];

    //determine x values in graph
    var i = 0;
    while (day <= now) {
      days.push(day.format(dateFormat));
      xIdx[day.format(dateFormat)] = i;

      //store the month dividers in for the line plot, put them on the first day of a month
      if (day.date() === 1) {
        xLines.push({ value: day.format(dateFormat), text: day.format('MMM') });
      }

      //increment
      day.add(1, 'days');
      i++;
    }

    //store xLables so it can be used everytime a graph is needed
    this.xLabels = _.flatten(['x', days]);

    //calculate series for each family member
    var points = [];
    var action;
    for (var i = 0; i < family.length; i++) {
      series  = calculateC3DataForOneFamilyMember(family[i], numOfDays);

      //push the individual series into points, which will be used to plot everyone
      points.push(series.linePlot.slice());

      //aggregate actions together
      for (var j = 0; j < series.donutPlot.length; j++) {
        action = series.donutPlot[j][0];
        if (!actions[action]) {
          actions[action] = 0;
        }

        actions[action] += series.donutPlot[j][1];
      }

      //store this data by _id so it can be retrieved/updated later
      this.pointGraph[family[i]._id] = series.linePlot.slice();
      this.currentPointValue[family[i]._id] = series.linePlot[series.linePlot.length - 1];
      this.actionsDonut[family[i]._id] = series.donutPlot.slice();
      familyLookUp[family[i]._id] = family[i];

      //create a history lookup so that action information can be shown on the tooltip
      //tooltip displays all tasks done on a particular day
      var prettyDate;
      historyLookUp[family[i]._id] = {};
      for (var j = 0; j < family[i].history.length; j++) {

        prettyDate = moment(family[i].history[j].date).format(dateFormat);

        //create array if none exists
        if (!historyLookUp[family[i]._id][prettyDate]) {
          historyLookUp[family[i]._id][prettyDate]  = [];
        }

        //push history onto that date's array so multiple history items can be stored
        historyLookUp[family[i]._id][prettyDate].push(_.extend(family[i].history[j], { name:family[i].firstName + ' ' + family[i].lastName }));
      }

    };

    //return data in special format for c3
    points.unshift(factory.xLabels);

    //turn actions into an k,v pair array for c3
    var actionArray = _.map(actions, function (value, index) {
      return [index, value];
    });

    //this is the data that will ultimately be plotted
    return {
      linePlot: points,
      donutPlot: actionArray,
    };

  };

  factory.calculateGraphForOneFamilyMember = function (familyMemberId) {
    //just what is says ^^^

    //check if there is anything to plot
    if (!this.pointGraph[familyMemberId]) {
      return {
        linePlot:[],
        donutPlot: [],
      };
    }

    //grab the points that are already computed from page load
    var output = [this.pointGraph[familyMemberId].slice()];
    output.unshift(this.xLabels);

    return {
      linePlot:output,
      donutPlot: this.actionsDonut[familyMemberId], //also already computed from page load
    };
  };

  factory.addSingleEvent = function (id, historyEvent) {
    //when a user clicks save on an action, this function updates the graphs

    var prettyDate = moment(historyEvent.date).format(dateFormat);

    //--------------------------
    //add event to history lookup so it shows up on tooltip
    if (!historyLookUp[id][prettyDate]) {
      historyLookUp[id][prettyDate] = [];
    }

    historyLookUp[id][prettyDate].push(_.extend(historyEvent, { name: familyLookUp[id].firstName + ' ' + familyLookUp[id].lastName }));

    //--------------------------
    //modify graph
    //var chartValues = chart.data.values(id);
    if (xIdx[prettyDate]) {
      var chartValues = calculatePointsGraphFromHistory(familyLookUp[id].history);
      chartValues.unshift(id);
      chart.load({
        columns:[chartValues],
        unload:[id],
      });

      //update pointGraph so if it is loaded again, we have the new info
      this.pointGraph[id] = chartValues;

      //update the current point value
      factory.currentPointValue[id] = chartValues[chartValues.length - 1];
    }

    //--------------------------
    //modify donut
    var action = historyEvent.action.toLowerCase();
    var donutValue = donut.data.values(action) || 0;
    donut.load({
      columns:[[action, parseInt(donutValue) + 1]],
      unload:[action],
    });

    //save the donut info so it can be loaded later
    var found = false;

    for (var i = 0; i < this.actionsDonut[id].length; i++) {
      if (this.actionsDonut[id][i][0] === historyEvent.action) {
        this.actionsDonut[id][i][1] = parseInt(donutValue) + 1;
        found = true;
        break;
      }
    }

    if (!found) {
      this.actionsDonut[id].push([historyEvent.action, 1]);
    }

  };

  //this will actually create the chart
  factory.makeChart = function (data, refresh) {
    var xAxis;
    var rendered;

    //--------------------
    //LINE PLOT

    //just load data in and don't re-create it
    if (chart && !refresh) {
      chart.load({
        columns:data.linePlot,
        unload:true,
      });
    } else {
      //build the whole chart anew
      chart = c3.generate({

        bindto: '#chart',
        size: {
          height: 240,
        },
        data:{
          x:'x',
          columns: data.linePlot, //this is the data
          type: 'area',
        },
        axis: {
          x: {
            type: 'category',// this needed to load string x value
            label: {
              text: 'time',
              position: 'outer-center',
            },
          },
          y: {
            label: {
                text: 'points',
                position: 'outer-middle',
              },
          },
        },
        grid: {
          x: {
            lines: xLines,
          },
        },
        legend: {
          hide: true,
        },
        subchart: {
          show: true,
          size: {
            height: 20,
          },
        },
        zoom: {
          enabled: true,
        },
        transition: {
          duration: 1000,
        },
        tooltip: {
          format:{
            name: function (name, ratio, id, index) {
              //this brings up the data into the tooltip hover

              //use historyLookUp to access tasks done on this date
              var tasks = historyLookUp[id][factory.xLabels[index + 1]];
              var displayStr = '';

              //no tasks done, so just display name
              if (!tasks) {
                return familyLookUp[id].firstName + ' ' + familyLookUp[id].lastName;
              }

              //tasks were done, so display task info that was stored
              displayStr += tasks[0].name + '<br>';
              for (var i = 0; i < tasks.length; i++) {
                displayStr += '<b>' + tasks[i].action +
                  ' (+' + tasks[i].points + ' pts)' + '</b><br>"' +
                  tasks[i].notes + '"<br>';
              }

              return displayStr;
            },
          },
          grouped: false,// Default true
        },
      });

      //zoom to the last 4 weeks
      $timeout(function () {
        if (data.linePlot[0]) {
          chart.zoom([data.linePlot[0].length - 28, data.linePlot[0].length - 1]);
        }
      }, 1000);
    }

    //--------------------
    //DONUT PLOT

    //just load data in and don't re-create it
    if (donut && !refresh) {
      donut.load({
        columns:data.donutPlot,
        unload:true,
      });
    } else {
      //build the whole chart anew
      donut = c3.generate({
        bindto: '#donut',
        size: {
          height:240,
          width: 240,
        },
        data:{
          columns: data.donutPlot,    //this is the data
          type: 'donut',
        },
        donut:{
          label:{
            format: function (value, ratio) {
              return value;
            },
          },
        },
        legend:{
          position:'bottom',
        },
        transition: {
          duration: 1500,
        },
      });
    }
  };

  factory.getFamilyLocation = function (address) {
    return $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyBivkEojqRHPnTzefSbWt3YGWZmW0Ozqug')
                  .then(function (response) {
                    return response.data;
                  });
  };

  factory.getTable = function (familyInfo) {
    return $http({
      url: '//opentable.herokuapp.com/api/restaurants',
      method: 'GET',
      params: { city: familyInfo.city, state: familyInfo.state },
    }).then(function (response) {
             return response;
           });
  };

  factory.getTweet = function (user) {
    return $http({
      url: '/tweets/' + user.twitterHandle,
      method: 'GET',
    }).then(function (response) {
      return response;
    });
  };

  return factory;
},]);
