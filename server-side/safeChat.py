# -*- coding: utf-8 -*-

from hashlib import sha256
from random import choice
from safeBase import SafeBase


class SafeChat:
    
    def __init__(self, g, database_filename, pepe):
        self.safeBase = SafeBase(g, database_filename)
        self.pepe = pepe
    
    def utente_valido(self, username, password):
        valido = False
        risultato = self.safeBase.leggi_riga('''
            SELECT password, sale
            FROM utente
            WHERE username = ?
        ''', (username,))
        if risultato:
            password_criptata = risultato[0]
            sale = risultato[1]
            valido = password_criptata == sha256(password + sale + self.pepe).hexdigest()
        return valido
    
    def username_presente(self, username):
        risultato = self.safeBase.leggi_dato('''
            SELECT COUNT(*)
            FROM utente
            WHERE username = ?
        ''', (username,))
        presente = risultato == 1
        return presente
    
    def genera_sale(self):
        alfabeto = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        sale = ''
        for i in range(16):
            sale += choice(alfabeto)
        return sale
    
    def registra_utente(self, username, password, chiave):
        sale = self.genera_sale()
        password_criptata = sha256(password + sale + self.pepe).hexdigest()
        self.safeBase.scrivi('''
            INSERT INTO utente
            VALUES (?, ?, ?, ?)
        ''', (username, password_criptata, chiave, sale))
        self.safeBase.scrivi('''
            INSERT INTO profilo
            VALUES (?, '', '', '', '')
        ''', (username,))
    
    def leggi_conversazioni(self, username):
        risultato = self.safeBase.leggi_righe('''
            SELECT u.partecipante, p.foto, u.letto, u.mittente, u.immagine, u.testo, u.data_ora, n.non_letti
            FROM ultimo_messaggio u
            INNER JOIN profilo p
            ON u.partecipante = p.username
            INNER JOIN non_letti n
            ON u.proprietario = n.proprietario
            AND u.partecipante = n.partecipante
            WHERE u.proprietario = ?
            ORDER BY u.data_ora DESC
        ''', (username,))
        return risultato
    
    def elimina_conversazione(self, proprietario, partecipante):
        self.safeBase.scrivi('''
            DELETE FROM messaggio
            WHERE proprietario = ? AND partecipante = ?
        ''', (proprietario, partecipante))
    
    def cerca_utente(self, testo):
        risultato = self.safeBase.leggi_righe('''
            SELECT foto, username, nome, cognome
            FROM profilo
            WHERE LOWER(username || nome || cognome)
            REGEXP ?
        ''', (testo,))
        return risultato
    
    def chiave_pubblica(self, username):
        risultato = self.safeBase.leggi_dato('''
            SELECT chiave
            FROM utente
            WHERE username = ?
        ''', (username,))
        return risultato
    
    def leggi_messaggi(self, proprietario, partecipante):
        risultato = self.safeBase.leggi_righe('''
            SELECT mittente, immagine, testo, DATETIME(data_ora, '+2 hours')
            FROM messaggio
            WHERE proprietario = ? AND partecipante = ?
            ORDER BY data_ora ASC
        ''', (proprietario, partecipante))
        self.safeBase.scrivi('''
            UPDATE messaggio
            SET letto = 1
            WHERE proprietario = ? AND partecipante = ?
        ''', (proprietario, partecipante))
        return risultato
    
    def invia_messaggio(self, mittente, destinatario, testo_mittente, testo_destinatario):
        self.safeBase.scrivi('''
            INSERT INTO messaggio (proprietario, partecipante, mittente, testo, letto)
            VALUES (?, ?, ?, ?, 1)
        ''', (mittente, destinatario, mittente, testo_mittente))
        self.safeBase.scrivi('''
            INSERT INTO messaggio (proprietario, partecipante, mittente, testo)
            VALUES (?, ?, ?, ?)
        ''', (destinatario, mittente, mittente, testo_destinatario))
    
    def invia_immagine(self, mittente, destinatario, immagine_mittente, immagine_destinatario):
        self.safeBase.scrivi('''
            INSERT INTO messaggio (proprietario, partecipante, mittente, immagine, testo, letto)
            VALUES (?, ?, ?, 1, ?, 1)
        ''', (mittente, destinatario, mittente, immagine_mittente))
        self.safeBase.scrivi('''
            INSERT INTO messaggio (proprietario, partecipante, mittente, immagine, testo)
            VALUES (?, ?, ?, 1, ?)
        ''', (destinatario, mittente, mittente, immagine_destinatario))
    
    def n_messaggi(self, proprietario, partecipante):
        risultato = self.safeBase.leggi_righe('''
            SELECT COUNT(*)
            FROM messaggio
            WHERE proprietario = ? AND partecipante = ?
        ''', (proprietario, partecipante))
        return risultato
    
    def leggi_notifiche(self, username):
        risultato = self.safeBase.leggi_dato('''
            SELECT COUNT(*)
            FROM messaggio
            WHERE proprietario = ? AND letto = 0
        ''', (username,))
        return risultato
    
    def leggi_profilo(self, username):
        risultato = self.safeBase.leggi_riga('''
            SELECT foto, nome, cognome, stato
            FROM profilo
            WHERE username = ?
        ''', (username,))
        return risultato
    
    def modifica_profilo(self, username, nome, cognome, stato):
        self.safeBase.scrivi('''
            UPDATE profilo
            SET nome = ?, cognome = ?, stato = ?
            WHERE username = ?
        ''', (nome, cognome, stato, username))
    
    def modifica_foto(self, username, foto):
        self.safeBase.scrivi('''
            UPDATE profilo
            SET foto = ?
            WHERE username = ?
        ''', (foto, username))
    
    def modifica_password(self, username, password, chiave):
        sale = self.genera_sale()
        password_criptata = sha256(password + sale + self.pepe).hexdigest()
        self.safeBase.scrivi('''
            UPDATE utente
            SET password = ?, chiave = ?, sale = ?
            WHERE username = ?
        ''', (password_criptata, chiave, sale, username))
        self.safeBase.scrivi('''
            DELETE FROM messaggio
            WHERE proprietario = ?
        ''', (username,))
    
    def elimina_account(self, username):
        self.safeBase.scrivi('''
            DELETE FROM utente
            WHERE username = ?
        ''', (username,))
        self.safeBase.scrivi('''
            DELETE FROM profilo
            WHERE username = ?
        ''', (username,))
        self.safeBase.scrivi('''
            DELETE FROM messaggio
            WHERE proprietario = ? OR partecipante = ?
        ''', (username, username))
