const express = require('express');
const {PORT, KEY} = require('./keys');
const cors = require('cors');

const app = express();

app.use(cors())

app.post('/upload', (req, res)=>{
    console.log('a')
    res.status(200).send('ok')
})

app.post('/download', (req, res)=>{
    console.log('b')
    res.status(200).send('ok')
})




app.listen(PORT, console.log(`running on ${PORT}`))