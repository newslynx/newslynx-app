var newslynx = require('./bin/www.js');


describe('runServer', function () {
 it('should run without error', function(done) {
    newslynx.run(3333, '0.0.0.0', function(err){
      if (err) {
        throw err
      }
      done()
    })
  })
})