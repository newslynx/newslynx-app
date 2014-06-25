var url = require('url');

exports.security = require('./security');

exports.url = {
    parseDomain: function(value) {
      if (value.substr(0, 4) != 'http') {
        value = 'http://' + value;
      }
      return url.parse(value).hostname;
    }
}