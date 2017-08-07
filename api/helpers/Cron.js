const request = require('request');
const StatusBot = require('./StatusBot.js');

// const cronUrl = 'http://localhost:8888/status_backend/cron';
const cronUrl = 'http://165.227.69.214/status_backend/cron';

module.exports = {
  runJob: function() {
    console.info('Running cron job...');
    request(cronUrl, function(error, response, body){
      if (!error){
        var parsed = JSON.parse(body);
        console.info(parsed.error);
      }
    });
  }
}