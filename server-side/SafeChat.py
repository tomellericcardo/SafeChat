# -*- coding: utf-8 -*-

from SafeBase import *


class SafeChat:
    
    def __init__(self, g, database_filename):
        self.safe_base = SafeBase(g, database_filename)
    
    def open_database_connection(self):
        self.safe_base.open_database_connection()
    
    def close_database_connection(self):
        self.safe_base.close_database_connection()