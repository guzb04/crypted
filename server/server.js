const express = require('express');
const cors = require('cors');
const multer = require('multer');
const zipFunctions = require ('./zipFunctions');
const fs = require('fs');
const crypto = require('crypto');

const PORT = 3000;
const app = express();
const upload = multer({dest: './temp/POST'})

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

    const jsonPath = `./temp/get/${encryptedZip[encryptedZip.length-1].iv}.json`;

    
    
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

    let jsonPath = (`./temp/get/${req.headers.iv}.json`);
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

app.post('/download', upload.single('file'), (req, res)=>{
    try{
        const file = req.file;
        const filePath = file.path;

        const content = fs.readFileSync(filePath);
        const jsonData = JSON.parse(content);
        console.log(req.body.key)
        let iv = jsonData[jsonData.length-1].iv


        const decryptedData = jsonData.slice(0, -1).map((piece)=>{
            const keyBuffer = Buffer.from(req.body.key, 'hex')
            return {
                filename: piece.filename,
                content: zipFunctions.decryptContent(piece.content, keyBuffer, iv)
            }
        })

        fs.unlink(filePath, (err)=>{
            if(err){
                console.log('error deleting file', err)
            }else{
                console.log('json deleted successfully')
            }
        })

        const newPath = `./temp/get/${iv}`

        fs.writeFileSync(newPath, JSON.stringify(decryptedData))

        res.status(200).send(iv);
    }catch(err){
        console.log(err)
    }
})

app.get('/download', (req, res)=>   {
    
})


app.listen(PORT, console.log(`running on ${PORT}`))