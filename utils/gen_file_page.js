const fs = require("fs");
const util = require("util");

const asyncReadDir = util.promisify(fs.readdir);

function gen_user_fpage(identifier) {
    // identifier is remoteAdress#id
    //return "Sup";
    return new Promise((resolve_out) => {
        //let page = ""; // honestly an unnecessary initialization
        let now = new Date();
        now.setTime(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        let page = `${fs.readFileSync("./data/file_page_top.txt").toString()}\n`;
        //const asyncReadDir = util.promisify(fs.readdir);
        asyncReadDir(`./data/files/${identifier}`)
            .then((files) => {
                //console.log(`Successfully fetched files for ${identifier}`);
                if (files.length > 0) {
                    files.forEach((fname) => {
                        var stats = fs.statSync(`./data/files/${identifier}/${fname}`);
                        var fbytes = stats["size"];
                        let fsize = "?B";
                        if (fbytes > 1000000000) {
                            fsize = `${Math.floor(fbytes / 1000000000)}GB`;
                        } else if (fbytes > 1000000) {
                            fsize = `${Math.floor(fbytes / 1000000)}MB`;
                        } else if (fbytes > 1000) {
                            fsize = `${Math.floor(fbytes / 1000)}KB`;
                        } else {
                            fsize = `${fbytes}B`;
                        }
                        addition = `
                    <tr>
                        <td class="filename">${fname}</td>
                        <td class="size">${fsize}</td>
                        <td class="trash"><img src="./trash_icon.png" alt="trash" class="trash-icon" onclick="deleteFile('${fname}')"></td>
                        <td class="dl-cell"><img src="./down_btn.png" alt="download" class="download-icon" onclick="download('${fname}')"></td>
                    </tr>
                    `;
                        page = page + addition;
                    });
                } else {
                    addition = `
                <tr>
                    <td class="filename">You currently have no files</td>
                </tr>
                `;
                    page = page + addition;
                }
                page = page + fs.readFileSync("./data/file_page_bottom.txt").toString();
                resolve_out(page);
            })
            .catch((err) => {
                console.warn(
                    `Error occurred when attempting to load files for ${identifier}:\n${err}`
                );
                if (err.code == "ENOENT") {
                    addition = `
                    <tr>
                        <td class="filename">You currently have no files</td>
                    </tr>
                `;
                    page = page + addition;
                } else {
                    addition = `
                    <tr>
                        <td class="filename">An unknown error has occured</td>
                    </tr>
                `;
                    page = page + addition;
                }
                page = page + fs.readFileSync("./data/file_page_bottom.txt").toString();
                resolve_out(page);
            });
        //return fullpage;
        /*
            .finally(() => {
                page = page + fs.readFileSync('./data/file_page_bottom.txt').toString();
                resolve(page);
            });
            */
        //page = page + `document.cookie = "id=${id}; expires=${now.toUTCString()}; path=/";`;
        //page = page + `${fs.readFileSync('./data/file_page_mid.txt').toString()}\n`;
        // add files
        /*
            fs.readdir(`./data/files/${identifier}`, (err, files) => {
                let addition = '';
                //console.log(err);
                if (err){
                    if (err.code == "ENOENT"){
                        addition = `
                            <tr>
                                <td class="filename">You currently have no files</td>
                            </tr>
                        `;
                        page = page + addition;
                    } else {
                        addition = `
                            <tr>
                                <td class="filename">An unknown error has occured</td>
                            </tr>
                        `;
                        page = page + addition;
                    }
                } else {
                    if (files.length > 0){
                        files.forEach((fname) => {
                            var stats = fs.statSync(`./data/files/${identifier}/${fname}`);
                            var fbytes = stats["size"];
                            let fsize = "?B"
                            if (fbytes > 1000000000){
                                fsize = `${Math.floor(fbytes / 1000000000)}GB`;
                            } else if (fbytes > 1000000){
                                fsize = `${Math.floor(fbytes / 1000000)}MB`;
                            } else if (fbytes > 1000){
                                fsize = `${Math.floor(fbytes / 1000)}KB`;
                            } else {
                                fsize = `${fbytes}B`;
                            }
                            addition = `
                            <tr>
                                <td class="filename">${fname}</td>
                                <td class="size">${fsize}</td>
                                <td class="dl-cell"><img src="./down_btn.png" alt="download" class="download-icon" onclick="download('test.txt')"></td>
                            </tr>
                            `;
                            page = page + addition;
                        });
                    } else {
                        addition = `
                        <tr>
                            <td class="filename">You currently have no files</td>
                        </tr>
                        `;
                        page = page + addition;
                    }
                }
                page = page + fs.readFileSync('./data/file_page_bottom.txt').toString();
                resolve(page);
            });
            */
        //page = page + fs.readFileSync('./data/file_page_bottom.txt').toString();
    });
}

exports.gen_files = gen_user_fpage;
