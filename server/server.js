const express = require("express");
const cors = require("cors");
const multer = require("multer");
const zipFunctions = require("./functions/zipFunctions");
const fs = require("fs");
const crypto = require("crypto");
const AdmZip = require("adm-zip");
const { unlinkWithMessage } = require("./functions/fsFunctions");

const PORT = 3000;
const app = express();
const upload = multer({ dest: "./temp/POST" });

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Expose-Headers", "Content-Disposition");
    next();
});

app.get("/key", (req, res) => {
    const key = crypto.randomBytes(32).toString("hex");
    res.send(key);
});

app.post("/upload", upload.single("file"), (req, res) => {
    try {
        const file = req.file;
        let textContent;
        try {
            textContent = zipFunctions.zipToText(file.path);
        } catch (error) {
            unlinkWithMessage(file.path, "unknown file deleted successfully");
            res.status(400).send("not a zip file");
        }
        const iv = crypto.randomBytes(16).toString("hex");

        let encryptedZip = textContent.map((piece) => {
            keyBuffer = Buffer.from(req.body.upload_key, "hex");
            return {
                filename: piece.filename,
                content: zipFunctions.encryptContent(piece.content, keyBuffer, iv),
            };
        });
        encryptedZip.push({
            iv: iv,
        });

        const jsonPath = `./temp/get/${encryptedZip[encryptedZip.length - 1].iv
            }.json`;

        unlinkWithMessage(file.path, "zip deleted successfully");
        fs.writeFileSync(jsonPath, JSON.stringify(encryptedZip, null, 2), "utf-8");

        res.send(iv);
    } catch (err) {
        res.status(300).send("server error");
    }
});

app.get("/upload", (req, res) => {
    try {
        let jsonPath = `./temp/get/${req.headers.iv}.json`;
        let jsonData = fs.readFileSync(jsonPath, "utf-8");

        res.setHeader("Content-Disposition", "attachment; filename=crypted.json");
        res.setHeader("Content-Type", "application/json");

        res.send(jsonData).then(unlinkWithMessage(jsonPath, "JSON deleted"));
    } catch {
        res.status(300).send("server error");
    }
});

app.post("/download", upload.single("file"), (req, res) => {
    try {
        const file = req.file;
        const filePath = file.path;

        const content = fs.readFileSync(filePath);
        let jsonData;
        try {
            jsonData = JSON.parse(content);
        } catch {
            unlinkWithMessage(filePath, "file deleted successfully");
            res.status(400).send("not a json file");
        }
        let iv = jsonData[jsonData.length - 1].iv;

        let decryptedData;
        try {
            decryptedData = jsonData.slice(0, -1).map((piece) => {
                const keyBuffer = Buffer.from(req.body.key, "hex");
                return {
                    filename: piece.filename,
                    content: zipFunctions.decryptContent(piece.content, keyBuffer, iv),
                };
            });
            const newPath = `./temp/get/${iv}`;
            fs.writeFileSync(newPath, JSON.stringify(decryptedData));
        } catch (err) {
            unlinkWithMessage(filePath, "json deleted successfully");
            res.status(401).send("invalid key");
        }
        unlinkWithMessage(filePath, "json deleted successfully");

        res.status(200).send(iv);
    } catch (err) {
        console.log(err);
    }
});

app.get("/download", (req, res) => {
    const downloadPath = `temp/get/${req.headers.iv}`;
    const rawJson = fs.readFileSync(downloadPath);

    const jsonData = JSON.parse(rawJson);
    const newZip = new AdmZip();
    jsonData.forEach((file) => {
        newZip.addFile(file.filename, Buffer.from(file.content, "binary"));
    });

    const zipPath = `./temp/get/${jsonData[0].filename.slice(0, -1)}.zip`;
    newZip.writeZip(zipPath);

    fs.unlink(downloadPath, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("file deleted successfully");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${encodeURIComponent(
                    jsonData[0].filename.slice(0, -1),
                )}.zip`,
            );
            res.setHeader("Content-Type", "application/zip");
            const readStream = fs.createReadStream(zipPath);
            readStream.pipe(res)
            res.on('finish', ()=>{

                unlinkWithMessage(zipPath, "Zip deleted")
            })
        }
    });
});

app.listen(PORT, console.log(`running on ${PORT}`));
