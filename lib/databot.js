var irc = require("irc"),
    fs = require("fs"),
    colors = require("colors");
    

var databot = exports;

databot.start = function (config) {
  
  var client = new irc.Client(config.server, config.nick, config);
  console.log("info: Connecting to IRC server...".grey);
  
  client.on("motd", function () {
    console.log("info: Connection to IRC server successful.".green);
    databot.timer.start();
    databot.startTime = new Date();
  });
  
  config.channels.forEach(function (channel, index) {
    client.on("message" + channel, function (from, message){
      if (message.match(/.*hey\sWallyDater\sGTFO!.*/)) {
        databot.data.push(databot.currentCount);
        databot.endTime = new Date();
        console.log("Killed by "+from+".".red);
        databot.exit(client);
        return false;
      }
      databot.currentCount++;
    });
  });

}

databot.currentCount = 0;

databot.data = [];

databot.timer = {

  start : function () {
    databot.timer.timer = setTimeout(function () {
      databot.data.push(databot.currentCount);
      databot.currentCount = 0;
      databot.timer.start();
    }, 60000);
  },
  
  timer : ''

};

databot.exit = function (client) {
  var buf = 'Started: '+databot.startTime.getMonth()+' '+databot.startTime.getDate()+' '+databot.startTime.getHours()+':'+databot.startTime.getMinutes()+'\n';
  buf = buf + 'Stopped: '+databot.startTime.getMonth()+' '+databot.endTime.getDate()+' '+databot.endTime.getHours()+':'+databot.endTime.getMinutes()+'\n';
  databot.data.forEach(function (rate, index) {
    buf = buf + 'Minute: '+index+' Messages: '+rate+'\n';
  });
  fs.writeFileSync('ratedata.txt', buf);
  client.disconnect();
  return false;
}