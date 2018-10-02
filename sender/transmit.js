'use strict';

const request = require('request')
const http = require('http');

const SERVER_URL = 'http://localhost:8080/event';

const REUSED_AGENT = new http.Agent({
  keepAlive: true,
});

/**
 *
 */
const handleError = callback => (err, res, body) => {
  callback(err);
}

/**
 * @description
 * @param {array} eventMsg
 * @param {string} encoding
 * @param {function} callback
 */
function main (eventMsg, encoding, callback) {
  const options = {
    json: true,
    body: eventMsg,
    // gzip: true,
    agent: REUSED_AGENT,
  };

  request
  .post(
    SERVER_URL,
    options,
    handleError(callback),
  )
}



module.exports = main;
