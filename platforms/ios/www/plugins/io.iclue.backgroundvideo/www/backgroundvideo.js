cordova.define("io.iclue.backgroundvideo.backgroundvideo", function(require, exports, module) { var backgroundvideo = {
    init : function(filename, camera, successFunction, errorFunction) {
    	camera = camera || 'back';
        cordova.exec(successFunction, errorFunction, "backgroundvideo","init", [filename, camera]);
    },

    start : function(filename, camera, successFunction, errorFunction) {
    	camera = camera || 'back';
        cordova.exec(successFunction, errorFunction, "backgroundvideo","start", [filename, camera]);
    },
    stop : function(successFunction, errorFunction) {
        cordova.exec(successFunction, errorFunction, "backgroundvideo","stop", []);
    },
    clear : function(successFunction, errorFunction) {
        cordova.exec(successFunction, errorFunction, "backgroundvideo","clear", []);
    }
};

//module.exports = backgroundvideo;

//todo:fixthis
window.Plugin.backgroundvideo = backgroundvideo;
});
