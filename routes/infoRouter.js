const express = require('express');
const bodyParser = require('body-parser');

const infoRouter = express.Router();

r = require('rethinkdb');
var connection = null;
r.connect( {host: 'localhost', port: 28015, db: 'push_notification'}, function(err, conn) {
    if (err) throw err;
    connection = conn;
})

infoRouter.use(bodyParser.json());

infoRouter.route('/add')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})

.post((req, res, next) => {
    r.table('info').insert(

        {   
            id: req.body[0].id, 
            content:  req.body[0].content
        }

    
    ).run(connection, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    })
    res.end('added the id:' + req.body[0].id + '\ncontent: ' + req.body[0].content);
})

module.exports = infoRouter;