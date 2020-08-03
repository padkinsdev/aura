const https = require('https');
const fs = require('fs');
const router = require('./request_handling/req_route');

const FORM_URLENCODED = 'application/x-www-form-urlencoded';

const options = {
    key: fs.readFileSync('./secondkey.pem'),
    cert: fs.readFileSync('./secondcert.pem')
};

https.createServer(options, (req, res) => {
    if (req.headers['content-type'] == FORM_URLENCODED){
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        });
        req.on('end', () => {
            body = Buffer.concat(body).toString();
            router.route(req, body)
            .then((result) => {
                res.statusCode = result.code;
                if (result.headers != "none"){
                    result.headers.forEach(element => {
                        res.setHeader(element.split('|')[0], element.split('|')[1]);
                    });
                }
                res.end(result.data);
            })
            .catch((reason) => {
                console.log(`Client request routing failed due to:\n${reason}`);
                res.statusCode = 500;
                fs.readFile('./pages/errors/500.html', (err, data) => {
                    if (err){
                        res.end('Multiple server-side errors occurred');
                    } else {
                        res.end(data);
                    }
                })
            });
        });
    } else {
        router.route(req)
        .then((result) => {
            res.statusCode = result.code;
            if (result.headers != "none"){
                result.headers.forEach(element => {
                    res.setHeader(element.split('|')[0], element.split('|')[1]);
                });
            }
            res.end(result.data);
        })
        .catch((reason) => {
            console.log(`Client request routing failed due to:\n${reason}`);
            res.statusCode = 500;
            fs.readFile('./pages/errors/500.html', (err, data) => {
                if (err){
                    res.end('Multiple server-side errors occurred');
                } else {
                    res.end(data);
                }
            })
        });
    }
}).listen(8000);
