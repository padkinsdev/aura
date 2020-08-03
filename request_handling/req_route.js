//const errh = require('../utils/file_fetcher');
const fs = require('fs');
const { spawn } = require('child_process');
const userpage = require('../utils/gen_file_page');
const parseform = require('../utils/file_upload_parser');
//const util = require('util');

//var active_sessions = new Map();
var session_start = new Map();

function route(req, body){
    return new Promise(async(resolve) => {
        concat_path = req.url;
        if (req.url.includes('?')){
            concat_path = req.url.split('?')[0];
        }
        switch(concat_path){
            case "/":
                //console.log(req.headers);
                if (req.headers.cookie != undefined){
                    if (req.headers.cookie.split('=')[0] == 'uname'){
                        let nowDate = new Date();
                        let nowStr = {
                            year: nowDate.getUTCFullYear(),
                            month: nowDate.getUTCMonth(),
                            day: nowDate.getUTCDate()
                            //hour: nowDate.getUTCHours(),
                            //minute: nowDate.getUTCMinutes()
                        }
                        const key = `${req.socket.remoteAddress}#${req.headers.cookie.split('=')[1]}`;
                        if (session_start.has(key)){
                            const last_login = session_start.get(key);
                            if (last_login.year != nowStr.year || last_login.month != nowStr.month || (last_login.month == nowStr.month && nowStr.day - last_login.day > 7)){
                                session_start.delete(key);
                                //active_sessions.delete(key);
                                //console.log(3);
                                resolve(new InternalResponse(200, fs.readFileSync('./pages/defined/index.html')));
                            } else {
                                userpage.gen_files(key)
                                .then((page) => {
                                    resolve(new InternalResponse(200, page));
                                });
                            }
                        } else {
                            //console.log(1);
                            resolve(new InternalResponse(200, fs.readFileSync('./pages/defined/index.html')));
                        }
                    } else {
                        //console.log(0);
                        resolve(new InternalResponse(200, fs.readFileSync('./pages/defined/index.html')));
                    }
                } else {
                    //console.log(2);
                    resolve(new InternalResponse(200, fs.readFileSync('./pages/defined/index.html')));
                }
                break;
            case "/upload":
                //console.log(req.headers);
                if (req.method != "POST" || req.headers.cookie == undefined){
                    resolve(new InternalResponse(400, fs.readFileSync('./pages/errors/400.html')));
                } else if (req.headers.cookie.split('=')[0] != 'uname'){
                    resolve(new InternalResponse(400, "Cookie header is set, but uname key is not the first key"));
                } else if (!(session_start.has(`${req.socket.remoteAddress}#${req.headers.cookie.split('=')[1]}`))){
                    resolve(new InternalResponse(401, "Invalid credentials"));
                } else {
                    let foldername = `${req.socket.remoteAddress}#${req.headers.cookie.split('=')[1]}`;
                    let savefiles = (file_list) => {
                        let failed = [];
                        file_list.forEach((value) => {
                            if (value.err == "" && !(fs.existsSync(`./data/files/${foldername}/${value.filename}`))){
                                //let fstream = fs.createWriteStream(`./data/files/${foldername}/${value.filename}`);
                                //value.data.pipe(fstream)
                                fs.writeFile(`./data/files/${foldername}/${value.filename}`, value.data, (err) => {
                                    if (err){
                                        console.log(`Error while saving file ${value.filename}: ${err}`);
                                        failed.push(value.filename);
                                    }
                                });
                            } else if (value.filename != ""){
                                console.log(`Path: ${value.filename} and err = ${value.err}`);
                                failed.push(value.filename);
                            }
                        });
                        if (failed.toString() == ""){
                            resolve(new InternalResponse(200, "All files uploaded successfully"));
                        } else {
                            console.log("End err: ");
                            console.log(failed);
                            resolve(new InternalResponse(500, "The following files could not be uploaded: "+failed.join(", ")));
                        }
                    }
                    let filearray = parseform.parse(body);
                    if (!(fs.existsSync(`./data/files`))){
                        fs.mkdir('./data/files', (err) => {
                            if (err){
                                console.log(`Error when creating ./data/files directory:${err}`);
                                resolve(new InternalResponse(500, "An internal server error occurred"));
                            } else {
                                if (!(fs.existsSync(`./data/files/${foldername}`))){
                                    fs.mkdir(`./data/files/${foldername}`, (err) => {
                                        if (err){
                                            console.log(`Error when creating ./data/files/${foldername} directory:${err}`);
                                            resolve(new InternalResponse(500, "An internal server error occurred"));
                                        } else {
                                            //console.log("1.1");
                                            savefiles(filearray);
                                        }
                                    });
                                } else {
                                    //console.log("1.2");
                                    savefiles(filearray);
                                }
                            }
                        });
                    } else {
                        if (!(fs.existsSync(`./data/files/${foldername}`))){
                            fs.mkdir(`./data/files/${foldername}`, (err) => {
                                if (err){
                                    console.log(`Error when creating ./data/files/${foldername} directory:${err}`);
                                    resolve(new InternalResponse(500, "An internal server error occurred"));
                                } else {
                                    //console.log("2.1");
                                    savefiles(filearray);
                                }
                            });
                        } else {
                            //console.log("2.2");
                            savefiles(filearray);
                        }
                        //console.log(3);
                        //savefiles(filearray);
                    }
                    //resolve(new InternalResponse(200, "Upload success"));
                }
                break;
            case "/download":
                if (!(req.url.includes('?'))){
                    resolve(new InternalResponse(400, "File name is missing from url query string"));
                } else if (!(req.url.split('?')[1].includes("="))){
                    resolve(new InternalResponse(400, "File name is missing from url query string"));
                } else if (req.url.split('?')[1].split('=')[0] != "file"){
                    resolve(new InternalResponse(400, "File name is missing from url query string"));
                } else if (req.headers.cookie == undefined){
                    resolve(new InternalResponse(400, "Missing cookie header"));
                } else if (req.headers.cookie.split('=')[0] != "uname"){
                    resolve(new InternalResponse(400, "Cookie header field is present, but not valid"));
                } else if (!(session_start.has(`${req.socket.remoteAddress}#${req.headers.cookie.split('=')[1]}`))){
                    resolve(new InternalResponse(401, "Invalid credentials"));
                } else {
                    let username = req.headers.cookie.split('=')[1];
                    let folder = `${req.socket.remoteAddress}#${username}`;
                    let filename = req.url.split('?')[1].split('=')[1].replace(/%20/g, " ");
                    //console.log(`./data/files/${folder}/${filename}`);
                    if (!(fs.existsSync(`./data/files/${folder}/${filename}`))){
                        resolve(new InternalResponse(404, "The requested file was not found"));
                    } else {
                        fs.readFile(`./data/files/${folder}/${filename}`, (err, data) => {
                            if (err){
                                console.log(`Error while attempting to read file ./data/files/${folder}/${filename}`);
                                resolve(new InternalResponse(500, "An internal server error occurred"));
                            } else {
                                resolve(new InternalResponse(200, data));
                            }
                        });
                    }
                }
                break;
            case "/favicon.ico":
                resolve(new InternalResponse(200, fs.readFileSync('./pages/defined/triangle.ico')));
                break;
            case "/register":
                resolve(new InternalResponse(200, fs.readFileSync('./pages/defined/register.html')));
                break;
            case "/down_btn.png":
                resolve(new InternalResponse(200, fs.readFileSync('./pages/defined/download.png'))); 
                // stolen from https://github.com/signalapp/Signal-Android/blob/master/app/src/main/res/drawable-hdpi/ic_download_32.png
                break;
            case "/confirm-registration":
                if (req.method != "POST"){
                    resolve(new InternalResponse(200, fs.readFileSync('./pages/errors/400.html')));
                } else if (body.includes("|") || body.includes(";") || body.includes("&&")){
                    resolve(new InternalResponse(200, fs.readFileSync('./pages/errors/403.html')));
                } else {
                    data = [];
                    const registrator = spawn('python3', ['./utils/new_user.py', body]);
                    registrator.stdout.on('data', (chunk) => {
                        data.push(chunk);
                    });
                    registrator.stderr.on('data', (chunk) => {
                        console.warn(`new_user.py issued the following to stderr:\n${chunk}`);
                    });
                    registrator.on('close', (code) => {
                        data = Buffer.concat(data).toString().replace('\n', '');
                        //console.log(`Register output:\n${data}`);
                        if (data == "success"){
                            console.warn("User is being redirected to https://localhost:8000/");
                            resolve(new InternalResponse(301, "You are being redirected", ["Location|https://localhost:8000"]));
                        } else {
                            resolve(new InternalResponse(200, "Something went wrong. Please try again."));
                        }
                    });
                }
                break;
            case "/check-name":
                let exist_names;
                if (fs.existsSync('./data/usernames.txt')){
                    exist_names = fs.readFileSync('./data/usernames.txt').toString().split('\n');
                } else {
                    fs.open('./data/usernames.txt', 'w', (err, file) => {
                        if (err){
                            console.log('Error while trying to create usernames.txt: '+err);
                        } else {
                            console.log('Created usernames.txt');
                        }
                    })
                    exist_names = [];
                }
                if (!(req.url.includes("?uname="))){
                    resolve(new InternalResponse(400, "Incorrect url parameters"));
                } else {
                    if (exist_names.includes(req.url.split('?')[1].split('='))){
                        resolve(new InternalResponse(200, "true"));
                    } else {
                        resolve(new InternalResponse(200, "false"));
                    }
                }
                break;
            case "/authenticate":
                if (req.method != "POST"){
                    resolve(new InternalResponse(200, fs.readFileSync('./pages/errors/400.html')));
                } else if (body.includes("|") || body.includes(";") || body.includes("&&")){
                    resolve(new InternalResponse(200, fs.readFileSync('./pages/errors/403.html')));
                } else {
                    data = [];
                    const authenticate = spawn('python3', ['./utils/authenticate.py', body]);
                    authenticate.stdout.on('data', function (chunk) {
                        data.push(chunk);
                    });
                    authenticate.stderr.on('data', function(chunk){
                        console.warn(`authenticate.py issued the following to the stderr stream\n${chunk}`)
                    });
                    authenticate.on('close', (code) => {
                        data = Buffer.concat(data).toString().replace('\n', '');
                        //console.log("Auth output:\n" + data);
                        if (data == "true"){
                            username = body.split('&')[0].split('=')[1];
                            //console.log(username);
                            /*
                            let id = Math.floor(Math.random()*100);
                            while (active_sessions.has(`${req.socket.remoteAddress}/${id}`)){
                                id = Math.floor(Math.random()*100);
                            }
                            */
                            let key = `${req.socket.remoteAddress}#${username}`;
                            //active_sessions.set(key, username);
                            let nowDate = new Date();
                            let nowStr = {
                                year: nowDate.getUTCFullYear(),
                                month: nowDate.getUTCMonth(),
                                day: nowDate.getUTCDate()
                                //hour: nowDate.getUTCHours(),
                                //minute: nowDate.getUTCMinutes()
                            }
                            session_start.set(key, nowStr);
                            nowDate.setTime(nowDate.getTime()+(30*24*60*60*1000)); // 30 days from now (is when the cookie should expire)
                            console.warn("User is being redirected to https://localhost:8000/");
                            resolve(new InternalResponse(301, "You are being redirected", ["Location|https://localhost:8000/", `Set-Cookie|uname=${username};expires=${nowDate.toUTCString()};path=/`]));
                        } else if (data == "illegal char"){
                            resolve(new InternalResponse(200, fs.readFileSync('./pages/errors/403.html')));
                        } else if (data == "wrong credentials") {
                            resolve(new InternalResponse(200, fs.readFileSync('./pages/errors/401.html')));
                        } else {
                            resolve(new InternalResponse(200, fs.readFileSync('./pages/errors/401.html')))
                        }
                    });
                }
                break;
            case "/logout":
                if (session_start.has(`${req.socket.remoteAddress}#${req.headers.cookie.split('=')[1]}`)){
                    session_start.delete(`${req.socket.remoteAddress}#${req.headers.cookie.split('=')[1]}`);
                }
                resolve(new InternalResponse(301, "You are being redirected", ["Location|https://localhost:8000/"]));
                break;
            case "/trash_icon.png":
                resolve(new InternalResponse(200, fs.readFileSync('./pages/defined/trash.png')));
                break;
            case "/delete-file":
                // pretty much a carbon copy of the "/download" case
                if (!(req.url.includes('?'))){
                    resolve(new InternalResponse(400, "File name is missing from url query string"));
                } else if (!(req.url.split('?')[1].includes("="))){
                    resolve(new InternalResponse(400, "File name is missing from url query string"));
                } else if (req.url.split('?')[1].split('=')[0] != "file"){
                    resolve(new InternalResponse(400, "File name is missing from url query string"));
                } else if (req.headers.cookie == undefined){
                    resolve(new InternalResponse(400, "Missing cookie header"));
                } else if (req.headers.cookie.split('=')[0] != "uname"){
                    resolve(new InternalResponse(400, "Cookie header field is present, but not valid"));
                } else if (!(session_start.has(`${req.socket.remoteAddress}#${req.headers.cookie.split('=')[1]}`))){
                    resolve(new InternalResponse(401, "Invalid credentials"));
                } else {
                    let username = req.headers.cookie.split('=')[1];
                    let folder = `${req.socket.remoteAddress}#${username}`;
                    let filename = req.url.split('?')[1].split('=')[1].replace(/%20/g, " ");
                    if (!(fs.existsSync(`./data/files/${folder}/${filename}`))){
                        resolve(new InternalResponse(404, "The requested file was not found"));
                    } else {
                        fs.unlink(`./data/files/${folder}/${filename}`, (err) => {
                            if (err){
                                console.log(`Error while attempting to delete file ./data/files/${folder}/${filename}`);
                                resolve(new InternalResponse(500, "An internal server error occurred"));
                            } else {
                                //console.log('Successfully deleted');
                                resolve(new InternalResponse(200, "Successfully deleted"));
                            }
                        });
                    }
                }
                break;
            default:
                resolve(new InternalResponse(200, fs.readFileSync('./pages/errors/404.html')));
                break;
        }
        //reject("If you're getting this message, something is really, really wrong");
    });
}

class InternalResponse{
    constructor(code, data, headers="none"){
        if (typeof(code) != "number" || !(typeof(data) == "string" || data instanceof Buffer)){
            throw(`Args for object InternalResponse should be type number and Buffer, but were actually ${code} and ${data}`);
        }
        this.code = code;
        this.data = data;
        this.headers = headers;
    }
}

exports.route = route;