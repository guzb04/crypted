const express = require('express');
const {PORT, KEY} = require('./keys');
const cors = require('cors');
const multer = require('multer');
const zipFunctions = require ('./zipFunctions');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const upload = multer({dest: './temp/zips'})

app.use(cors());
app.use(express.json());

app.get('/key', (req, res)=>{
    const key = crypto.randomBytes(32).toString('hex');
    res.send(key);
})

app.post('/upload', upload.single('file'), (req, res)=>{
    const file = req.file;
    const textContent = zipFunctions.zipToText(file.path);
    const iv = crypto.randomBytes(16).toString('hex');
    
    let encryptedZip = textContent.map((piece)=>{

        keyBuffer = Buffer.from(req.body.upload_key, 'hex')
        return{
            filename: piece.filename,
            content: zipFunctions.encryptContent(piece.content, keyBuffer, iv)
        }
    })
    encryptedZip.push({
        iv: iv
    })

    const jsonPath = `./temp/json/${encryptedZip[encryptedZip.length-1].iv}.json`;

    
    
    fs.unlink(file.path, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        } else {
            console.log('zip deleted successfully.');
        }
    });
    fs.writeFileSync(jsonPath, JSON.stringify(encryptedZip, null, 2), 'utf-8');
    
    res.send(iv);
})

app.get('/upload', (req, res)=>{

    let jsonPath = (`./temp/json/${req.headers.iv}.json`);
    let jsonData = fs.readFileSync(jsonPath, 'utf-8');

    res.setHeader('Content-Disposition', 'attachment; filename=crypted.json');
    res.setHeader('Content-Type', 'application/json');

    fs.unlink(jsonPath, (err) =>{
        if(err){
            console.log(err);
        }else{
            console.log('json deleted successfully');
        }
    })

    res.send(jsonData)
})

app.post('/download', (req, res)=>{
    console.log('b')
    res.status(200).send('ok')
})




app.listen(PORT, console.log(`running on ${PORT}`))