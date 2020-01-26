const http = require('http');
const logging = require('../components/logging');
r = require('rethinkdb');
var connection = null;
r.connect( {host: 'localhost', port: 28015, db: 'push_notification'}, function(err, conn) {
    if (err) throw err;
    connection = conn;
})

 exports.subscribeConf = async ()  =>  {

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
            if(Object.keys(result['_responses'].length > 0)){
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
            }else{
                console.log('no resuts found in daabse')
            }

        }
        );
}

exports.subscribe = async (id,subscriped_ids,url) =>  {
    r = require('rethinkdb');
    var connection = null;
    await r.connect( {host: 'localhost', port: 28015, db: 'push_notification'}, function(err, conn) {
        if (err) throw err;
        connection = conn;
    })

    await r.table('subscribed_clients').insert(

        {   
            id: id, 
            push_url:  url,
            subscriped_ids: subscriped_ids
        }

    ).run(connection, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    })

    r.table('subscribed_clients').map(function(element) {
        return element
    }).run(connection, 
        
        async function(err, result) {
            if (err) throw err;
            console.log('--------------------------------\n\x1b[36m%s\x1b[0m',`Target Ready`)
            await result['_responses'][0]['r'].map(obj => 
                logging.targetReady(obj['subscriped_ids'],obj['push_url'])
            );   
        })

   await this.subscribeToId(subscriped_ids,url);
}

exports.subscribeToId = (id,url) => {
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

