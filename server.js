const schedule = require('node-schedule');
const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon")
const { PORT, connect } = require("./lib/connect");
const { scrapeSubs } = require('./lib/scraper');

serveHTTP(addonInterface, { port: PORT })
.then(res => {
    scrapeSubs()
    connect().then((uri) => {
        console.log(`MONGO URI: ${uri}`)
        scrapeSubs()
        schedule.scheduleJob('* * 3 * * ', function(){
            console.log('Scraper started');
//            scrapeSubs()
          });
    }).catch(console.error)
})