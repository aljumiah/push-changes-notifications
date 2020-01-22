const express = require('express');
const http = require('http');

const hostname = 'localhost';
const port = 3000;

const app = express();
const bodyParser = require('body-parser');

const ClientsRouter = require('./routes/clientsRouter');
const infoRouter = require('./routes/infoRouter');


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
            //await console.log(JSON.stringify(result, null, 2));
            console.log(`\n\n------------------------------------------------------------------------------------------`)
            console.log(`Target Endpoint Ready`)
            await console.log(result['_responses'][0]['r'].map(obj => 'Changes On => ' + obj['subscriped_ids'] + ' Send Notification To => ' + obj['push_url'] + ''))
            console.log(`----------------------------------------------------------------------------------------------`)

            await result['_responses'][0]['r'].map(obj => 
                
                r.table('info').get(obj['subscriped_ids']).changes().run(connection, function(err, cursor) {
                    cursor.eachAsync(function (row) {
                        console.log(`\n-------------------------------------------------`)
                        console.log(`Data Deleivred`)
                        console.log(`-------------------------------------------------`)
                        console.log('Target Endpoint: ' + obj['push_url'] +'\nValue :' + JSON.stringify(row));
                        console.log(`\n-------------------------------------------------`)
            
            
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
                            //console.log(`statusCode: ${res.statusCode}`)
                            if(res.statusCode == 200){
                                console.log(`\n-------------------------------------------------`)
                                console.log(`Target Receive Status Response: ${res.statusCode}`)
                                console.log(`\n-------------------------------------------------`)
                              }else{
                                console.log(`Target Receive issue, Statuse: ${res.statusCode}`)
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
                
                
                
                )
        }
        );
}



server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  subscribeConf();
});