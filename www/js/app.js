var subaru = angular.module('subaru', ['ionic', 'ui.router', 'angularMoment', 'ngCordova', 'subaru.localStorage', 'subaru.filters']);

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
  .controller('VideoCtrl', function($state, $timeout) {
    var vm = this;
    var video = document.getElementById('intro');
    vm.showPlayButton = true;
    vm.videoIntro = 'video/intro.mp4';

    vm.play = function() {
      video.play()
      vm.showPlayButton = false;
    }

    vm.changePage = function(name){
      video.pause();
      $state.go(name);
    };
  })
  .controller('BeginCtrl', function($state) {
    var vm = this;

    this.verifyTime = function() {
      var now = moment();
      var startTime = moment('9:00am', 'h:mma');
      var endTime = moment('9:00pm', 'h:mma');
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
  .controller('SendingCtrl', function($state, $http, $interval, $httpParamSerializerJQLike, $cordovaGeolocation, $localStorage) {
    var vm = this;
    var currentHost = (window.location.hostname == "localhost") ? "http://localhost/subaru/" : "http://subaru.zetabyte.cl/"
    var currentLocation = ""
    var currentCounter = $localStorage.getObject("currentCounter")
    var emailSent = $localStorage.get("emailSent")
    vm.countdown = {hour:'00', minute:'00'};

    var sendMessage = function () {
        var req = {
          method: 'POST',
          url: currentHost + "mail.php",
          data: {
            location: currentLocation,
            phone_id: "X1"
          },
          transformRequest: function (request) {
            return request === undefined ? request : $httpParamSerializerJQLike(request);
          },
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
          }
        };
        $http(req).then(function (response) {
          $localStorage.set("emailSent", true)
          $localStorage.setObject("currentCounter", {startedAt: Date.now(), location: currentLocation, finishAt: moment(Date.now()).add(48, 'hours')})
        }, function (error) {
          console.log(error)
        })
    }

    var getLocation = function () {
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(
        function (position) {
          currentLocation = " http://maps.google.com?q=" + position.coords.latitude + "," + position.coords.longitude; 
          sendMessage()
        }, function(err) {
          sendMessage()
          vm.geoError = true;
          vm.geoDesc = err;
          console.error()
        }
      );
    };

    if (angular.isDefined(currentCounter) && !angular.isEmpty(currentCounter)) {
      var counter = $interval(function () {
          vm.countdown.hour = moment(currentCounter.finishAt).diff(Date.now(), 'hours');
          vm.countdown.minute = moment(currentCounter.finishAt).subtract(vm.countdown.hour, 'hours').diff(Date.now(), 'minutes');
          vm.countdown.second = moment(currentCounter.finishAt).subtract(vm.countdown.hour, 'hours').subtract(vm.countdown.minute, 'minutes').diff(Date.now(), 'seconds');

          if (vm.countdown.hour == 0 && vm.countdown.minute == 0 && vm.countdown.second == 0) {
            $interval.cancel(counter);
          }
      }, 1000);

    } else {
      if (emailSent !== "true") {
        getLocation();
      }
    }

    vm.back = function(name){
      $state.go(name);
    };
  });


angular.isEmpty = function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
