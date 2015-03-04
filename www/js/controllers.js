var NUMERIC_REGEXP = /^\-?\d+$/;
var ONLYALPHA_REGEXP = /^[A-Za-z ]+$/;

angular.module('ananas.controllers', ['ionic', 'ananas.services', 'firebase', 'angular-carousel'])

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
  //$userinfo.set({"access_token":"CAAV4S78GuJUBAOKbOqJcRyGVLDztX8xPBf5ZCcaU5ZC0zyMEyNVPLpBXUEqCzl1ZBXZColT3FOZAtmoQTFebHoME8iy2OcQKK9toy33azXBVuaP5k39f3TJdnEKCiY9Ybb4TvbGIRMI6LDJ4uJQX9M2rg8qaXFyOcR5nYuMYEdSy1lA7nuS3PZA6F99FkGurwZD","expires_in":"5171349"});
  //$scope.menuData.loginLabel = "Logout";
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
      $scope.modal.hide();
      switch (action) {
        case 'globe':
          $scope.status = 'loading';
          $scope.gotoGlobe();       
          break;
        case 'test':
          $state.go('app.test');
          break;
        case 'play':
          $scope.status = 'playing';
          $scope.startPlaying();
          break; 
      }
    };

    $scope.status = 'loading';
    $scope.gotoGlobe();

  });
})

.directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () { 
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  }
})

.directive('connectableElement', function(){
  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      $attrs.$observe('connectableElement', function(value) {
        $scope.connectableElements.push(
        {vidId: $attrs.vidid, 
          type: $attrs.type,
          word: $attrs.word,
          rect: 
          {left: $element[0].getBoundingClientRect().left, 
            right: $element[0].getBoundingClientRect().right,
            top: $element[0].getBoundingClientRect().top,
            bottom: $element[0].getBoundingClientRect().bottom
          }
        })
      })
    }
  }
})

.directive('ananasDrawAndPlay', function() {

  var connections = [];

  var redrawStoredLines = function(ctx){
    ctx.clearRect(0,0,1024,768);
    if(connections.length==0){ return; }
    for(var i=0;i<connections.length;i++){
      var current_connection = connections[i].sections;
      for(var j=0;j<current_connection.length;j++){
        ctx.beginPath();
        ctx.strokeStyle = "Green";
        ctx.moveTo(current_connection[j].x1, current_connection[j].y1);
        ctx.lineTo(current_connection[j].x2, current_connection[j].y2);
        ctx.stroke();
      }
    } 
  };

  return {
    restrict: 'A',
    link: function($scope, $element) {
      var ctx = $element[0].getContext('2d'),
          drawing = false,
          posX = 0,
          posY = 0,
          lastPosX = 0,
          lastPosY = 0;
          current_connection = {startType:"", sections:[]};          

      ionic.onGesture('touch drag dragend tap',  function(e) {
        e.gesture.srcEvent.preventDefault();
        e.gesture.preventDefault();
        switch (e.type) {
          case 'touch':
            lastPosX = e.gesture.center.pageX; 
            lastPosY = e.gesture.center.pageY;
            var startElem = $scope.onElement({x: lastPosX, y: lastPosY});
            if (startElem !== null) {
              current_connection.startType = startElem.type;
              current_connection.startWord = startElem.word;
              ctx.beginPath();  
              drawing = true;
            }
            else {
              // show message - start and end on words/videos
              drawing = false;
            }
            break;
          case 'drag':
            if (drawing) {
              posX = e.gesture.center.pageX; 
              posY = e.gesture.center.pageY;           
              ctx.moveTo(lastPosX,lastPosY);
              ctx.lineTo(posX,posY); //to 
              ctx.strokeStyle = "#fff";
              ctx.lineWidth=16;
              ctx.stroke();
              current_connection.sections.push({x1: lastPosX, y1: lastPosY, x2: posX, y2: posY});
              lastPosX = posX; // set current coordinates to last one
              lastPosY = posY;
            }
            break;
          case 'dragend':
            lastPosX = e.gesture.center.pageX; 
            lastPosY = e.gesture.center.pageY;
            var endElem = $scope.onElement({x: lastPosX, y: lastPosY});
            if (endElem === null) {
              // show message - start and end on words/videos
              //redrawStoredLines(ctx)

            } else {
              if (current_connection.startType !== endElem.type) {
                if (current_connection.startWord === endElem.word) {
                  connections.push(current_connection);
                } else {
                  // show message - no match
                  //redrawStoredLines(ctx);
                }

              } else { 
                // show message - connect video to word or vice-versa.
                //redrawStoredLines(ctx);
              } 
            }
            redrawStoredLines(ctx);
            current_connection = {startType:"", sections:[]};
            drawing = false;   
            break;
          case 'tap':
            lastPosX = e.gesture.center.pageX; 
            lastPosY = e.gesture.center.pageY;
            var elem = $scope.onElement({x: lastPosX, y: lastPosY});
            if (elem !== null && elem.type == 'video') {
              $scope.playVideo(elem.vidId);
            }
            break;
        }
      }, $element[0]);
    }
  }
})

.controller('TestCtrl', function($scope, $localstorage, $userinfo, $state, $timeout, $cordovaFile, $ionicModal, $swipe, $window) {

  $state.reload() 
  $scope.shuffleArray = function(array) {
    var m = array.length, t, i;
    while (m) {     // While there remain elements to shuffle
      i = Math.floor(Math.random() * m--); // Pick a remaining element…
      t = array[m]; // And swap it with the current element.
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  $scope.words = [{word: 'sun', icon: 'img/words/sun.png', bg: 'img/word_card_pink.png'}, {word: 'heart', icon: 'img/words/heart.png', bg: 'img/word_card_green.png'}];
  $scope.videos = [{id:"0", word: 'sun', src: 'vid/alma/alma_shemesh_ipod.m4v'}, {id: "1", word: 'heart', src:'vid/alma/alma_lev_ipod.m4v'}]
  $scope.videos = $scope.shuffleArray ($scope.videos);
  $scope.connectableElements = [];
 
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    $scope.videoPlayer0 = document.getElementById("video-0");
    $scope.videoPlayer0.load();
    $scope.videoPlayer1 = document.getElementById("video-1");
    $scope.videoPlayer1.load();
  });

  $scope.onElement = function(coords) {
    var inElement = null;
    for (var i = $scope.connectableElements.length - 1; i >= 0; i--) {
      var elementSpace = $scope.connectableElements[i].rect;
      if (coords.x >= elementSpace.left && coords.x <= elementSpace.right && 
          coords.y >= elementSpace.top && coords.y <= elementSpace.bottom) {
        inElement = { vidId: $scope.connectableElements[i].vidId, word: $scope.connectableElements[i].word, type: $scope.connectableElements[i].type }
        break;
      }
    };
    return inElement;
  }

  $scope.playVideo = function(vidId) {
    $scope.videoPlayer = document.getElementById("video-" +vidId);
    $scope.videoPlayer.play();
  }

});

