var url = require('url');
var sequelize = require('sequelize');
var scrypt = require('scrypt');

/*
Because all of our analyses are centered around domains and URLs, it
makes sense to take the rather unusual step of using these columns as primary
keys. Because an organization changing their domain name would contain so
much room for error in various parts of the system, it is better to just
disallow this, and if it ever becomes necessary, allow the creation of
predecessor and successor organizations that are logically linked.
*/

var exports.Organization = sequelize.define('Article', {
  domain: {
    type: Sequelize.TEXT, 
    primaryKey: true, 
    set: function(value) {
      return url.parse(value).hostname;
    }, 
  }, 
  shortURL: {
    type: Sequelize.TEXT, 
  }, 
  name: {
    type: Sequelize.TEXT, 
  }, 
  password: {
    type: Sequelize.TEXT, 
    set: function(value) {
      return scrypt.hash(value, {});
    }
  }, 
  apiKey: {
    type: Sequelize.UUIDV4, 
  }
}, {
  instanceMethods: {
    verifyPassword: function(attempt) {
      if (scrypt.verify(this.password, attempt)) {
        return this;
      } else {
        return false;
      }
    }, 
  },
  classMethods: {
    verify: function(domain, password, callback) {
      domain = url.parse(domain).hostname;
      Organization.findOne({where: {domain: domain}})
        .error(function(err){
          callback(false);
        })
        .success(function(organization){
          callback(this.verifyPassword());
        })
      
    }
  }, 
});


var exports.Article = sequelize.define('Article', {
  url: {
    type: Sequelize.TEXT, 
    primaryKey: true, 
  }, 
  title: {
    type: Sequelize.TEXT, 
  }
});