var subaru = angular.module('subaru', ['ionic', 'ui.router', 'angularMoment']);

subaru.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'home.html',
    controller: 'PageCtrl',
    controllerAs: 'main'
  })
  .state('video', {
    url: '/',
    templateUrl: 'video.html',
    controller: 'VideoCtrl',
    controllerAs: 'video'
  })
  .state('begin', {
    url: '/',
    templateUrl: 'begin.html',
    controller: 'BeginCtrl',
    controllerAs: 'begin'
  })
  .state('tryagain', {
    url: '/',
    templateUrl: 'tryagain.html',
    controller: 'TryagainCtrl',
    controllerAs: 'tryagain'
  })
  .state('sending', {
    url: '/',
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
      var startTime = moment('3:00am', 'h:mma');
      var endTime = moment('5:00pm', 'h:mma');
      var verifyTime = now.isBetween(startTime, endTime);
      if(verifyTime){
        $state.go('sending');
      }else{
        $state.go('tryagain');
        // $state.go('sending');
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
  .controller('SendingCtrl', function($state, $http, $interval) {
    var vm = this;

    var time = 14200;
    var duration = moment.duration(time * 1000, 'milliseconds');
    var interval = 1000;

    vm.countdown = '00:00:00';

    $interval(function(){
      duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');
      vm.countdown = moment(duration.asMilliseconds()).format('h:mm:ss');
    }, interval);

    vm.back = function(name){
      $state.go(name);
    };
  });
