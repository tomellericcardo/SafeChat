# -*- coding: utf-8 -*-

from sqlite3 import *


class SafeBase:
    
    def __init__(self, g, database_filename):
        self.g = g
        self.database_filename = database_filename
    
    def apri_connessione(self):
        self.g.db = connect(self.database_filename)
    
    def chiudi_connessione(self):
        db = getattr(self.g, 'db', None)
        if db is not None:
            db.close()
    
    def utente_valido(self, username, password):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT COUNT(*)
                            FROM utente
                            WHERE username = ?
                            AND password = ?''', (username, password))
        valido = cursore.fetchone()[0] == 1
        cursore.close()
        return valido
    
    def username_presente(self, username):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT COUNT(*)
                            FROM utente
                            WHERE username = ? ''', (username,))
        presente = cursore.fetchone()[0] == 1
        cursore.close()
        return presente
    
    def registra_utente(self, username, password, chiave):
        cursore = self.g.db.cursor()
        cursore.execute(''' INSERT INTO utente
                            VALUES (?, ?, ?) ''', (username, password, chiave))
        self.g.db.commit()
        cursore.close()
