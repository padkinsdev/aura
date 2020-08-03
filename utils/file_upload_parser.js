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
    //console.log(chunks);
    //return;
    chunks.forEach((value, index) => {
        //console.log("Value: "+value);
        let fnamepos = value.search('filename');
        if (fnamepos < 0){
            //console.log("No filename");
            files.push(new UploadedFile("", "", "No filename attribute"));
        } else {
            let lines = value.split('\n');
            //console.log("Lines:");
            //console.log("Lines[1]: "+lines[1]);
            let headers = lines[1].split(";");
            if (headers.length != 3){
                //console.log("Wrong # of headers");
                files.push(new UploadedFile("", "", "Wrong number of headers"));
            } else {
                let filename = headers[2].split('=')[1];
                filename = filename.slice(1, filename.length-2);
                //console.log("Filename: "+filename);
                //lines.splice(0,4);
                lines.splice(0,4); // remove the form data headers
                let fdata = lines.join("\n");
                //console.log("data:");
                //console.log(fdata);
                //console.log("-----------");
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