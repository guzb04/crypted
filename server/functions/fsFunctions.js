const fs = require('fs')


function unlinkWithMessage(filepath, message){
    fs.unlink(filepath, (err) =>{
        if(err){
            console.log(err);
        }else{
            console.log(message);
        }
    })
}

module.exports = {
    unlinkWithMessage
}