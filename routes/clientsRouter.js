const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const logging = require('../components/logging')
const clientsRouter = express.Router();


r = require('rethinkdb');
var connection = null;
r.connect( {host: 'localhost', port: 28015, db: 'push_notification'}, function(err, conn) {
    if (err) throw err;
    connection = conn;
})

clientsRouter.use(bodyParser.json());

clientsRouter.route('/add')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})

.post((req, res, next) => {
    r.table('subscribed_clients').insert(

        {   
            id: req.body.id, 
            push_url:  req.body.push_url,
            subscriped_ids: req.body.subscriped_ids
        }

    ).run(connection, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    })
    subscribe(req.body.subscriped_ids , req.body.push_url);
    res.end('added the client:' + req.body.id + '\nwith url: ' + req.body.push_url + '\nsubscriped_ids: [' + req.body.subscriped_ids +']');
})



clientsRouter.route('/subscribe')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})

.post((req, res, next) => {
    subscribe(req.body.subscriped_ids , req.body.push_url);
    res.end('subscriped succsfuuly with :' + req.body.subscriped_ids);
})



const subscribe = async (id,url) =>  {
    await r.table('subscribed_clients').map(function(element) {
        return element
    }).run(connection, 
        
        async function(err, result) {
            if (err) throw err;
            console.log('--------------------------------\n\x1b[36m%s\x1b[0m',`Target Ready`)
            await result['_responses'][0]['r'].map(obj => 
                logging.targetReady(obj['subscriped_ids'],obj['push_url'])
            );   
        })

    r.table('info').get(id).changes().run(connection, function(err, cursor) {
        cursor.eachAsync(function (row) {

            logging.deleviryLog(url,JSON.stringify(row))
            
            const data = JSON.stringify(row)
            const options = {
                hostname: 'localhost',
                port: 3001,
                path: url,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              }

              const req = http.request(options, res => {
                res.on('data', d => {
                    logging.targetResponse(res.statusCode,d);
                    process.stdout.write(d)
                })
              })

              req.on('error', error => {
                console.error(error)
              })
              req.write(data)
              req.end()
        });
      })
}

module.exports = clientsRouter;