
var SensorTag = require('sensortag');		// sensortag library

var accelerationService = require('./accelerationProcessorService');

exports.readTag = function() {

  // listen for tags:
  SensorTag.discover(function(tag) {
    // when you disconnect from a tag, exit the program:
    tag.on('disconnect', function() {
      console.log('disconnected!');
      process.exit(0);
    });

    function connectAndSetUpMe() {			// attempt to connect to the tag
       console.log('connectAndSetUp');
       tag.connectAndSetUp(enableAccelMe);		// when you connect and device is setup, call enableAccelMe
     }

     function enableAccelMe() {		// attempt to enable the accelerometer
       console.log('enableAccelerometer');
       // when you enable the accelerometer, start accelerometer notifications:
       tag.enableAccelerometer(notifyMe);
     }

    function notifyMe() {
       tag.notifyAccelerometer(listenForAcc);   	// start the accelerometer listener
      //  tag.notifySimpleKey(listenForButton);		// start the button listener
     }

     // When you get an accelermeter change, print it out:
    function listenForAcc() {
      tag.on('accelerometerChange', function(x, y, z) {
        z = z - 4
        x = (x/4).toFixed(1);
        y = (y/4).toFixed(1);
        z = (z/4).toFixed(1);
        var mod = Math.sqrt(Math.pow(z, 2) + Math.pow(x, 2));
        var data = { timestamp: new Date().getTime(), x: x, y: y, z: z, mod: mod/4 }
        // console.log(JSON.stringify(data));
        accelerationService.onEvent(data);
      });
    }

    // // when you get a button change, print it out:
    // function listenForButton() {
    //   tag.on('simpleKeyChange', function(left, right) {
    //     if (left) {
    //       console.log('left: ' + left);
    //     }
    //     if (right) {
    //       console.log('right: ' + right);
    //     }
    //     // if both buttons are pressed, disconnect:
    //     if (left && right) {
    //       tag.disconnect();
    //     }
    //    });
    // }

    // Now that you've defined all the functions, start the process:
    connectAndSetUpMe();
  });
};
