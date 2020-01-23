const express = require('express');
const http = require('http');
const hostname = 'localhost';
const port = 3000;
const app = express();
const bodyParser = require('body-parser');
const ClientsRouter = require('./routes/clientsRouter');
const infoRouter = require('./routes/infoRouter');
const moment = require('moment-timezone');
const logging = require('./components/logging');

app.use('/clients', ClientsRouter);
app.use('/info', infoRouter);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

const server = http.createServer(app);

const subscribeConf = async ()  =>  {

    r = require('rethinkdb');
    var connection = null;
    await r.connect( {host: 'localhost', port: 28015, db: 'push_notification'}, function(err, conn) {
        if (err) throw err;
        connection = conn;
    })
    
    await r.table('subscribed_clients').map(function(element) {
        return element
    }).run(connection, 
        
        async function(err, result) {
            if (err) throw err;
            console.log('--------------------------------\n\x1b[36m%s\x1b[0m',`Target Ready`)
            await result['_responses'][0]['r'].map(obj => 
                logging.targetReady(obj['subscriped_ids'],obj['push_url'])
            );     
            await result['_responses'][0]['r'].map(obj =>           
                r.table('info').get(obj['subscriped_ids']).changes().run(connection, function(err, cursor) {
                    cursor.eachAsync(function (row) {

                        logging.deleviryLog(obj['push_url'],JSON.stringify(row))
            
                        const data = JSON.stringify(row)
                        const options = {
                            hostname: 'localhost',
                            port: 3001,
                            path: obj['push_url'],
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
                
                
                
                )
        }
        );
}



server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  subscribeConf();
});