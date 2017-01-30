import sqlite3
conn = sqlite3.connect('database.db')

c = conn.cursor()
c.execute('''   CREATE TABLE utente
                (username text primary key, password text not null) ''')
c.commit()
conn.close()
