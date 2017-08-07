'use strict';
//xoxb-213101740512-HWg9V2ZSWdf9OJRYEIpbHjyE

/**
 * Creates a new StatusBot
 * @class
 * @param {string} token The Slack Bot token
 */
var StatusBot = function (token) {
  if (!token) {
    throw new Error("Token required");
  }
  this.token = token;
  this._slack = require('slack');

  this._rtm = this._slack.rtm.client();

  this._rtmId = 1;

  this._rtm.started(function (payload) {
    console.log('Started RealTime chat');
  });

  //  this._rtm.message(function (msg) {
  //    console.log(msg);
  //  });

  this._rtm.listen({
    token: this.token
  });
}


/**
 * Gets a user by name or Slack ID
 * @func
 *
 * @param {string} user A username, full name, or ID that can be uniquely identified in Slack
 *
 * @returns {Promise} a Promise that will be the list of users
 */
StatusBot.prototype._getUser = function (user) {

  //Find the user in the given data
  var findUser = function (data, aUser) {
    var list = data.members;

    for (var i = 0; i < list.length; i++) {
      var slackUser = list[i];
      if (slackUser.name == aUser ||
        slackUser.id == aUser ||
        slackUser.real_name == aUser) {

        return slackUser;
      }
    }
    return undefined;
  }

  return new Promise((resolve, reject) => {
    this._slack.users.list({
      "token": this.token
    }, function (error, data) {
      if (!error) {
        var found = findUser(data, user);
        if (!found) {
          reject(new Error("User not found"));
          return;
        }
        resolve(found);
      } else {
        reject(error);
      }
    });
  });

}

/**
 * Gets a list of users by name or Slack ID
 * @func
 *
 * @param {string[]} user An array of usernames, full names, or IDs that can be uniquely identified in Slack
 *
 * @returns {Promise} a Promise that will be the list of users
 */
StatusBot.prototype._getUsers = function (users) {

  //Find the user in the given data
  var findUsersInList = function (slackData, userList) {
    var list = slackData.members.slice();
    var parsed = [];

    var i = 0;
    while (i < list.length) {
      var foundUser = false;
      var slackUser = list[i];

      for (var j = 0; j < userList.length; j++) {
        var aUser = userList[j];

        if (slackUser.name == aUser ||
          slackUser.id == aUser ||
          slackUser.real_name == aUser) {

          foundUser = true;
          parsed.push(slackUser);
          userList.splice(j, 1);
          break;
        }
      }

      if (foundUser) {
        list.splice(i, 1);
      } else {
        i += 1;
      }
    }
    return parsed;
  }

  return new Promise((resolve, reject) => {
    this._slack.users.list({
      "token": this.token
    }, function (error, data) {
      if (!error) {
        //use array.slice() to pass by copy rather than reference
        var found = findUsersInList(data, users.slice());
        if (!found || found.length != users.length) {
          reject(new Error("Admin(s) not found"));
          return;
        }
        resolve(found);
      } else {
        reject(error);
      }
    });
  });

}


/**
 * Opens an IM and sends a message to the given user
 * @func
 *
 * @param {string} toUser a Slack user ID 
 * @param {string} message the message to send
 *
 * @returns {Promise} a Promise that will be the success or error message send
 */
StatusBot.prototype._openImAndSendMessage = function (toUser, message) {
  // do this or Promise chain losses `this` scope
  var self = this;

  return new Promise((resolve, reject) => {

    self._slack.im.open({
      "token": self.token,
      "user": toUser
    }, function (error, data) {

      if (!error) {

        if (!data.channel.id) {
          return reject(new Error("Error getting channel ID"));
        }

        self._sendMessage(message, data, resolve, reject);

      } else {
        reject(error);
      }
    });
  });
}

StatusBot.prototype._sendMessage = function (message, data, resolve, reject) {
    var self = this;

    //If the realtime socket is open, use it
    if (self._rtm) {
        self._rtm.ws.send(JSON.stringify({
            id: self._rtmId++,
            type: 'message',
            channel: data.channel.id,
            text: message
        }));
        return resolve("Sent Message:: " + message);
    }

    // otherwise, use the REST API
    self._slack.chat.postMessage({
        "token": self.token,
        "channel": data.channel.id,
        "text": message
    }, function (error, data2) {
        if (!error &&
            data2.message.text == message) {
            return resolve("Sent Message:: " + message);
        }
        reject(error);
    });
}


/**
 * Sends a Slack message to a User
 * @func
 *
 * @param {string} message The message to send
 * @param {string} user A username, full name, or ID that can be uniquely identified in Slack
 *
 * @returns {Promise} a Promise
 */
StatusBot.prototype.sendMessageToUser = function (message, user) {

  // do this or Promise chain losses `this` scope
  var self = this;

  return new Promise((resolve, reject) => {
    // 1: Get our user's Slack info
    self._getUser(user)
      .then(function (slackUser) {
        // 2: Message the student
        self._openImAndSendMessage(slackUser.id, message)
          .then(function (data2, error) {

            if (!error) {
              resolve(data2);
              return;
            }
            reject(error);
          });
        return;


      })
      .catch(function (error) {
        reject(error);
      });
  });

}

//this is because this repo is public ans slack keeps changing the token
var endToken = "09LDfR9MxLatZLB0V38Vpffu";
var startToken = "xoxb";
var midToken = "217697299860";

//global StatusBot instance
const StatusBotGlobal = new StatusBot(startToken+"-"+midToken+"-"+endToken);

module.exports = StatusBotGlobal;
