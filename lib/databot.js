var irc = require("irc"),
    fs = require("fs"),
    colors = require("colors");
    

var databot = exports;

databot.start = function (config) {
  
  var client = new irc.Client(config.server, config.nick, config);
  console.log("info: Connecting to IRC server...".grey);
  
  client.on("motd", function () {
    console.log("info: Connection to IRC server successful.".green);
    databot.timers.start();
    databot.startTime = new Date();
  });
  
  config.channels.forEach(function (channel, index) {
    client.on("pm", function (from, message){
      if (message.match(/.*GTFO!.*/)) {
        databot.data.push(databot.currentCount);
        databot.endTime = new Date();
        console.log("Killed by "+from.red+".");
        databot.exit(client);
      }
    });
    client.on("message", function (from, to, message){
      databot.currentCount++;
    });
  });

}

databot.timespan = 60;
databot.currentCount = 0;
databot.rollingValues = [];
databot.data = [];


databot.timers = {

  start : function () {
    
    databot.timers.everySecond = setInterval(function() {
      if (databot.rollingValues.length >= databot.timespan) {
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
    }, databot.timespan);
    
  },
  
  everySecond : '',
  
  everyTimeSpan : ''

};

databot.exit = function (client) {
  var buf = 'Started: '+databot.startTime.getMonth()+' '+databot.startTime.getDate()+' '+databot.startTime.getHours()+':'+databot.startTime.getMinutes()+'\n';
  buf = buf + 'Stopped: '+databot.startTime.getMonth()+' '+databot.endTime.getDate()+' '+databot.endTime.getHours()+':'+databot.endTime.getMinutes()+'\n';
  databot.data.forEach(function (rate, index) {
    buf = buf + 'Minute: '+index+' Messages: '+rate+'\n';
  });
  fs.writeFileSync('ratedata.txt', buf);
  client.disconnect();
  process.exit();
}