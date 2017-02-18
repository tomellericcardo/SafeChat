# -*- coding: utf-8 -*-

from hashlib import sha256
from os import path
import random
from sqlite3 import *


class SafeChat:
    
    def __init__(self, g, database_filename, seme, pepe):
        self.g = g
        self.database_filename = database_filename
        self.pepe = pepe
        random.seed(seme)
    
    def apri_connessione(self):
        root = path.dirname(path.realpath(__file__))
        self.g.db = connect(path.join(root, 'database.db'))
        self.g.db.text_factory = str
    
    def chiudi_connessione(self):
        db = getattr(self.g, 'db', None)
        if db is not None:
            db.close()
    
    def utente_valido(self, username, password):
        valido = False
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT password, sale
                            FROM utente
                            WHERE username = ? ''', (username,))
        risultato = cursore.fetchone()
        if risultato:
            password_criptata = risultato[0]
            sale = risultato[1]
            valido = password_criptata == sha256(password + sale + self.pepe).hexdigest()
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
    
    def genera_sale(self):
        sale = ''
        alfabeto = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        for i in range(16):
            sale += random.choice(alfabeto)
        return sale
    
    def registra_utente(self, username, password, chiave):
        sale = self.genera_sale()
        password_criptata = sha256(password + sale + self.pepe).hexdigest()
        cursore = self.g.db.cursor()
        cursore.execute(''' INSERT INTO utente
                            VALUES (?, ?, ?, ?) ''', (username, password_criptata, chiave, sale))
        self.g.db.commit()
        cursore.close()
