_ = require 'underscore'

// settings can consist of just plain variables, loaded from a JSON file, 
// but they can also be a JavaScript function that lives at `module.exports`
// and that receives app as its sole argument; the latter are applied when 
// `settings.apply(app)` is called in app.js

environment = process.env['NODE_ENV'] || 'development';
shared = JSON.parse(fs.readFileSync('shared.json'))
specific = JSON.parse(fs.readFileSync(environment + '.json'));
module.exports = _.extend(shared, specific)
module.exports.name = environment;
module.exports.apply = function(app) {
    require('./shared.js')(app);
    require('./' + environment + '.js')(app);
}