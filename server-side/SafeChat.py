# -*- coding: utf-8 -*-

from SafeBase import *


class SafeChat:
    
    def __init__(self, g, database_filename):
        self.safe_base = SafeBase(g, database_filename)
    
    def apri_connessione(self):
        self.safe_base.apri_connessione()
    
    def chiudi_connessione(self):
        self.safe_base.chiudi_connessione()
    
    def sessione_valida(self, id_sessione):
        return False