# aura

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4bab878fa1274cf7ae309481e5049c67)](https://app.codacy.com/manual/padkinsdev/aura?utm_source=github.com&utm_medium=referral&utm_content=padkinsdev/aura&utm_campaign=Badge_Grade_Dashboard)
[![CodeFactor](https://www.codefactor.io/repository/github/padkinsdev/aura/badge)](https://www.codefactor.io/repository/github/padkinsdev/aura)

### Table of Contents
* [Introduction](#introduction)
* [Setup](#setup)
* [Known Issues](#known-issues)
* [Contributing](#contributing)

### Introduction
Aura, named after the Greek goddess who represented the wind, is a cloud-based file storage system which supports multiple users with separate accounts. Aura's backend is written primarily in Javascript, with some Python for user authentication and signup.

**Requirements:**
* [Python 3](https://www.python.org/downloads/)
* [Node.js](https://nodejs.org/en/download/)

**Required Modules:**
* Python: [bcrypt](https://pypi.org/project/bcrypt/)
* Node.js: None

**Tested On:**
* MacOS 10.14.6 (Mojave)
* Python 3.8.2
* Node.js 12.16.3
* npm 6.14.6
* bcrypt 3.1.7
* Google Chrome 84.0.4147.89 (64-bit)

### Setup
Clone or [download](https://github.com/padkinsdev/aura/archive/master.zip) the repository. Put your server certificate and key (both are .pem files) in the same directory as index.js. Open the terminal, navigate to the directory which contains index.js, and run `npm start`.

**NOTE:**
1. If you don't have a certificate and key, you can generate them with [OpenSSL](https://www.openssl.org/source/). Alternatively, you can supply a .pfx file in index.js, as specified in the node.js [https documentation](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).
2. The file server is configured to run on [https://localhost:8000]. If you want to make the server publicly available, follow the instructions [here](https://stackoverflow.com/a/14293394). Additionally, change `.listen(8000)` in index.js to `.listen(<port>, <host>)` as specified by the node.js [Net documentation](https://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback).

### Known Issues
* I have noticed that the server sometimes has issues with avoiding username collisions.
* The application is currently only able to successfully save text and related files. When I have tried to upload and then download .png and .pdf files, I have found that the files come out corrupted. I highly suspect that this has something to do with the way that files are encoded when they are saved by the server through [/utils/file_upload_parser.js](https://github.com/padkinsdev/aura/blob/master/utils/file_upload_parser.js), but if anyone knows of a solution, please reach out to me or submit a pull request.

### Contributing
Pull requests and bug reports are welcome. Please provide as much explanation and/or documentation for your code/issue as possible.
