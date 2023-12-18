const express = require('express');
const {PORT, KEY} = require('./keys');
const cors = require('cors');
const multer = require('multer');
const zipFunctions = require ('./zipFunctions');
const fs = require('fs');

const app = express();
const upload = multer({dest: './temp'})

app.use(cors())

app.post('/upload', upload.single('file'), (req, res)=>{
    const file = req.file;

    const textContent = zipFunctions.zipToText(file.path);
    console.log(textContent)

    fs.unlink(file.path, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        } else {
            console.log('File deleted successfully.');
        }
        });
    res.send(textContent);
})

app.post('/download', (req, res)=>{
    console.log('b')
    res.status(200).send('ok')
})




app.listen(PORT, console.log(`running on ${PORT}`))