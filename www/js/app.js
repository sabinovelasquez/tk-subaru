var subaru = angular.module('subaru', ['ionic', 'ui.router', 'angularMoment', 'ngCordova']);

subaru.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'home.html',
    controller: 'PageCtrl',
    controllerAs: 'main'
  })
  .state('video', {
    url: '/video',
    templateUrl: 'video.html',
    controller: 'VideoCtrl',
    controllerAs: 'video'
  })
  .state('begin', {
    url: '/begin',
    templateUrl: 'begin.html',
    controller: 'BeginCtrl',
    controllerAs: 'begin'
  })
  .state('tryagain', {
    url: '/tryagain',
    templateUrl: 'tryagain.html',
    controller: 'TryagainCtrl',
    controllerAs: 'tryagain'
  })
  .state('sending', {
    url: '/sending',
    templateUrl: 'sending.html',
    controller: 'SendingCtrl',
    controllerAs: 'sending'
  })

  $urlRouterProvider.otherwise("/");

  })
  .controller('PageCtrl', function($state) {
    var vm = this;
    vm.changePage = function(name){
      $state.go(name);
    };
  })
  .controller('VideoCtrl', function($state) {
    var vm = this;
    vm.videoIntro = 'video/intro.mp4';
    vm.changePage = function(name){
      document.getElementById('intro').pause();
      $state.go(name);
    };
  })
  .controller('BeginCtrl', function($state) {
    var vm = this;

    this.verifyTime = function() {
      var now = moment();
      var startTime = moment('9:00am', 'h:mma');
      var endTime = moment('5:00pm', 'h:mma');
      var verifyTime = now.isBetween(startTime, endTime);
      if(verifyTime){
        $state.go('sending');
      }else{
        $state.go('tryagain');
      }
    }

    vm.back = function(name){
      $state.go(name);
    };
  })
  .controller('TryagainCtrl', function($state) {
    var vm = this;
    vm.back = function(name){
      $state.go(name);
    };
  })
  .controller('SendingCtrl', function($state, $http, $interval, $httpParamSerializerJQLike, $cordovaGeolocation) {
    var vm = this;

    var time = 14200;
    var duration = moment.duration(time * 1000, 'milliseconds');
    var interval = 1000;
    var currentHost = (window.location.hostname == "localhost") ? "http://localhost/subaru/" : "http://subaru.zetabyte.cl/"
    var currentLocation = ""
    vm.countdown = '00:00:00';

    var setPosition = function(position) {
        currentLocation = "Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude; 
    }

    var getLocation = function () {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(setPosition);
      }
    }

    var sendMessage = function () {
        var req = {
          method: 'POST',
          url: currentHost + "mail.php",
          data: {
            location: currentLocation,
            phone_id: "A1123123"
          },
          transformRequest: function (request) {
            return request === undefined ? request : $httpParamSerializerJQLike(request);
          },
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
          }
        };
        $http(req).then(function (response) {
          console.log(response.data)
        }, function (error) {
          console.log(error)
        })
    }

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        currentLocation = "Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude; 
        sendMessage()
      }, function(err) {
        sendMessage()
        console.error(err)
      });


    //getLocation()
    //sendMessage()

    $interval(function(){
      duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');
      vm.countdown = moment(duration.asMilliseconds()).format('h:mm:ss');
    }, interval);

    vm.back = function(name){
      $state.go(name);
    };
  });

