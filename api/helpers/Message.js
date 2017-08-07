const StatusBot = require('./StatusBot');
const Formatter = require('../middleware/ResponseFormatter');

module.exports = {
  sendMessage: function (message, toUser, res) {
    StatusBot.sendMessageToUser(message, toUser)
      .then(function (response) {
        return res.status(200).send(Formatter.success(response));
      }, function (error) {
        console.log(error);
        return res.status(500).send(Formatter.error(error));
      });
  }
}
