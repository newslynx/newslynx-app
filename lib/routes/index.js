var orgRoutes = require('./organizations.js')
var authenticationsRoutes = require('./authentications.js')
var pagesRoutes = require('./pages.js')
var exportRoutes = require('./exports.js')

module.exports = [orgRoutes, authenticationsRoutes, pagesRoutes, exportRoutes]