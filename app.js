'use strict';

var SwaggerExpress = require('swagger-express-mw');
const express = require('express');
const schedule = require('node-schedule');
const Cron = require('./api/helpers/Cron.js');

var app = express();
module.exports = app; // for testing

var config = {
    appRoot: __dirname // required config
};

// Host Swagger-UI
app.use('/docs', express.static('docs'));

SwaggerExpress.create(config, function (err, swaggerExpress) {
    if (err) {
        throw err;
    }

    // install middleware
    swaggerExpress.register(app);

    var port = process.env.PORT || 8080;
    console.log("Slackbot service API running at http://localhost:" + port);
    app.listen(port);
});


var checkFrequency = 1; //1 minutes

schedule.scheduleJob(`*/${checkFrequency} * * * *`, Cron.runJob);

