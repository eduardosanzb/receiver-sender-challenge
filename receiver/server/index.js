'use strict';

const http = require('http');

/**
 * @author eduardosanzb
 * A class representing a webServer to handle
 * requests from a device client sensor
 */
class Server {
  constructor() {
    const server = this._createServer();
    return server;
  }

  /**
   * @description Create an http server instance and setup the
   * listener for "data" and "end" event
   * @returns {object} An instance of a http server
   */
  _createServer() {
    const server = http.createServer();
    server.on('request', this._handleRequest.bind(this))
    return server;
  }

  /**
   * @description Handler for the server requests;
   * Will omit the GET requests and will only provide functionality
   * for the endpoint /event
   */
  _handleRequest(request, response) {
      this.response = response;
      this.request = request;
      const { method, url } = request;

      if (method !== 'POST') {
        return this._sendResponse({
          messageBack:
          'This Server only accepts POST requests; For the Sensor data.',
          statusCode: 404,
        });
      }

      if(url !== '/event') {
        const messageBack = `The route "${url}" does not exist`;
        console.log(messageBack) //writing to log file
        return this._sendResponse({
          messageBack, 
          statusCode: 404,
        });
      }

      const body = [];
      request
        .on('data', body.push.bind(body))
        .on('end', () => {
          console.log(Buffer.concat(body).toString());
          this._sendResponse();
        })
        .on('error', this._handleError.bind(this));
  }


  /**
   * @description Listener function to perform for each on End request
   * @param {string} config.messageBack - If provided write to response and to stdout
   * @param {object} config.headers - response headers
   */
  _sendResponse({ messageBack = null, statusCode = 200 } = {}) {
    if (messageBack) {
      const headers = { 'Content-Type': 'text/plain' };
      this.response.writeHead(statusCode, headers);
      this.response.write(messageBack);
    }

    this.response.end();
  }

  /**
   * @description Handles request errors
   * @param {string|object} The error response.
   */
  _handleError(error = 'An Error ocurred in the request.') {
    console.log(error); // writing to log file
    this._sendResponse({
      messageBack: error,
      statusCode: 500,
    })
  }

}

module.exports = Server;
