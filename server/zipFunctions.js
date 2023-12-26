const AdmZip = require('adm-zip');
const crypto = require('crypto');


function zipToText(filePath){
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    let result = [];

    zipEntries.forEach((entry)=>{
        const content = zip.readFile(entry);
        result.push({
            filename: entry.entryName,
            content: content,
        })
    })

    return result;
}


function encryptContent(content, key, iv) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    const encryptedContent = Buffer.concat([cipher.update(content, 'utf-8'), cipher.final()]);
    return encryptedContent.toString('hex');
  }

  function decryptContent(encryptedContent, key, iv) {
    const encryptedContentBuffer = Buffer.from(encryptedContent, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    const decryptedContent = Buffer.concat([decipher.update(encryptedContentBuffer), decipher.final()]);
    return decryptedContent.toString('utf-8');
}

module.exports = {
    zipToText,
    encryptContent,
    decryptContent
}