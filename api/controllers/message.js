'use strict';

const Message = require('../helpers/Message');

module.exports = {
  sendMessage: function (req, res) {
    var body = req.body;
    if (!body.user) {
      res.status(400).send(Formatter.error("User parameter not defined"));
      return;
    }
    if (!body.message) {
      res.status(400).send(Formatter.error("Message parameter not defined"));
      return;
    }

    Message.sendMessage(body.message, body.user, res);
  }
}
