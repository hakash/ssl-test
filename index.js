require("dotenv").config();
const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");

const serverCert = process.env.SERVER_CERTIFICATE || "server-certificate.pem";
const serverKey = process.env.SERVER_CERTIFICATE_KEY || "server-certificate.key";
const httpsPort = process.env.HTTPS_PORT || 8443;
const httpPort = process.env.HTTP_PORT || 8080;

if(!fs.existsSync(serverCert) || !fs.existsSync(serverKey)){
	console.log("Missing certificate or key:\n%s\n%s",serverCert, serverKey);
	console.log("If you want to generate a certificate for testing or development you can run the following command if you have openssl installed:\n");
	console.log("openssl req -x509 -newkey rsa:4096 -keyout 'server-certificate.key' -out 'server-certificate.pem' -days 365 -subj '/CN=localhost' -nodes");
}

var ssl_options = {
	key: fs.readFileSync(serverKey),
	cert: fs.readFileSync(serverCert)
};

var app = express();

app.use(express.static("./public"));

app.get("/", function(req,res){
	res.writeHead(301, { Location: "/index.html" });
	res.end();
});

https.createServer(ssl_options,app).listen(httpsPort);

http.createServer(function(req,res){
	let redirUrl = "https://" + req.headers.host.split(":")[0] + ":8443" + req.url;
	console.log(redirUrl);
	res.writeHead(302, { Location: redirUrl });
	res.end();
}).listen(httpPort);