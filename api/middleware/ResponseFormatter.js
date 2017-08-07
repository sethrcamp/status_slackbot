'use strict';

module.exports = {
    success: function (message) {
        return {
            "message": message,
            "error": false
        }
    },
    error: function (message) {
        return {
            "message": message,
            "error": true
        }
    }
}