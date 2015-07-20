#!/usr/bin/env node
var _ = require('underscore');
var app = require('../lib/app');
var fs = require('fs-plus');
var http = require('http');
var https = require('https');
var debug = require('tracer').console();
var chalk = require('chalk');


function launchServers(port, hostname, cb){
  port = port || process.env.NEWSLYNX_HTTP_PORT || 3000;
  hostname = hostname || process.env.NEWSLYNX_HTTP_HOST || '0.0.0.0';
  app.set('http_port', port);

  // Launch a server
  var http_server = http.createServer(app).listen(port, hostname, function(err){
    if (!err) {
      console.log(chalk.green('#####################################'));
      console.log(chalk.green('# HTTP listening on '+hostname+':' + port + '... #'));
      console.log(chalk.green('#####################################'));
      
      if (cb) { cb(); }
    } else {
      console.log(chalk.red('##################################'));
      console.log(chalk.red('# HTTP failed on '+hostname+':' + port + '... #'));
      console.log(chalk.red('##################################'));
    }
  });

}

// This file can both be run via the command line if given the proper flag or as a nodemodule
/* Options, to be documented 
  `port` and `hostname` are optional
  node bin/www.js run <port> <hostname>
*/

var launch_command = process.argv[2],
    port = process.argv[3];
    hostname = process.argv[4];

if (launch_command === 'run'){
  launchServers(port, hostname);
} else if (launch_command){
  throw new Error('If you want to run the server from the command line, you must supply the `run` command: `./bin/www run`.\n')
}

module.exports = {
  run: launchServers
}