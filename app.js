require('dotenv').config({path:'./config/keys/.env'});
const path = require("path");
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./src/routes/route'); 
const https = require('https');
const http = require('http');
const fs = require('fs');

const HTTP_PORT = process.env.HTTP_PORT;
const HTTPS_PORT = process.env.HTTPS_PORT;
const HOST = 'localhost';

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const fileUpload = require("express-fileupload");
app.use(express.static("public"));
app.use(fileUpload());

// FOR USING SSL/TLS:
let options;
try {
  options = {
    key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
    cert: fs.readFileSync('./config/ssl/server.crt', 'utf8'),
  };
} catch (err) {
  console.error('ERROR READING SSL/TLS FILES:', err);
  options = null;
}

// FOR HTTPS server
if (options) {
  const server = https.createServer(options, app);

  server.listen(HTTPS_PORT, () => {
    console.log(`HTTPS SERVER LISTENING ON ${HOST}:${HTTPS_PORT}`);
  });

  server.on('error', (err) => {
    console.error('HTTPS SERVER ERROR:', err);
  });
} else {
  console.log('SSL/TLS FILES NOT FOUND. HTTPS SERVER NOT STARTED.');
}

// FOR HTTP server
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP SERVER LISTENING ON ${HOST}:${HTTP_PORT}`);
});

app.use('/user', routes);


// rendering ejs
app.get("/form", function (req, res) {res.render("form")});
app.get("/result", (req, res) => {
  const imgDirPath = path.join(__dirname, "./public/images");
  if (!fs.existsSync(imgDirPath)) {
    fs.mkdirSync(imgDirPath);
  }
  const imgFiles = fs.readdirSync(imgDirPath).map((image) => `images/${image}`);
  res.render("result", { imgFiles });
});

// end


app.all('*', (req, res, next) => {
  console.log( `Can't find ${req.url} on the server`);
  return res.status(404).json({ message: `Can't find ${req.url} on the server` });
});



