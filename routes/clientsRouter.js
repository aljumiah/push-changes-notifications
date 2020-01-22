const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

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
            //await console.log(JSON.stringify(result, null, 2));
            console.log(`\n\n------------------------------------------------------------------------------------------`)
            console.log(`Target Endpoint Ready`)
            await console.log(result['_responses'][0]['r'].map(obj => 'Changes On => ' + obj['subscriped_ids'] + ' Send Notification To => ' + obj['push_url'] + ''))
            console.log(`----------------------------------------------------------------------------------------------`)

        })

    r.table('info').get(id).changes().run(connection, function(err, cursor) {
        cursor.eachAsync(function (row) {
            console.log(`\n-------------------------------------------------`)
            console.log(`Data Deleivred`)
            console.log(`-------------------------------------------------`)
            console.log('Target Endpoint: ' + url +'\nValue :' + JSON.stringify(row));
            console.log(`\n-------------------------------------------------`)
            //console.log('Data sent to target endpoint: ' + url + '\nthe new value' + JSON.stringify(row));

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
                //console.log(`statusCode: ${res.statusCode}`)
                if(res.statusCode == 200){
                    console.log(`\n-------------------------------------------------`)
                    console.log(`Target Receive Status Response: ${res.statusCode}`)
                    console.log(`\n-------------------------------------------------`)
                  }else{
                    console.log(`deilvery issue, statuse: ${res.statusCode}`)
                  }
                res.on('data', d => {
                    console.log(`-------------------------------------------------`) 
                    console.log(`Target Response: `) 
                    console.log(`\n-------------------------------------------------`) 
                    process.stdout.write(d)
                    console.log(`\n-------------------------------------------------`) 

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