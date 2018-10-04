'use strict';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Server = require('./server');

// TODO: Move to config file
const PORT = 8080;

process.on('SIGTERM', function() {
  process.exit(0);
});


/**
 * HERE IS THE ROOT OF THE PROJECT
 * description Here we have 2 solutions from the big-picture
 * 1. Start one instance of the server
 * 2. Cluster the same server for the amount of CPUs in the machine
 *
 */
startSingleServerSolution(); // Start 1 instance
// startClusterSolution(); // Start 4 instances

/**
 * This is the simplest solution; start 1 server.
 */
function startSingleServerSolution() {
  const server = new Server();
  server.listen(PORT);
  console.error(`Starting server on port ${PORT}`)
}

/*
 * If the problem where that we are unable to receive enough requests;
 * Clustering would be a nice solution.
 * Nevertheless; There are more reliable ways of scaling and this is
 * not our biggest challenge yet.
 */
function startClusterSolution() {
  if (cluster.isMaster) {
    [...new Array(numCPUs)].forEach(() => {
      cluster.fork();
    });
    return;
  } 

  const server = new Server();
  server.listen(PORT);
}
