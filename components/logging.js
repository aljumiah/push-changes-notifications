const moment = require('moment-timezone');

exports.deleviryLog = function(endpoint,Value) {
        console.log(`\n\n-------------------------------------------------`)
        console.log(`Data Ready to Deleivr`)
        console.log(`-------------------------------------------------`)
        var timezone_string = "Asia/Riyadh"
        var time = moment.tz(new Date(), timezone_string)
        var currentTimestamp = time.format();
        console.log(`Timestamp: \x1b[1m%s\x1b[0m \nURL(path): \x1b[32m%s\x1b[0m \nBody: \n\x1b[36m%s\x1b[0m`,currentTimestamp,endpoint,Value);
        console.log(`-------------------------------------------------`)
};
exports.targetReady = function(subscriped_ids,push_url){
    //  console.log('\x1b[36m%s\x1b[0m',`Target Ready`)
     console.log(`Changes On => \x1b[34m%s\x1b[0m Send Notification To => \x1b[32m%s\x1b[0m`, subscriped_ids,push_url);     
}; 
exports.targetResponse = function(statusCode,res){
    console.log(`\n-------------------------------------------------`)
    console.log('\x1b[36m%s\x1b[0m',`Target Response`);
    console.log(`-------------------------------------------------`)
    if(statusCode == 200){
        console.log(`Status: \x1b[32m%s\x1b[0m`, statusCode)
        console.log(`Response Body:\n\x1b[36m%s\x1b[0m`,res);
    }else{
        console.log(`Status: \x1b[31m%s\x1b[0m \n`, statusCode)
        console.log('\x1b[36m%s\x1b[0m',res);
    }
    ;     
};