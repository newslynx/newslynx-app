// Load and return the newslynx config.yaml file
var fs = require('fs-plus');
var yaml = require('js-yaml');
var path = require('path');
var expandHomeDir = require('expand-home-dir');

var NEWSLYNX_CONFIG,
    newslynx_config_path;

try {
  NEWSLYNX_CONFIG = require('newslynx-config');
  newslynx_config_path = require.resolve('newslynx-config');
} catch (err){
  console.log(err)
  newslynx_config_path = expandHomeDir('~/.newslynx/config.yaml');
  NEWSLYNX_CONFIG = yaml.load(fs.readFileSync(newslynx_config_path, 'utf-8'));
}


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