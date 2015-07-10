// development error handler
// will print stacktrace
module.exports = function(app) {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        var info = {
        		title: 'Error',
            message: err.message,
            error: err
        };
        res.render('error', {info: info});
    });
}