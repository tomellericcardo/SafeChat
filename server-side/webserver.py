# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request
from flask_sslify import SSLify
from SafeChat import *
from json import dumps


# VARIABILI GLOBALI

WEBSERVER = Flask(__name__)
SSLIFY = SSLify(WEBSERVER)
SAFECHAT = SafeChat(g, 'database.db', WEBSERVER)


# OPERAZIONI DI SESSIONE

@WEBSERVER.before_request
def apri_connessione():
    SAFECHAT.apri_connessione()

@WEBSERVER.teardown_request
def chiudi_connessione(exception):
    SAFECHAT.chiudi_connessione()


# INVIO FILES

@WEBSERVER.route('/<nome_cartella>/<nome_file>')
def invia_file(nome_cartella, nome_file):
    return send_from_directory('../client-side/' + nome_cartella + '/', nome_file)

@WEBSERVER.route('/')
@WEBSERVER.route('/login')
def login():
    return send_from_directory('../client-side/html/', 'login.html')

@WEBSERVER.route('/home')
def home():
    return send_from_directory('../client-side/html/', 'home.html')


# AVVIO DEL SERVER

if __name__ == '__main__':
    WEBSERVER.run()