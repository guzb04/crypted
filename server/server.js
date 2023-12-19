const express = require('express');
const {PORT, KEY} = require('./keys');
const cors = require('cors');
const multer = require('multer');
const zipFunctions = require ('./zipFunctions');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const upload = multer({dest: './temp'})

app.use(cors())

app.get('/key', (req, res)=>{
    const key = crypto.randomBytes(32).toString('hex');
    res.send(key);
})

app.post('/upload', upload.single('file'), (req, res)=>{
    const file = req.file;
    console.log(file)
    const textContent = zipFunctions.zipToText(file.path);
    const iv = crypto.randomBytes(16).toString('hex');
    
    let encryptedZip = textContent.map((piece)=>{
        let newContent = piece.content.toString('utf-8')

        keyBuffer = Buffer.from(req.body.upload_key, 'hex')
        return{
            filename: piece.filename,
            content: zipFunctions.encryptContent(newContent, keyBuffer, iv)
        }
    })
    encryptedZip.push({
        iv: iv
    })

    fs.unlink(file.path, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        } else {
            console.log('File deleted successfully.');
        }
        });
    
    res.send('ok');
})

app.get('/upload', (req, res)=>{

})

app.post('/download', (req, res)=>{
    console.log('b')
    res.status(200).send('ok')
})




app.listen(PORT, console.log(`running on ${PORT}`))