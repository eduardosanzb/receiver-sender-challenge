'use strict';

const Server = require('./server');

process.on('SIGTERM', function() {
  process.exit(0)
})

const server = new Server();

server.listen(8080)


