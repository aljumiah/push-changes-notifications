const db = require('../keysMap/db')

exports.connection = async function() {
r = require('rethinkdb');
var connection = null;
await r.connect( {host: db.config['host'], port: db.config['port'], db: db.config['db']}, function(err, conn) {
    if (err) throw err;
    connection = conn;
    
})
}