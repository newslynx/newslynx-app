// Load and return the newslynx config.yaml file
var fs = require('fs-plus');
var yaml = require('js-yaml');
var path = require('path');
var chalk = require('chalk');
var user_home = require('user-home');

var NEWSLYNX_CONFIG,
    newslynx_config_path,
    save;

try {
  config_lib = require('newslynx-app-config');
  NEWSLYNX_CONFIG = config_lib.config;
  save = config_lib.save;
  newslynx_config_path = require.resolve('newslynx-app-config');
} catch (err){
  if (err){ 
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log(chalk.cyan('newslynx-app-config module not present.'), 'We are not in an Electron environment.')
    } else {
      console.log(err) 
    }
  }

  if (process.env.NEWSLYNX_ENV !== 'travis'){
    newslynx_config_path = path.join(user_home,'.newslynx/config.yaml');
    NEWSLYNX_CONFIG = yaml.load(fs.readFileSync(newslynx_config_path, 'utf-8'));
  } else {
    // If we're loading via travis, we won't have a config file, so give some defaults
    newslynx_config_path = 'travis';
    NEWSLYNX_CONFIG = {api: 'v1', 'app_secret_key': 'travis-secrets'}
  }
  save = function(jsonData, cb){
    fs.writeFile(newslynx_config_path, 'module.exports = '+JSON.stringify(jsonData, null, 2), function(err){
      cb(err)
    })
  }
}
console.log(chalk.cyan.bold('Loading config from...'), chalk.magenta(newslynx_config_path));


module.exports = {
  NEWSLYNX_CONFIG: NEWSLYNX_CONFIG,
  save: save
}