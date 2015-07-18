// Load and return the newslynx config.yaml file
var fs = require('fs-plus');
var yaml = require('js-yaml');
var path = require('path');
var chalk = require('chalk');
var expandHomeDir = require('expand-home-dir');

var NEWSLYNX_CONFIG,
    newslynx_config_path;

try {
  NEWSLYNX_CONFIG = require('newslynx-config');
  newslynx_config_path = require.resolve('newslynx-config');
  
} catch (err){
  if (process.env.NEWSLYNX_ENV !== 'travis'){
    newslynx_config_path = expandHomeDir('~/.newslynx/config.yaml');
    NEWSLYNX_CONFIG = yaml.load(fs.readFileSync(newslynx_config_path, 'utf-8'));
  } else {
    // If we're loading via travis, we won't have a config file, so give some defaults
    newslynx_config_path = 'travis';
    NEWSLYNX_CONFIG = {api: 'v1', 'newslynx_secret_key': 'travis-secrets'}
  }
}
console.log(chalk.cyan.bold('Loading config from...'), chalk.magenta(newslynx_config_path));

function save(jsonData){
  fs.writeFile(newslynx_config_path, 'module.exports='+JSON.stringify(jsonData), function(err){
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