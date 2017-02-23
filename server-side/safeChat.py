# -*- coding: utf-8 -*-

from hashlib import sha256
from os import path
from random import choice
from re import compile
from sqlite3 import connect


class SafeChat:
    
    def __init__(self, g, database_filename, pepe):
        self.g = g
        self.database_filename = database_filename
        self.pepe = pepe
    
    def apri_connessione(self):
        root = path.dirname(path.realpath(__file__))
        self.g.db = connect(path.join(root, 'database.db'))
        self.g.db.text_factory = str
        self.g.db.create_function("REGEXP", 2, self.regexp)
    
    def chiudi_connessione(self):
        db = getattr(self.g, 'db', None)
        if db is not None:
            db.close()
    
    def regexp(self, espressione, oggetto):
        reg = compile(espressione)
        return reg.search(oggetto) is not None
    
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
            sale += choice(alfabeto)
        return sale
    
    def registra_utente(self, username, password, chiave):
        sale = self.genera_sale()
        password_criptata = sha256(password + sale + self.pepe).hexdigest()
        cursore = self.g.db.cursor()
        cursore.execute(''' INSERT INTO utente
                            VALUES (?, ?, ?, ?) ''', (username, password_criptata, chiave, sale))
        self.g.db.commit()
        cursore.close()
    
    def cerca_utente(self, username):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT username
                            FROM utente
                            WHERE username REGEXP ? ''', (username,))
        return cursore.fetchall()
    
    def chiave_pubblica(self, username):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT chiave
                            FROM utente
                            WHERE username = ? ''', (username,))
        return cursore.fetchone()[0]
    
    def leggi_messaggi(self, proprietario, partecipante):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT mittente, testo
                            FROM messaggio
                            WHERE proprietario = ?  AND partecipante = ? 
                            ORDER BY data_ora ASC''', (proprietario, partecipante))
        return cursore.fetchall()
    
    def invia_messaggio(self, mittente, destinatario, testo_mittente, testo_destinatario):
        cursore = self.g.db.cursor()
        cursore.execute(''' INSERT INTO messaggio (proprietario, partecipante, mittente, testo)
                            VALUES (?, ?, ?, ?) ''', (mittente, destinatario, mittente, testo_mittente))
        self.g.db.commit()
        cursore.execute(''' INSERT INTO messaggio (proprietario, partecipante, mittente, testo)
                            VALUES (?, ?, ?, ?) ''', (destinatario, mittente, mittente, testo_destinatario))
        self.g.db.commit()
        cursore.close()
