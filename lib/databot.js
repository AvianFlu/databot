var irc = require("irc"),
    fs = require("fs"),
    colors = require("colors"),
    winston = require("winston");
    

var databot = exports;



databot.start = function (config) {

  winston.add(winston.transports.File, { filename: config.msgFile });
  
  databot.rateLog = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: config.rateFile })
    ]
  });
  
  var client = new irc.Client(config.server, config.nick, config);
  winston.info("Connecting to IRC server...".grey);
  
  client.on("motd", function () {
    winston.info("info: Connection to IRC server successful.".green);
    databot.timers.start(config.timespan);
  });
  
  config.channels.forEach(function (channel, index) {
    client.on("pm", function (from, message){
      if (message.match(/.*GTFO!.*/)) {
        winston.warn(("Killed by "+from+".").red);
        databot.exit(client);
      }
    });
    client.on("message", function (from, to, message){
      databot.currentCount++;
      winston.info(to + " " + from + ": " + message);
    });
    client.on("join", function (channel, nick) {
      if (config.joins) {
        winston.info(nick + " has joined " + channel);
      }
    });
    client.on("part", function (channel, nick, reason) {
      if (config.parts) {
        winston.info(nick + " has left " + channel + " because: " + reason);
      }
    });
    client.on("quit", function (nick, reason, channels) {
      if (config.quits) {
        winston.info(nick + " has quit: " + reason);
      }
    });
  });

}

databot.currentCount = 0;
databot.rollingValues = [];
databot.data = [];


databot.timers = {

  start : function (timespan) {
    
    databot.timers.everySecond = setInterval(function() {
      if (databot.rollingValues.length >= timespan) {
        databot.rollingValues.shift();
      }
      databot.rollingValues.push(databot.currentCount);
      databot.currentCount = 0;
    }, 1000);
    
    databot.timers.everyTimeSpan = setInterval(function() {
      var sum = 0
      databot.rollingValues.forEach(function (v) {
        sum += Number(v);
      });
      databot.data.push(sum);
      databot.rateLog.info(sum);
    }, timespan * 1000);
    
  },
  
  everySecond : '',
  
  everyTimeSpan : ''

};

databot.exit = function (client) {
  client.disconnect();
  process.exit(0);
}