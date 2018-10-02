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
    const server = http.createServer((request, response) => {
      this.response = response;
      this.request = request;
      request.on('data', this.handleData.bind(this));
      request.on('end', this.handleEnd.bind(this));
    });

    return server;
  }

  /**
   * @description Listener function to perform for each on Data request
   * Will handle properly the routes
   * @param {*} data - Payload of the request
   */
  handleData(data) {
    const { url } = this.request;
    switch (url) {
      case '/event':
        console.log(data.toString());
        break;
      default:
        const responseMessage = `The route ${url} doesn't not exist`;
        const headers = {
          'Content-Type': 'text/plain',
        };
        this.handleEnd(responseMessage, headers);
        break;
    }
  }

  /**
   * @description Listener function to perform for each on End request
   * @param {string} config.messageBack - If provided write to response and to stdout
   * @param {object} config.headers - response headers
   */
  handleEnd({ messageBack = '', headers } = {}) {
    if (messageBack.length > 0) {
      console.log(messageBack);
    }

    if (headers) {
      this.response.writeHead(headers);
    }
    this.response.write(messageBack);
    this.response.end();
  }
}

module.exports = Server;
