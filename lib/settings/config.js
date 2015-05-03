// Load and return the newslynx config.yaml file
var fs = require('fs');
var yaml = require('js-yaml');
var expandHomeDir = require('expand-home-dir')
var newslynx_config_path = process.env.NEWSLYNX_CONFIG_FILE || expandHomeDir('~/.newslynx/config.yaml');
var NEWSLYNX_CONFIG = yaml.load(fs.readFileSync(newslynx_config_path, 'utf-8'));

module.exports = NEWSLYNX_CONFIG;