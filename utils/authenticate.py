import sys
import sanitize
import sqlite3
import bcrypt
from os.path import isfile

args = sys.argv[1].split("&")

if len(args) < 2:
    print("args < 2")
elif (args[0][:6] != "uname=" or args[1][:6] != "pword="):
    print("false")
else:
    username = args[0].split("=")[1]
    password = args[1].split("=")[1]
    PASSPATH = './data/passwords.db'
    if (not sanitize.sanitary(username) or not sanitize.sanitary(password)):
        print("illegal char")
    else:
        if isfile(PASSPATH):
            conn = sqlite3.connect(PASSPATH)
            crsr = conn.cursor()
            crsr.execute('SELECT * FROM users WHERE username=?', [username])
            row = crsr.fetchone()
            if row is None:
                print("user nonexistent")
            else:
                password = row[1]
                salt = row[2]
                attempt = bcrypt.hashpw(password, salt)
                if not bcrypt.checkpw(password, attempt):
                    print('false')
                else:
                    print('true')
            conn.commit()
            conn.close()
        else:
            print("db nonexistent")
    
