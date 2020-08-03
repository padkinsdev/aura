import sanitize
import sys
import bcrypt
import sqlite3
from os.path import isfile
#import os

args = sys.argv[1].split("&")
#print(args)

if len(args) < 3:
    print("args < 3")
elif (args[0][:6] != "uname=" or args[1][:6] != "pword=" or args[2][:6] != "email="):
    print("false")
else:
    username = args[0].split("=")[1]
    password = args[1].split("=")[1]
    email = args[2].split("=")[1]
    if (not sanitize.sanitary(username) or not sanitize.sanitary(password)): # should the email field also be sanitized?
        print("illegal char")
    else:
        #print(os.getcwd())
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        #print(salt)
        PASSPATH = './data/passwords.db'
        if not isfile(PASSPATH):
            with open(PASSPATH, 'w') as initialize:
                initialize.close()
            conn = sqlite3.connect(PASSPATH)
            crsr = conn.cursor()
            crsr.execute("CREATE TABLE users (username TEXT PRIMARY KEY, password TEXT, salt TEXT, email TEXT)")
        else:
            conn = sqlite3.connect(PASSPATH)
            crsr = conn.cursor()
        crsr.execute('INSERT INTO users (username, password, salt, email) VALUES (?, ?, ?, ?)', [username, hashed, salt, email])
        conn.commit()
        conn.close()
        with open('./data/usernames.txt', 'a') as names:
            names.write(username)
        print("success")
