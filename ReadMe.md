# databot - bot for passive IRC data gathering

## v0.0.1 - EXPERIMENTAL

`Databot` has been upgraded, and now implements configurable Winston logging of most major IRC events, as well as the rate of messages per minute in the joined channel.  

Configuration object, currently in `bin/databot`:

     config = {
       server : "irc.freenode.net",
       nick : "WallyDater",
       userName : "databot",
       realName : "DateUhBawt",
       channels : [ "#Node.js" ],
       timespan : 60,
       rateFile : "ratelog.log",
       msgFile : "msglog.log",
       joins : true,
       parts : true,
       quits : true
     }

To make `databot` quit, simply send the bot a private message containing the string `GTFO!`

That's all so far - issues, forks, and pull requests welcome!