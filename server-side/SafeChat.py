# -*- coding: utf-8 -*-

from SafeBase import *


class SafeChat:
    
    def __init__(self, g, database_filename):
        self.safe_base = SafeBase(g, database_filename)
    
    def apri_connessione(self):
        self.safe_base.apri_connessione()
    
    def chiudi_connessione(self):
        self.safe_base.chiudi_connessione()
    
    def utente_valido(self, username, password):
        return self.safe_base.utente_valido(username, password)
    
    def username_presente(self, username):
        return self.safe_base.username_presente(username)
    
    def registra_utente(self, username, password, chiave):
        return self.safe_base.registra_utente(username, password, chiave)
