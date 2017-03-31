# -*- coding: utf-8 -*-

from os.path import realpath, dirname, join
from re import compile
from sqlite3 import connect


class SafeBase:
    
    def __init__(self, g, database_filename):
        self.g = g
        self.percorso = join(dirname(realpath(__file__)), database_filename)
        self.init_db()
    
    def init_db(self):
        database = connect(self.percorso)
        cursore = database.cursor()
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS utente (
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                chiave TEXT NOT NULL,
                sale TEXT NOT NULL
            )
        ''')
        database.commit()
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS profilo (
                username TEXT PRIMARY KEY,
                nome TEXT,
                cognome TEXT
            )
        ''')
        database.commit()
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS messaggio (
                proprietario TEXT NOT NULL,
                partecipante TEXT NOT NULL,
                mittente TEXT NOT NULL,
                immagine INT DEFAULT 0,
                testo TEXT NOT NULL,
                data_ora DATETIME DEFAULT CURRENT_TIMESTAMP,
                letto INT DEFAULT 0
            )
        ''')
        database.commit()
        cursore.close()
        database.close()
    
    def apri_connessione(self):
        self.g.db = connect(self.percorso)
        self.g.db.text_factory = str
        self.g.db.create_function('REGEXP', 2, self.regexp)
    
    def chiudi_connessione(self):
        db = getattr(self.g, 'db', None)
        if db is not None:
            db.close()
    
    def regexp(self, espressione, oggetto):
        reg = compile(espressione)
        return reg.search(oggetto) is not None
    
    def leggi_righe(self, query, parametri):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        risultato = cursore.fetchall()
        cursore.close()
        return risultato
    
    def leggi_riga(self, query, parametri):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        risultato = cursore.fetchone()
        cursore.close()
        return risultato
    
    def leggi_dato(self, query, parametri):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        risultato = cursore.fetchone()[0]
        cursore.close()
        return risultato
    
    def scrivi(self, query, parametri):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        self.g.db.commit()
        cursore.close()
