# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request
from flask_sslify import SSLify
from SafeChat import *
from json import dumps


# VARIABILI GLOBALI

app = Flask(__name__)
ssLify = SSLify(app)
safeChat = SafeChat(g, 'database.db', \
                       'seme', \
                       'piper_nigrum')


# OPERAZIONI DI SESSIONE

@app.before_request
def apri_connessione():
    safeChat.apri_connessione()

@app.teardown_request
def chiudi_connessione(exception):
    safeChat.chiudi_connessione()


# INVIO FILES

@app.route('/<nome_cartella>/<nome_file>')
def invia_file(nome_cartella, nome_file):
    return send_from_directory('../client-side/' + nome_cartella + '/', nome_file)

@app.route('/')
@app.route('/accedi')
def accedi():
    return send_from_directory('../client-side/html/', 'accedi.html')

@app.route('/registrati')
def registrati():
    return send_from_directory('../client-side/html/', 'registrati.html')

@app.route('/home')
def home():
    return send_from_directory('../client-side/html/', 'home.html')


# ALTRI CONTESTI

@app.route('/accesso_eseguito', methods = ['POST'])
@app.route('/connetti_utente', methods = ['POST'])
def utente_valido():
    richiesta = request.get_json(force = True)
    username = richiesta['username']
    password = richiesta['password']
    valido = safeChat.utente_valido(username, password)
    return dumps({'utente_valido': valido})

@app.route('/registra_utente', methods = ['POST'])
def registra_utente():
    richiesta = request.get_json(force = True)
    username = richiesta['username']
    if safeChat.username_presente(username):
        return dumps({'username_presente': True})
    password = richiesta['password']
    chiave = richiesta['chiave']
    safeChat.registra_utente(username, password, chiave)
    return dumps({'utente_registrato': True})


# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run()
