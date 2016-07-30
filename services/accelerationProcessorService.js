var WebSocketServer = require('ws').Server
var wss             = new WebSocketServer({ port: 8080 });

var DEFAULT_ACCELERATION = 0.75;

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

var speed, kms, lastEvent;

exports.startGame = function() {
  speed = kms = lastEvent = 0;
}

exports.onEvent = function(event) {
  if (lastEvent == undefined) {
    exports.startGame()
  }
  if (lastEvent == 0) {
    lastEvent = event.timestamp
  }

  var diff = (event.timestamp - lastEvent) / 1000;
  console.log('Diff: ' + diff);
  var acceleration = event.mod * 9.81;
  if (acceleration > 0) {
    acceleration *= DEFAULT_ACCELERATION;
  } else if (acceleration == 0) {
    acceleration = -0.5;
  }
  console.log('Acc: ' + acceleration);
  speed += diff * acceleration

  if (speed < 0) {
    speed = 0;
  }

  var data = event;
  data.speed = speed;
  wss.broadcast(JSON.stringify(data));
  lastEvent = event.timestamp
}

// wss.broadcast(JSON.stringify(data));
