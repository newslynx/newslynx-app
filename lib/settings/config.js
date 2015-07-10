// Load and return the newslynx config.yaml file
var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');
var expandHomeDir = require('expand-home-dir');

// Load the config file in the `newslynx-electron` repo if we are building from there
var newslynx_config_path = (process.env.NEWSLYNX_ENV === 'electron') ? path.resolve('./', 'config.yaml') : expandHomeDir('~/.newslynx/config.yaml');
var NEWSLYNX_CONFIG = yaml.load(fs.readFileSync(newslynx_config_path, 'utf-8'));

module.exports = NEWSLYNX_CONFIG;