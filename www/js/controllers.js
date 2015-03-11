var NUMERIC_REGEXP = /^\-?\d+$/;
var ONLYALPHA_REGEXP = /^[A-Za-z ]+$/;

angular.module('ananas.controllers', ['ionic', 'ananas.services', 'firebase', 'angular-carousel'])

.controller('MenuCtrl', function($scope, $localstorage, $userinfo, $state, $window,$firebase, $firebaseAuth, $timeout) {

  $scope.goToLogin = function(){
    $state.go('app.login');
  }

  if ($scope.videoRecorder) {
    //window.Plugin.backgroundvideo.clear(null, null);
  }

  $scope.firebaseUrl = 'ananaskids.firebaseio.com';
  var ref = new Firebase($scope.firebaseUrl);

  $scope.menuAction = function(action){
    switch (action) {
      case 'about':
        alert('about')
        break;
      case 'privacy':
        alert('privacy')
        break;
      case 'logout':
        ref.unauth();
        $state.go('app.welcome'); 
        $timeout(function(){
          $state.go('app.login');
        }, 2500, true)
        break;
    }
  }

})

.controller('WelcomeCtrl', function($scope, $localstorage, $state, $timeout) {
 
  document.addEventListener("deviceready", function () { 
    $timeout(function(){$state.go('app.login');}, 2500, true)
  });


})

.controller('LoginCtrl', function($scope, $localstorage, $userinfo, $state, $timeout, $window, $firebase, $firebaseAuth, $ionicLoading, $rootScope) {

  $scope.catchGo = function(event, focusOn){
    if (event.keyCode == 13) {
      event.preventDefault();
      if (focusOn.length > 0) {
        document.getElementById(focusOn).focus();
      } else {
        cordova.plugins.Keyboard.close();
      }
    }
  }

  $scope.loadChildren = function(parentEmail) {

    $scope.children = $firebase(ref.child('children')).$asArray();
    $scope.children.$loaded().then(function(){
      $scope.myChildren = [];
      if ($scope.children.length == 0) {
        $scope.userStatus = 'user - no children';
      } else {
        for (var i = $scope.children.length - 1; i >= 0; i--) {
          if ($scope.children[i].parentEmail == parentEmail) {
            $scope.myChildren.push($scope.children[i]);
          } 
        };
        if ($scope.myChildren.length == 0) {
          $scope.userStatus = 'user - no children';
        } else {
          $scope.myChildren.push({name:"Me Too!", photo:"img/circle_green.png", score:"new"})
          $scope.userStatus = 'user with children';
        }
      }
    });
  }

  $scope.authDataCallback = function(authData) {
    if (authData) {
      $localstorage.set("parentEmail", authData.password.email);
      $scope.loadChildren(authData.password.email);
    } else {
      $scope.userStatus = 'no user';
    }
  }

  $scope.signIn = function () { 
    var parent = $scope.parent
    if (parent && parent.email && parent.password) { 
      
      auth.$authWithPassword({ email: parent.email, password: parent.password })
      .then(function (authData) {  
        $localstorage.set("parentEmail", parent.email);
        $scope.loadChildren(parent.email); 
      })
      .catch(function (error) { 
        $scope.createParent(parent);
      }); 
    } else { 
      alert("Please enter email and password both"); 
    }
  }

  $scope.createParent = function (parent) {  
    if (parent && parent.email && parent.password) { 
      auth.$createUser({ email: parent.email, password: parent.password })
      .then(function (userData) { 
        ref.child("users").child(userData.uid).set({ email: parent.email, year: parent.year });
        $localstorage.set("parentEmail", parent.email);
        $scope.loadChildren(parent.email);
      })
      .catch(function (error) { 
        alert("Error: " + error); 
      }); 
    } else 
    alert("Please fill all details"); 
  }

  $scope.childSelected = function(child){
    if (child.name == 'Me Too!')
      $state.go('app.addChild');
    else {  
      $localstorage.setObject('child', child);
      $state.go('app.learning');
    }
  } 

  $scope.parent = {}; 

  $scope.firebaseUrl = 'ananaskids.firebaseio.com';
  var ref = new Firebase($scope.firebaseUrl);
  var auth = $firebaseAuth(ref); 
  ref.onAuth($scope.authDataCallback); 

})


.directive('year', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.year = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue) || !NUMERIC_REGEXP.test(viewValue)) {
          // consider empty models to be valid
          return true;
        }
        if (viewValue >= 1950 && viewValue <= 2015) {
          // it is valid
          return true;
        }
        // it is invalid
        return false;
      };
    }
  };
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

.controller('AddChildCtrl', function($scope, $localstorage, $userinfo, $state, Children, $window, $cordovaCamera, $firebase, $timeout) {

  var parentEmail = $localstorage.get("parentEmail")
  childForm.$submitted = false;

  $scope.child = {score: 10, parentEmail: parentEmail};

  $scope.languages = [{label: 'English', value: '1'},
                      {label: 'Chinese', value: '2'},
                      {label: 'French', value: '3'},
                      {label: 'German', value: '4'},
                      {label: 'Hebrew', value: '5'},
                      {label: 'Arabic', value: '6'},
                      {label: 'Spanish', value: '7'}]


  $scope.countries = [{label: 'USA', value: 'USA'},
                      {label: 'Britain', value: 'Britain'},
                      {label: 'China', value: 'China'},
                      {label: 'France', value: 'France'},
                      {label: 'Germany', value: 'Germany'},
                      {label: 'Israel', value: 'Israel'},
                      {label: 'Jordan', value: 'Jordan'},
                      {label: 'Spain', value: 'Spain'}, 
                      {label: 'Other', value: 'Other'}]

  $scope.startLearning = function(){
    $scope.child['photo'] = $scope.imgURI;
    $localstorage.setObject('child', $scope.child);
    Children.add($scope.child);
    $state.go('app.learning');
  }

  document.addEventListener("deviceready", function () {  
                    
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

  $scope.languages = ['','English', 'Chinese', 'French', 'German', 'Hebrew', 'Arabic', 'Spanish'];

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
    $scope.showRepeatVideo = false;
    $scope.countdownNumber = '';
    $scope.menuIconClass = "black" 

    $scope.onTakeSuccess= function(data) {
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
      $userinfo.setMeImage("data:image/jpeg;base64," + imageData);
    }    

    $scope.initCamera = function(){

      console.log("init camera")

      canvasMain = document.getElementById("camera");
      CanvasCamera.initialize(canvasMain);
      // define options
      var opt = {
          quality: 95,
          destinationType: CanvasCamera.DestinationType.DATA_URL,
          encodingType: CanvasCamera.EncodingType.JPEG,
          saveToPhotoAlbum:true,
          correctOrientation:true,
          width:100,
          height:100, 
          cameraDirection:1
      };
      CanvasCamera.start(opt);

      // to take a pic -       CanvasCamera.takePicture(onTakeSuccess);

    }

    $scope.promptRepeat = function(){
      //$scope.vidNumber = 0;
      var friendsScreen =  document.getElementById("my-screen");
      Velocity(friendsScreen, { width:  "0px"}, { duration: 50 });
      $scope.showRepeatVideo = true;
      $scope.repeatThat = true;
      $scope.micIcon = 'img/mic_touch.gif';
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
      }, 1500, true)      
    }

    $scope.videoPlayer1 = document.getElementById("video_1");
    $scope.videoPlayer1.load();
    $scope.videoPlayer1.onended = function() {
      $timeout(function(){
        $scope.promptRepeat();
      }, 200, true)         
    };

    // -------------
    $scope.videoPlayer2 = document.getElementById("video_2");
    $scope.videoPlayer2.load();
    $scope.videoPlayer2.onended = function() {
      $timeout(function(){
        $scope.showTeachingFeedback()
      }, 400, true)    
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
      }, 400, true)
    };

    $ionicModal.fromTemplateUrl('templates/playAgainModal.html', {
      scope: $scope, 
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.showModal = function(){
      //window.Plugin.backgroundvideo.clear(null, null);
      //$scope.videoRecorder = null;
      $scope.status = 'match';
      $scope.modal.show();
    }                          

    $scope.playStep3 = function (){

      $timeout(function(){
        $scope.learningFeedback = false;
        $scope.turnStatus = $scope.turnStatuses['start'];
        $scope.showRepeatVideo = false;
        //$scope.friendsTurn = false;

        $scope.yourTurn = true;
        $scope.micIcon = 'img/mic_touch.gif';
      }, 1000, true)
    };

    $scope.playStep4 = function (){ 
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
        }, 1500, true)
      });
    };

    $scope.playStep1 = function () {
      //turn init      
      $timeout(function(){
        var friendsScreen =  document.getElementById("friends-screen");
        Velocity(friendsScreen, { width:  "0px"}, { duration: 200 });
        $scope.turn['word'] = 'img/words/'+$scope.words[$scope.turn['num']]+'.png';
        $scope.turnStatus = $scope.turnStatuses['word'];
        $scope.wordShown = true;
      }, 100, true)  
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
        }, 2000, true)       
      });
    };

    $scope.playStep2 = function() {
        $timeout(function(){
          $scope.repeatThat = false;
        }, 500, true)
        .then(function(){
          // feedback 
          $timeout(function(){
            $scope.pointsImage = 'img/bubble_' + $scope.turn['num']*10 + '.png';
            $scope.learningFeedback = true;
          }, 500, true)
          .then(function(){
            // feedback 
            $timeout(function(){
              $scope.turn['learning'] = false;
              $scope.playStep3();
            }, 1000, true);
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

    $scope.micTouched = function(){
      if ($scope.micIcon == 'img/mic_touch.gif') {
        $scope.micIcon = 'img/mic_hold.png';
        //$scope.videoRecorder.start('myvideo', 'front', null, null);
      }
    }

    $scope.micReleased = function(){
      if ($scope.micIcon == 'img/mic_hold.png') {
        $scope.micIcon = 'img/mic_reg.png';
        //$scope.videoRecorder.stop(null, null);
        if ($scope.turn['learning']) {      
          $scope.playStep2();
        } else {
          $scope.playStep4();      
        }
      }
    }

    $scope.startPlaying = function(){  
      $timeout(function(){
        $scope.learningFeedback = false;
        var dotPostion = (-47 * ($scope.turn['num'])).toString() + 'px';
        $scope.dotsCount = {'background-position': '0px ' + dotPostion};
        $scope.turnStatus = $scope.turnStatuses['start'];
        $scope.initCamera();
        $scope.playStep1();
      }, 1000)
    };

    $scope.countdown = function () {
      if (!$scope.audioPlayer) {
        $scope.audioPlayer = new Audio('assets/audio/bell.wav')
        $scope.audioPlayer.load();
      }
      var cd = document.getElementById("countdown");
      cd.style.opacity = 0;
      $scope.countdownNumber = 3;
      Velocity(
        cd, 
        { opacity: [1,0], 'font-size': ['120px', '0px'] }, 
        { duration: 1000, 
          complete: function(){
            Velocity(
              cd, 
              { opacity: [1,0], 'font-size': ['120px', '0px'] }, 
              { duration: 1000, 
                begin: function(){cd.style.opacity = 0; $scope.countdownNumber--; $scope.$apply(); },
                complete: function(){
                  Velocity(
                    cd, 
                    { opacity: [1,0], 'font-size': ['120px', '0px'] }, 
                    { duration: 800, 
                      begin: function(){cd.style.opacity = 0; $scope.countdownNumber--; $scope.$apply(); }, 
                      complete: function(){cd.style.opacity = 0; $scope.audioPlayer.play(); $scope.startPlaying();}
                    }
                  )
                }
              }
            )
          }
        }
      )
    };


    $scope.gameSetup = function(){
      $scope.wordShown = false;
      var friendsScreen =  document.getElementById("friends-screen");
      friendsScreen.style.width = "512px";
      var myScreen =  document.getElementById("friends-screen");
      myScreen.style.width = "512px";
      $timeout.cancel($scope.startTimer);
      $scope.countdownNumber = '';
      $scope.teachingFeedback = false;
      $scope.turn = { num: 1, learning: true};
      $scope.turn['word'] = 'img/words/'+$scope.words[1]+'.png';
      $scope.menuIconClass = "white" 
      $scope.status = 'playing';

      $scope.countdown()
    }

    $scope.showMatch = function () {
      $scope.startTimer = $timeout(function(){ 
        if ($scope.status == 'match'){
          $scope.gameSetup();
        }
      }, 3000, true); 
    }

    $scope.hideGlobe = function(){
      $timeout.cancel($scope.globeTimer);
      $scope.status = 'match';
      $scope.showMatch();
    }

    $scope.gotoGlobe = function() {
      $scope.menuIconClass = "black";
      $scope.status = 'loading';
      $scope.globeTimer = $timeout(function(){
        if ($scope.status == 'loading') {
          $scope.hideGlobe();
        }
      }, 4000, true)
      .then(function(){
        $scope.showMatch();
      })
    }

    $scope.modalAction = function(action){
      $scope.modal.hide();
      switch (action) {
        case 'globe':
          $scope.gotoGlobe();       
          break;
        case 'test':
          $state.go('app.test');
          break;
        case 'play':
          $scope.status = 'playing';
          $scope.gameSetup();
          break; 
      }
    };

    $scope.repeatVideo = function(){
      if ($scope.vidNumber >=1 && $scope.vidNumber <=4) {
        $scope.videoPlayer = document.getElementById("video_" + $scope.vidNumber);
        $scope.videoPlayer.play();
      }
    }

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
        ctx.strokeStyle = "#75E2C4";
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
            } else {
              if (current_connection.startType !== endElem.type) {
                if (current_connection.startWord === endElem.word) {
                  connections.push(current_connection);
                } else {
                  // show message - no match
                }

              } else { 
                // show message - connect video to word or vice-versa.
              } 
            }
            redrawStoredLines(ctx);
            if (connections.length == 2) {
              console.log("2")
              $scope.giveFeedback();
            }
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

  $scope.giveFeedback = function(){
    $scope.state = "feedback";
    $scope.$apply();
  }

  $scope.words = [{word: 'sun', icon: 'img/words/sun.png', bg: 'img/word_card_pink.png'}, 
                  {word: 'heart', icon: 'img/words/heart.png', bg: 'img/word_card_green.png'}];
  $scope.videos = [{id:"0", word: 'sun', src: 'assets/videos/alma/alma_shemesh_ipod.m4v'}, 
                  {id: "1", word: 'heart', src:'assets/videos/alma/alma_lev_ipod.m4v'}]
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

