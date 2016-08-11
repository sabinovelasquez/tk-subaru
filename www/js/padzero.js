(function() {
  'use strict';
      
  angular
    .module('subaru.filters', [])
    .filter('prependZero', function () {
      return function (input) {
        if (input) {
          var cad = input.toString();
          
          if (cad.length == 1) {
            cad = '0' + cad;
          }
        }
        return input ? cad :  "00";
      };
    });

}).call(this);