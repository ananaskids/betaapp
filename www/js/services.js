angular.module('ananas.services', ['firebase'])

.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) { 
    var ref = new Firebase(firebaseUrl); 
    return $firebaseAuth(ref); 
}])

.factory("Children", function($firebase){
  var ref = new Firebase('ananaskids.firebaseio.com'); 
  var children = $firebase(ref.child('children')).$asArray();

  return {
    all: function() {
      return children;  
    }, 
    get: function(childId) {
      return children.$getRecord(childId);
    },
    add: function(childData) {
      children.$add(childData);
      children.$save();
    }
  }
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.factory('$userinfo', ['$window', '$localstorage', function($window, $localstorage) {
  return {
    set: function(value) {
      $localstorage.set('user', value);
    },
    get: function() {
      return $localstorage.get('user');
    },
    setObject: function(value) {
      $localstorage.setObject('user', value);
    },
    getObject: function() {
      return $localstorage.getObject('user')
    },
    setStatus: function(value) {
      $window.localStorage['user']['userStatus'] || value;
    },
    getStatus: function(key, defaultValue) {
      return $window.localStorage['user']['userStatus'] || defaultValue;
    },
    loggedIn: function() {
      return !(typeof $window.localStorage['user'] === undefined || $window.localStorage['user'] === '{}' || $window.localStorage['user'] === 'null')    
    },
    setMeImage: function(value){
      $localstorage.set('meImage', value);
    }, 
    getMeImage: function(){
      return $localstorage.get('meImage');
    }
  }
}]);