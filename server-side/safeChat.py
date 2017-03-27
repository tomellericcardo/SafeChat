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
        self.init_db()
    
    def init_db(self):
        root = path.dirname(path.realpath(__file__))
        database = connect(path.join(root, 'database.db'))
        cursore = database.cursor()
        cursore.execute(''' CREATE TABLE IF NOT EXISTS utente (
                                username TEXT PRIMARY KEY,
                                password TEXT NOT NULL,
                                chiave TEXT NOT NULL,
                                sale TEXT NOT NULL
                            ) ''')
        database.commit()
        cursore.execute(''' CREATE TABLE IF NOT EXISTS profilo (
                                username TEXT PRIMARY KEY,
                                nome TEXT,
                                cognome TEXT
                            ) ''')
        database.commit()
        cursore.execute(''' CREATE TABLE IF NOT EXISTS messaggio (
                                proprietario TEXT NOT NULL,
                                partecipante TEXT NOT NULL,
                                mittente TEXT NOT NULL,
                                immagine INT DEFAULT 0,
                                testo TEXT NOT NULL,
                                data_ora DATETIME DEFAULT CURRENT_TIMESTAMP,
                                letto INT DEFAULT 0
                            ) ''')
        database.commit()
        cursore.close()
        database.close()
    
    def apri_connessione(self):
        root = path.dirname(path.realpath(__file__))
        self.g.db = connect(path.join(root, 'database.db'))
        self.g.db.text_factory = str
        self.g.db.create_function('REGEXP', 2, self.regexp)
    
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
        cursore.execute(''' INSERT INTO profilo
                            VALUES (?, '', '') ''', (username,))
        self.g.db.commit()
        cursore.close()
    
    def leggi_conversazioni(self, username):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT partecipante,
                            SUM(CASE letto WHEN 0 THEN 1 ELSE 0 END)
                            FROM messaggio
                            WHERE proprietario = ? 
                            GROUP BY partecipante ''', (username,))
        return cursore.fetchall()
    
    def elimina_conversazione(self, proprietario, partecipante):
        cursore = self.g.db.cursor()
        cursore.execute(''' DELETE FROM messaggio
                            WHERE proprietario = ? AND partecipante = ? ''', (proprietario, partecipante))
        self.g.db.commit()
        cursore.close()
    
    def n_conversazioni(self, username):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT COUNT(partecipante)
                            FROM messaggio
                            WHERE proprietario = ? 
                            GROUP BY partecipante ''', (username,))
        return cursore.fetchall()
    
    def cerca_utente(self, testo):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT username, nome, cognome
                            FROM profilo
                            WHERE LOWER(username || nome || cognome)
                            REGEXP ? ''', (testo,))
        return cursore.fetchall()
    
    def chiave_pubblica(self, username):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT chiave
                            FROM utente
                            WHERE username = ? ''', (username,))
        return cursore.fetchone()[0]
    
    def leggi_messaggi(self, proprietario, partecipante):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT mittente, immagine, testo
                            FROM messaggio
                            WHERE proprietario = ? AND partecipante = ?
                            ORDER BY data_ora ASC ''', (proprietario, partecipante))
        risposta = cursore.fetchall()
        cursore.execute(''' UPDATE messaggio
                            SET letto = 1
                            WHERE proprietario = ? AND partecipante = ? ''', (proprietario, partecipante))
        self.g.db.commit()
        cursore.close()
        return risposta
    
    def invia_messaggio(self, mittente, destinatario, testo_mittente, testo_destinatario):
        cursore = self.g.db.cursor()
        cursore.execute(''' INSERT INTO messaggio (proprietario, partecipante, mittente, testo, letto)
                            VALUES (?, ?, ?, ?, 1) ''', (mittente, destinatario, mittente, testo_mittente))
        self.g.db.commit()
        cursore.execute(''' INSERT INTO messaggio (proprietario, partecipante, mittente, testo)
                            VALUES (?, ?, ?, ?) ''', (destinatario, mittente, mittente, testo_destinatario))
        self.g.db.commit()
        cursore.close()
    
    def invia_immagine(self, mittente, destinatario, immagine_mittente, immagine_destinatario):
        cursore = self.g.db.cursor()
        cursore.execute(''' INSERT INTO messaggio (proprietario, partecipante, mittente, immagine, testo, letto)
                            VALUES (?, ?, ?, 1, ?, 1) ''', (mittente, destinatario, mittente, immagine_mittente))
        self.g.db.commit()
        cursore.execute(''' INSERT INTO messaggio (proprietario, partecipante, mittente, immagine, testo)
                            VALUES (?, ?, ?, 1, ?) ''', (destinatario, mittente, mittente, immagine_destinatario))
        self.g.db.commit()
        cursore.close()
    
    def n_messaggi(self, proprietario, partecipante):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT COUNT(*)
                            FROM messaggio
                            WHERE proprietario = ? AND partecipante = ? ''', (proprietario, partecipante))
        return cursore.fetchall()
    
    def leggi_notifiche(self, username):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT COUNT(*)
                            FROM messaggio
                            WHERE proprietario = ? AND letto = 0 ''', (username,))
        return cursore.fetchone()[0]
    
    def leggi_profilo(self, username):
        cursore = self.g.db.cursor()
        cursore.execute(''' SELECT username, nome, cognome
                            FROM profilo
                            WHERE username = ? ''', (username,))
        return cursore.fetchone()
    
    def modifica_profilo(self, username, nome, cognome):
        cursore = self.g.db.cursor()
        cursore.execute(''' UPDATE profilo
                            SET nome = ?, cognome = ?
                            WHERE username = ? ''', (nome, cognome, username))
        self.g.db.commit()
        cursore.close()
