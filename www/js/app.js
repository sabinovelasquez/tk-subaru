var subaru = angular.module('subaru', ['ionic', 'ui.router', 'angularMoment', 'ngCordova', 'subaru.localStorage', 'subaru.filters']);

subaru.run(["$ionicPlatform","$localStorage", function($ionicPlatform, $localStorage) {
    $ionicPlatform.ready(function() {
        if (window.StatusBar) {
            StatusBar.hide();
        }
    });

    var makeid = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    };
    var phoneId = $localStorage.get('phoneId', false);
    if (!phoneId) {
      phoneId = makeid();
      $localStorage.set('phoneId', phoneId);
    }

}]);

subaru.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

  $stateProvider
  // .state('home', {
  //   url: '/',
  //   templateUrl: 'home.html',
  //   controller: 'PageCtrl',
  //   controllerAs: 'main'
  // })
  .state('video', {
    url: '/',
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
    cache: false,
    templateUrl: 'sending.html',
    controller: 'SendingCtrl',
    controllerAs: 'sn'
  })

  $urlRouterProvider.otherwise("/");

}])
  // .controller('PageCtrl',[ "$state", function($state) {
  //   var vm = this;
  //   vm.changePage = function(name){
  //     $state.go(name);
  //   };
  // }])
  .controller('VideoCtrl',["$state", "$timeout", "$localStorage", function($state, $timeout, $localStorage) {
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

    video.addEventListener('ended', function(e) {
      $state.go('begin');
    }, false);

    $timeout(function() {
      var phoneId = $localStorage.get('phoneId', false);
      vm.phoneId = phoneId;
    }, 500);

  }])
  .controller('BeginCtrl',[ "$state",  function($state) {
    var vm = this;
    console.log("BeginCtrl initis")

    this.verifyTime = function() {
      console.log("verifyTime")
      var now = moment(Date.now());
      var startTime = moment('9:00am', 'h:mma');
      var endTime = moment('09:00pm', 'h:mma');
      var verifyTime = now.isBetween(startTime, endTime);
      //if(verifyTime == true) {
      if(true) {
        $state.go('sending');
      } else {
        $state.go('tryagain');
      }
    }

    vm.back = function(name){
      $state.go('video');
    };
  }])
  .controller('TryagainCtrl', [ "$state", function($state) {
    var vm = this;
    vm.back = function(name){
      $state.go(name);
    };
  }])
  .controller('SendingCtrl',[ "$state", "$http", "$interval", "$httpParamSerializerJQLike", "$cordovaGeolocation", "$localStorage", "$ionicLoading", "$timeout", function($state, $http, $interval, $httpParamSerializerJQLike, $cordovaGeolocation, $localStorage, $ionicLoading, $timeout) {
    console.log("SendingCtrl inits")
    var vm = this;
    var currentHost = (window.location.hostname == "localhost") ? "http://localhost/subaru/" : "http://subaru.zetabyte.cl/"
    var currentLocation = ""
    var currentCounter = $localStorage.getObject("currentCounter")
    var emailSent = $localStorage.get("emailSent")
    var counterFinished = $localStorage.get("counterFinished")
    vm.countdown = {hour:'00', minute:'00', second: '00'};
    vm.loading = true;
    vm.finished = false;  

    if (counterFinished == "true") {
      vm.finished = true;  
    };

    vm.reset = function (){
      $localStorage.clearAll()
      $state.go('video');
    }
    var redraw = false;

    var forceRedraw = function(element){
      //console.log(element)
      $timeout(function() {
        if (redraw) {
          console.log("none")
          element.style.transform = "none";    
        } else {
          console.log("trans")
          element.style.transform = "translateZ(0)";    
        }
        redraw = !redraw;
      }, 1000);
      
      // var disp = element.style.display;
      // element.style.display = 'none';
      // var trick = element.offsetHeight;
      // element.style.display = disp;
    };
    

    var initCounter = function (counter){
      console.log("initCounter")
      var counter = counter || currentCounter;
      console.log(JSON.stringify(counter, null, 4));
      vm.loading = false;
      var counterInterval = $interval(function () {
        //forceRedraw(document.querySelector(".countdown"))
        vm.countdown.hour = moment(counter.finishAt).diff(Date.now(), 'hours');
        vm.countdown.minute = moment(counter.finishAt).subtract(vm.countdown.hour, 'hours').diff(Date.now(), 'minutes');
        vm.countdown.second = moment(counter.finishAt).subtract(vm.countdown.hour, 'hours').subtract(vm.countdown.minute, 'minutes').diff(Date.now(), 'seconds');
        // console.log(JSON.stringify(vm.countdown, null, 4));
        if (vm.countdown.hour <= 0 && vm.countdown.minute <= 0 && vm.countdown.second <= 0) {
          $interval.cancel(counterInterval);
          vm.countdown = {hour:'00', minute:'00', second: '00'};
          $localStorage.setObject("currentCounter", {})
          $localStorage.set("counterFinished", true)
          vm.finished = true;
        }
      }, 1000);
    }

    var sendMessage = function () {
        var phoneId = $localStorage.get('phoneId', false);
        var req = {
          method: 'POST',
          url: currentHost + "mail.php",
          data: {
            location: currentLocation,
            phone_id: phoneId || "X1SD"
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
          }, 500);
        }, function (error) {
          console.log(error)
          console.log("message error")
          $ionicLoading.show({template: 'No se pudo enviar la ubicación'});
          $timeout(function() {
            $ionicLoading.hide()  
          }, 3000);
          
        })
    }

    var getLocation = function () {
      $ionicLoading.show({template: 'Enviando Informacion...'});
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
