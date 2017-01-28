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