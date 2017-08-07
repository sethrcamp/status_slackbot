const request = require('request');
const StatusBot = require('./StatusBot.js');

const cronUrl = 'http://localhost:8888/status_backend/cron';
// const cronUrl = 'https://apso.bsu.edu/2016/equipment_checkout/backend/api/v2/reservation.validate';

module.exports = {
  runJob: function() {
    console.info('Running cron job...');
    request(cronUrl, function(error, response, body){
      if (!error){
        var parsed = JSON.parse(body);
        console.info(parsed.msg);
      }
    });
  }
}