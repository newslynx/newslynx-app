var Sequelize = require('sequelize');
var settings = require('../settings');
var utils = require('../utils');

/*
Because all of our analyses are centered around domains and URLs, it
makes sense to take the rather unusual step of using these columns as primary
keys. Because an organization changing their domain name would contain so
much room for error in various parts of the system, it is better to just
disallow this, and if it ever becomes necessary, allow the creation of
predecessor and successor organizations that are logically linked.
*/

sequelize = new Sequelize(
  process.env['RDS_HOSTNAME'] || settings.database.name, 
  process.env['RDS_USERNAME'] || settings.database.username, 
  process.env['RDS_PASSWORD'] || settings.database.password, 
  settings.database.options);

var Organization = sequelize.define('Organization', {
  isActive: {
    type: Sequelize.BOOLEAN
  }, 
  domain: {
    type: Sequelize.TEXT, 
    primaryKey: true, 
    set: function(value) {
      this.setDataValue('domain', utils.url.parseDomain(value));
    }, 
    validate: {isUrl: true}
  }, 
  shortUrl: {
    type: Sequelize.TEXT, 
  }, 
  name: {
    type: Sequelize.TEXT, 
  }, 
  password: {
    type: Sequelize.TEXT, 
    set: function(value) {
      hash = utils.security.hash(value);
      this.setDataValue('password', hash);
    }
  }, 
  apiKey: {
    type: Sequelize.UUIDV4, 
  }
}, {
  instanceMethods: {
    verifyPassword: function(attempt) {
      if (utils.security.verify(this.password, attempt)) {
        return this;
      } else {
        return false;
      }
    }, 
  },
  classMethods: {
    verify: function(domain, password, callback) {
      domain = Organization.parseDomain(domain);
      Organization.find({where: {domain: domain}})
        .success(function(organization){
          if (organization) {
            callback(null, organization.verifyPassword(password));
          } else {
            callback(null, false);
          }
        }) 
    }, 
    /* passport.js helper functions */
    serializeUser: function(organization, done) {
      done(null, organization.domain);
    },
    deserializeUser: function(domain, done) {
      Organization.find({where: {domain: domain}}).success(function(organization) {
        done(null, organization);
      });
    }
  }
});


var Article = sequelize.define('Article', {
  url: {
    type: Sequelize.TEXT, 
    primaryKey: true, 
  }, 
  title: {
    type: Sequelize.TEXT, 
  }
});


exports.Organization = Organization;
exports.Article = Article;
exports.sequelize = sequelize;