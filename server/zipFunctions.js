const AdmZip = require('adm-zip');
const fs = require('fs');


function zipToText(filePath){
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    let result = '';

    zipEntries.forEach((entry)=>{
        const content = zip.readFile(entry);
        result = content.toString('utf-8');
    })

    return result;
}

module.exports = {
    zipToText
}