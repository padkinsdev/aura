class UploadedFile{
    constructor(filename, data, err){
        this.filename = filename;
        this.data = data;
        this.err = err;
    }
}

function parseForm(data){
    // SO MUCH NESTING!!!
    let files = [];
    let chunks = data.split('------WebKitFormBoundary');
    chunks.forEach((value, index) => {
        let fnamepos = value.search('filename');
        if (fnamepos < 0){
            files.push(new UploadedFile("", "", "No filename attribute"));
        } else {
            let lines = value.split('\n');
            let headers = lines[1].split(";");
            if (headers.length != 3){
                files.push(new UploadedFile("", "", "Wrong number of headers"));
            } else {
                let filename = headers[2].split('=')[1];
                filename = filename.slice(1, filename.length-2);
                lines.splice(0,4); // remove the form data headers
                let fdata = lines.join("\n");
                files.push(new UploadedFile(filename, fdata.replace(/%20/g, " "), ""));
            }
        }
    });
    return files;
}

exports.parse = parseForm;

// Data example:
/*
------WebKitFormBoundaryjkulSBLodo1OTZ8m
Content-Disposition: form-data; name="package.json"; filename="package.json"
Content-Type: application/json

ä
    "scripts": ä
        "start": "node index.js"
    å,
    "dependencies": ä
        "discord": "Ü0.8.2",
        "discord.js": "Ü12.2.0"
    å
å

------WebKitFormBoundaryjkulSBLodo1OTZ8m--
*/
