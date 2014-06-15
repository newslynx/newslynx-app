var scrypt = require('scrypt');

scrypt.hash.config.keyEncoding = 'utf8'
scrypt.hash.config.outputEncoding = 'hex'
scrypt.verify.config.keyEncoding = 'utf8'
scrypt.verify.config.hashEncoding = 'hex'

exports.hash = function(value) {
  return scrypt.hash(value, scrypt.params(0.1));
}

exports.verify = function(hash, attempt) {
  return scrypt.verify(hash, attempt);
}