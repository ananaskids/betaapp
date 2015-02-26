var NUMERIC_REGEXP = /^\-?\d+$/;
var ONLYALPHA_REGEXP = /^[A-Za-z ]+$/;

angular.module('ananas.controllers', ['ionic', 'ananas.services', 'firebase', 'angular-carousel']) //, 'ngQueue'

.controller('MenuCtrl', function($scope, $localstorage, $userinfo, $state, $window) {

  $scope.menuData = {};
  $scope.goToLogin = function(){
    $state.go('app.login');
  }
  $userinfo.set("null");

  if ($userinfo.loggedIn()) {  
    $scope.menuData.loginLabel = "Logout";
  }
  else {
    $scope.menuData.loginLabel = "Login with Facebook";
  }
})

.controller('WelcomeCtrl', function($scope, $cordovaOauth, $localstorage, $state, $timeout) {

  document.addEventListener("deviceready", function () { 
    $timeout($state.go('app.login'), 2500, true)
  });

})

.controller('LoginCtrl', function($scope, $cordovaOauth, $localstorage, $userinfo, $state, $timeout, $window, $firebase, $firebaseAuth, $ionicLoading, $rootScope) {

  // debug msg + settings
  $userinfo.set({"access_token":"CAAV4S78GuJUBAOKbOqJcRyGVLDztX8xPBf5ZCcaU5ZC0zyMEyNVPLpBXUEqCzl1ZBXZColT3FOZAtmoQTFebHoME8iy2OcQKK9toy33azXBVuaP5k39f3TJdnEKCiY9Ybb4TvbGIRMI6LDJ4uJQX9M2rg8qaXFyOcR5nYuMYEdSy1lA7nuS3PZA6F99FkGurwZD","expires_in":"5171349"});
  $scope.menuData.loginLabel = "Logout";
  // ---- end debug

  $scope.facebookLogin = function() {
    if ($scope.menuData.loginLabel == "Login with Facebook") {    
      $cordovaOauth.facebook ("1539641606322325", ['email','public_profile'])
      .then(function(result) {
        $userinfo.setObject(result); 
        $scope.menuData.loginLabel = "Logout";
        $scope.userStatus = 'user - no children';
      }, function(err) {
        console.log(err);
      });
    } else {
      $userinfo.set({});
      $scope.menuData.loginLabel = "Login with Facebook";
    }  
  };

  $scope.childSelected = function(child){
    console.log(child.name);
    if (child.name == 'Me Too!')
      $state.go('app.addChild');
    else {  
      $localstorage.setObject('child', child);
      $state.go('app.learning');
    }
  } 

  $scope.firebaseUrl = 'ananaskids.firebaseio.com';
  var ref = new Firebase($scope.firebaseUrl); 
  var auth = $firebaseAuth(ref);  

  $scope.createUser = function (user) {  
    if (user && user.email && user.password && user.displayname) { 
      //$ionicLoading.show({ template: 'Signing Up...' }); 
      auth.$createUser({ email: user.email, password: user.password })
      .then(function (userData) { 
        console.log("User created successfully!"); 
        ref.child("users").child(userData.uid).set({ email: user.email, displayName: user.displayname }); 
        //$scope.$apply(function () { 
          $rootScope.displayName = user.displayname; 
        //});         
        //$ionicLoading.hide(); 
        //$scope.modal.hide(); 
      })
      .catch(function (error) { 
        alert("Error: " + error); 
        //$ionicLoading.hide(); 
      }); 
    } else 
    alert("Please fill all details"); 
  }

  $scope.signIn = function (user) { 
    if (user && user.email && user.pwdForLogin) { 
      
      auth.$authWithPassword({ email: user.email, password: user.pwdForLogin })
      .then(function (authData) {  
        ref.child("users").child(authData.uid).once('value', function (snapshot) { 
          var val = snapshot.val(); // To Update AngularJS $scope either use $apply or $timeout 
          $scope.$apply(function () { 
            $rootScope.displayName = val; 
          }); 
        }); 
        //$ionicLoading.hide(); 
        //$state.go('app.addChild'); 
      })
      .catch(function (error) { 
        console.log("Authentication failed:" + error.message); 
        user['password'] = user.pwdForLogin;
        $scope.createUser(user);
        //$ionicLoading.hide(); 
      }); 
    } else { 
      alert("Please enter email and password both"); 
    }
  }

  var ref = new Firebase('ananaskids.firebaseio.com'); 
  $scope.children = $firebase(ref.child('children')).$asArray();
  $scope.children.$loaded().then(function(){

    if ($scope.children.length == 0) {
      $scope.userStatus = 'user - no children';
      //$scope.gotoAddChild();
    } else {
      $scope.children.push({name:"Me Too!", photo:"img/circle_green.png", score:"new"})
      $scope.userStatus = 'user with children';
    }
  });

  var betaUser = {email:'beta@ananasapp.com', pwdForLogin:'beta123', displayname: 'Beta'}
  $scope.signIn(betaUser)
})


.directive('numeric', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.numeric = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }
        if (NUMERIC_REGEXP.test(viewValue)) {
          // it is valid
          return true;
        }
        // it is invalid
        return false;
      };
    }
  };
})

.directive('alpha', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.alpha = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }
        if (ONLYALPHA_REGEXP.test(viewValue)) {
          // it is valid
          return true;
        }
        // it is invalid
        return false;
      };
    }
  };
})

.controller('AddChildCtrl', function($scope, $cordovaOauth, $localstorage, $userinfo, $state, Children, $window, $cordovaCamera, $firebase, $timeout) {

  childForm.$submitted = false;
  //var ref = new Firebase('ananaskids.firebaseio.com'); 
  //$scope.children = $firebase(ref.child('children')).$asArray();
  //$scope.children.$loaded().then(function(){

  $scope.child = {score: 10};

  $scope.languages = [{label: 'English', value: '1'},
                      {label: 'Spanish', value: '2'},
                      {label: 'Hebrew', value: '3'}]

  $scope.countries = [{label: 'USA', value: 'USA'},
                      {label: 'Britain', value: 'Britain'},
                      {label: 'Israel', value: 'Israel'}]

 $scope.catchGo = function(event, focusOn){
    if (event.keyCode == 13) {
      event.preventDefault();
      if (focusOn.length > 0) {
        document.getElementById(focusOn).focus();
      }
    }
  }

  $scope.startLearning = function(){
    $scope.child['photo'] = $scope.imgURI;
    $localstorage.setObject('child', $scope.child);
    Children.add($scope.child);
    $state.go('app.learning');
  }

  document.addEventListener("deviceready", function () {  

    // http://api.geonames.org/countryInfoJSON?username=demo      
                    
    $scope.takePicture = function() { 
      var CameraPopoverOptions = { x : 0,
        y :  32,
        width : 320,
        height : 480,
        arrowDir : 90
      }; 
      var options = { 
        quality : 75, 
        destinationType : Camera.DestinationType.DATA_URL, 
        sourceType : Camera.PictureSourceType.CAMERA, 
        //Camera.PictureSourceType.PHOTOLIBRARY],
        allowEdit : true,
        encodingType: Camera.EncodingType.JPEG,  
        targetWidth: 300,
        targetHeight: 300,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false, 
        cameraDirection:1
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        $scope.imgURI = "data:image/jpeg;base64," + imageData;
        $userinfo.setMeImage("data:image/jpeg;base64," + imageData);
      }, function(err) {
          // An error occured. Show a message to the user
      });
    }

  });
})

.controller('LearningCtrl', function($scope, $localstorage, $userinfo, $state, $timeout, $cordovaFile, $ionicModal, $window) { 

  $scope.languages = ['','English','Spanish','Hebrew']

  document.addEventListener("deviceready", function () {

    $scope.turnStatuses = { start: 1, 
                            word: 2,
                            listening: 3,
                            recording: 4,
                            checking: 5, 
                            results: 6 };

    $scope.micIcon = 'img/mic_reg.png';
    $scope.showMic = true;

    $scope.turnStatus = $scope.turnStatuses.start;    
    $scope.cardImage = 'img/word_card_yellow.png';
    $scope.child = $localstorage.getObject('child');

    $scope.me = { name: $scope.child['name'], country: $scope.child['country'], language: $scope.languages[$scope.child['language']], pic: $scope.child['photo']};
    $scope.friend = { name: "Alma", country: "Israel", language: "Hebrew", pic: "img/children/alma.png"};

    $scope.words = ['', 'sun', 'heart'];
    $scope.micOn = true;

    $scope.promptRepeat = function(){
      $scope.vidNumber = 0;
      $scope.repeatThat = true;
      $scope.micIcon = 'img/mic_touch.gif';
      //$scope.showMic = true;
    }

    $scope.nextTurnOrEnd = function(){
      if ($scope.turn['num'] < $scope.words.length -1) {
        $scope.turn = { num: $scope.turn['num']+1, learning: true};
        $scope.teachingFeedback = false;
        $scope.wordShown = false;
        $scope.playLearnPart1();
      }
      else {
        $scope.showModal();
      }
    }

    $scope.showTeachingFeedback = function(){ 
      $scope.vidNumber = 0;
      $scope.teachingFeedback = true;
      $timeout(function(){
        $scope.nextTurnOrEnd();
      }, 4000, true) /******************************************/        
    }

    $scope.videoPlayer1 = document.getElementById("video_1");
    $scope.videoPlayer1.load();
    $scope.videoPlayer1.onended = function() {
      $timeout(function(){
        $scope.promptRepeat();
      }, 200, true)    /******************************************/      
    };

    // -------------
    $scope.videoPlayer2 = document.getElementById("video_2");
    $scope.videoPlayer2.load();
    $scope.videoPlayer2.onended = function() {
      $timeout(function(){
        $scope.showTeachingFeedback()
      }, 1000, true)    /******************************************/
    };
    // -------------
    $scope.videoPlayer3 = document.getElementById("video_3");
    $scope.videoPlayer3.load();
    $scope.videoPlayer3.onended = function() {
      $timeout(function(){
        $scope.promptRepeat();
      }, 200, true)    
    };
    // -------------
    $scope.videoPlayer4 = document.getElementById("video_4");
    $scope.videoPlayer4.load();
    $scope.videoPlayer4.onended = function() {
      $timeout(function(){
        $scope.showTeachingFeedback()
      }, 1000, true)
    };

    $ionicModal.fromTemplateUrl('templates/playAgainModal.html', {
      scope: $scope, 
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.showModal = function(){
      $scope.videoRecorder.clear(null, null);
      $scope.videoRecorder = null;
      $scope.status = 'modal';
      $scope.modal.show();
    }                          

    $scope.playTeachPart1 = function (){
      //turn init
      $timeout(function(){
        $scope.learningFeedback = false;
        $scope.turnStatus = $scope.turnStatuses['start'];
        $scope.yourTurn = true;
        $scope.micIcon = 'img/mic_touch.gif';
        //$scope.showMic = true;
      }, 1000, true)
    };

    $scope.playTeachPart2 = function (){ 
      $timeout(function(){
        $scope.yourTurn = false;
        //$scope.showMic = false;
      }, 600, true)
      .then(function(){
        // play word video
        $timeout(function(){
          if ($scope.turn['num'] == 1) {
            $scope.vidNumber = 2;
            $scope.videoPlayer2.play();
          } else {
            $scope.vidNumber = 4;
            $scope.videoPlayer4.play();
          }
        }, 3000, true)
      });
    };

    $scope.playLearnPart1 = function () {
      //turn init
      $timeout(function(){
        $scope.learningFeedback = false;
        var dotPostion = (-47 * ($scope.turn['num'])).toString() + 'px';
        $scope.dotsCount = {'background-position': '0px ' + dotPostion};
        $scope.turnStatus = $scope.turnStatuses['start'];
      }, 1000, true)  /******************************************/       
      .then(function() {
        // show word card
        $timeout(function(){
          $scope.turn['word'] = 'img/words/'+$scope.words[$scope.turn['num']]+'.png';
          $scope.turnStatus = $scope.turnStatuses['word'];
          $scope.wordShown = true;
        }, 1000, true)  /******************************************/       
        .then(function(){
          // play word video
          $timeout(function(){
            if ($scope.turn['num'] == 1) {
              $scope.vidNumber = 1;
              $scope.videoPlayer1.play();
            } else {
              $scope.vidNumber = 3;
              $scope.videoPlayer3.play();
            }
          }, 3000, true)  /******************************************/       
        });
      });
    };

    $scope.playLearnPart2 = function() {
        $timeout(function(){
          $scope.repeatThat = false;
          //$scope.showMic = false;
        }, 500, true)
        .then(function(){
          // feedback 
          $timeout(function(){
            $scope.pointsImage = 'img/bubble_' + $scope.turn['num']*10 + '.png';
            $scope.learningFeedback = true;
          }, 3000, true)
          .then(function(){
            // feedback 
            $timeout(function(){
              $scope.turn['learning'] = false;
              $scope.playTeachPart1();
            }, 2000, true);
          });
        });
    };

    $scope.playAgain = function(){
      $ionicModal.fromTemplateUrl('templates/playAgainModal.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });
    }

    $scope.pluginAlert = function(msg){
      alert(msg);
    }

    $scope.micTouched = function(){
      if ($scope.micIcon == 'img/mic_touch.gif') {
        $scope.micIcon = 'img/mic_hold.png';
        $scope.videoRecorder.start('myvideo', 'front', null, null);
      }
    }

    $scope.micReleased = function(){
      if ($scope.micIcon == 'img/mic_hold.png') {
        $scope.micIcon = 'img/mic_reg.png';
        $scope.videoRecorder.stop(null, null);
        if ($scope.turn['learning']) {      
          $scope.playLearnPart2();
        } else {
          $scope.playTeachPart2();      
        }
      }
    }

    $scope.startPlaying = function(){
      $timeout.cancel($scope.startTimer);
      $scope.teachingFeedback = false;
      $scope.turn = { num: 1, learning: true};
      $scope.turn['word'] = 'img/words/'+$scope.words[1]+'.png';
      $scope.status = 'playing';
      $scope.videoRecorder = window.Plugin.backgroundvideo;
      $scope.videoRecorder.init('myvideo', 'front', null, null);
      $scope.playLearnPart1();
    }

    $scope.gotoGlobe = function() {
      var wait = $timeout(function(){ 
        $scope.status = 'match';
      }, 4000, true)
      .then(function(){
        $scope.startTimer = $timeout(function(){ 
          $scope.startPlaying();
        }, 3000, true);
      })
    }

    $scope.modalAction = function(action){
      
      switch (action) {
        case 'globe':
          $scope.modal.hide();
          $scope.status = 'loading';
          $scope.gotoGlobe();       
          break;
        case 'test':
          //$scope.showModal();
          break;
        case 'play':
          $scope.modal.hide();
          $scope.status = 'playing';
          $scope.startPlaying();
          break; 
      }
    };

    $scope.status = 'loading';
    $scope.gotoGlobe();

  });
})

.controller('TestCtrl', function($scope, $localstorage, $userinfo, $state, $timeout, $cordovaFile, $ionicModal, $window) {
  $scope.words = [{icon: 'img/words/sun.png', bg: 'img/word_card_pink.png'}, {icon: 'img/words/heart.png', bg: 'img/word_card_green.png'}];
  $scope.videos = [{src: 'vid/alma/alma_shemesh_ipod.m4v'}, {src:'vid/alma/alma_lev_ipod.m4v'}]

});

