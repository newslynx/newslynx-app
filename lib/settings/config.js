// Load and return the newslynx config.yaml file
var fs = require('fs-plus');
var yaml = require('js-yaml');
var path = require('path');
var expandHomeDir = require('expand-home-dir');

// Load the config file in the `newslynx-electron` repo if we are building from there
var newslynx_config_path = (process.env.NEWSLYNX_ENV === 'electron') ? path.resolve('./', 'config.yaml') : expandHomeDir('~/.newslynx/config.yaml');
var NEWSLYNX_CONFIG = yaml.load(fs.readFileSync(newslynx_config_path, 'utf-8'));

function save(jsonData){
  fs.writeFile(newslynx_config_path, yaml.safeDump(jsonData), function(err){
    if (err){
      console.log(err)
    } else {
      console.log('Settings saved to', newslynx_config_path)
    }
  })
}

module.exports = {
  NEWSLYNX_CONFIG: NEWSLYNX_CONFIG,
  save: save
}