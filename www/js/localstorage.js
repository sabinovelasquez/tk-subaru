(function() {
  'use strict';
          
  function StorageService ($q, $window) {
 
    var service = {
        set: function (key, value) {
            $window.localStorage[key] = value;
            return;
        },
        get: function (key, defaultValue) {
            if ( !$window.localStorage[key] ) {
                $window.localStorage[key] = "";
            }
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        remove: function (key) {
            if ( !$window.localStorage[key] ) return;
            $window.localStorage.removeItem(key);
            return;
        },
        clearAll: function () {
            return $window.localStorage.clear();
        } 
    };

    return service;
  }

  angular
    .module('subaru.localStorage', [])
    .service('$localStorage', ["$q", "$window",StorageService]);

}).call(this);