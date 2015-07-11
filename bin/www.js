#!/usr/bin/env node
var _ = require('underscore');
var app = require('../lib/app');
var fs = require('fs');
var http = require('http');
var https = require('https');
var debug = require('tracer').console();
var chalk = require('chalk');


function launchServers(port){
  port = port || process.env.NEWSLYNX_HTTP_PORT || 3000;
  app.set('http_port', port);

  // Launch a server
  var http_server = http.createServer(app).listen( port );

  console.log(chalk.green('##################################'));
  console.log(chalk.green('# HTTP listening on port ' + port + '... #'));
  console.log(chalk.green('##################################'));

}

// This file can both be run via the command line if given the proper flag or as a nodemodule
var launch_command = process.argv[2],
    port = process.argv[3];

if (launch_command === 'run'){
  launchServers(port);
} else if (launch_command){
  throw new Error('If you want to run the server from the command line, you must supply the `run` command: `./bin/www run`.\n')
}

module.exports = {
  run: launchServers
}