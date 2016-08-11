var subaru = angular.module('subaru', ['ionic', 'ui.router', 'angularMoment', 'ngCordova', 'subaru.localStorage', 'subaru.filters']);

subaru.run(["$ionicPlatform", function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.StatusBar) {
            StatusBar.hide();
        }
    });
}])

subaru.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

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
    controllerAs: 'sn'
  })

  $urlRouterProvider.otherwise("/");

}])
  .controller('PageCtrl',[ "$state", function($state) {
    var vm = this;
    vm.changePage = function(name){
      $state.go(name);
    };
  }])
  .controller('VideoCtrl',["$state", "$timeout", function($state, $timeout) {
    console.log("VideoCtrl initis")
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
  }])
  .controller('BeginCtrl',[ "$state",  function($state) {
    var vm = this;
    console.log("BeginCtrl initis")

    this.verifyTime = function() {
      console.log("verifyTime")
      var now = moment(Date.now());
      var startTime = moment('9:00am', 'h:mma');
      var endTime = moment('9:00pm', 'h:mma');
      var verifyTime = now.isBetween(startTime, endTime);
      if(verifyTime == true) {
        $state.go('sending');
      } else {
        $state.go('tryagain');
      }
    }

    vm.back = function(name){
      $state.go(name);
    };
  }])
  .controller('TryagainCtrl', [ "$state", function($state) {
    var vm = this;
    vm.back = function(name){
      $state.go(name);
    };
  }])
  .controller('SendingCtrl',[ "$state", "$http", "$interval", "$httpParamSerializerJQLike", "$cordovaGeolocation", "$localStorage", "$ionicLoading", "$timeout", function($state, $http, $interval, $httpParamSerializerJQLike, $cordovaGeolocation, $localStorage, $ionicLoading, $timeout) {
    console.log("SendingCtrl initis")
    var vm = this;
    var currentHost = (window.location.hostname == "localhost") ? "http://localhost/subaru/" : "http://subaru.zetabyte.cl/"
    var currentLocation = ""
    var currentCounter = $localStorage.getObject("currentCounter")
    var emailSent = $localStorage.get("emailSent")
    vm.countdown = {hour:'00', minute:'00', second: '00'};
    vm.loading = false;
    console.log(currentHost)

    var initCounter = function (counter){
      console.log("initCounter")
      var counter = counter || currentCounter;
      console.log(JSON.stringify(counter, null, 4));
      var counterInterval = $interval(function () {
          vm.countdown.hour = moment(counter.finishAt).diff(Date.now(), 'hours');
          vm.countdown.minute = moment(counter.finishAt).subtract(vm.countdown.hour, 'hours').diff(Date.now(), 'minutes');
          vm.countdown.second = moment(counter.finishAt).subtract(vm.countdown.hour, 'hours').subtract(vm.countdown.minute, 'minutes').diff(Date.now(), 'seconds');
          // console.log(JSON.stringify(vm.countdown, null, 4));
          if (vm.countdown.hour == 0 && vm.countdown.minute == 0 && vm.countdown.second == 0) {
            $interval.cancel(counterInterval);
          }
      }, 1000);
    }

    var sendMessage = function () {
        var req = {
          method: 'POST',
          url: currentHost + "mail.php",
          data: {
            location: currentLocation,
            phone_id: "X3"
          },
          transformRequest: function (request) {
            return request === undefined ? request : $httpParamSerializerJQLike(request);
          },
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
          }
        };
        $http(req).then(function (response) {
          console.log("message ok")
          $localStorage.set("emailSent", true)
          var currentCount = {startedAt: Date.now(), location: currentLocation, finishAt: moment(Date.now()).add(48, 'hours')};
          $localStorage.setObject("currentCounter", currentCount)
          initCounter(currentCount)
          $timeout(function() {
            $ionicLoading.hide()
            vm.loading = false;
          }, 1500);
        }, function (error) {
          console.log(error)
          console.log("message error")
          $ionicLoading.hide()
        })
    }

    var getLocation = function () {
      $ionicLoading.show({template: 'Enviando Informacion...'});
      vm.loading = true;
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(
        function (position) {
          console.log("position ok");
          currentLocation = " http://maps.google.com?q=" + position.coords.latitude + "," + position.coords.longitude; 
          sendMessage();
        }, function(err) {
          console.log("position Error");
          currentLocation = " No se pudo obtener ubicacion";
          sendMessage();
        }
      );
    };

    if (angular.isDefined(currentCounter) && !angular.isEmpty(currentCounter)) {
      initCounter()

    } else {
      if (emailSent !== "true") {
        getLocation();
      }
    }

    vm.back = function(name){
      $state.go(name);
    };
  }]);


angular.isEmpty = function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
