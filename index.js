const https = require('https');
const http = require('http');
const fs = require('fs');
const router = require('./request_handling/req_route');

const hostname = require('os').hostname();
console.log(hostname);

const FORM_URLENCODED = 'application/x-www-form-urlencoded';

function downloadFile(url, fpath){ 
    // this function is solely used to fetch the certificate and key files for running with Travis CI
    return new Promise((resolve, reject) => {
        let data = [];
        http.get(url, (res) => {
            if (res.statusCode != 200){
                reject(`Got status code ${res.statusCode} when attempting to fetch file from ${url}`);
            }
            res.on('data', (chunk) => {
                data.push(chunk);
            });
            res.on('error', (err) => {
                reject(`Error while fetching file from ${url}:\n${err}`);
            })
            res.on('end', () => {
                data = Buffer.concat(data).toString();
                fs.writeFileSync(fpath, data);
                resolve(data);
            });
        });
    });
}

downloadFile(process.env.key_url, './key.pem')
.then((data) => {
    return downloadFile(process.env.cert_url, './certificate.pem');
})
.then((data) => {
    const options = {
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./certificate.pem')
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
})
.catch((reason) => {
    console.error(reason);
});

/*
if you are not fetching the certificate and key files from a remote url, 
your index.js file can simply consist of:

const options = {
    key: fs.readFileSync('<PATH TO KEY>'),
    cert: fs.readFileSync('<PATH TO CERTIFICATE>')
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
*/
