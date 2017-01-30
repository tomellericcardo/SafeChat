# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request
from flask_sslify import SSLify
from SafeChat import *
from json import dumps


# VARIABILI GLOBALI

app = Flask(__name__)
ssLify = SSLify(app)
safeChat = SafeChat(g, 'database.db')


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
def login():
    id_sessione = request.cookies.get('id_sessione')
    if safeChat.sessione_valida(id_sessione):
        return redirect('/home')
    return send_from_directory('../client-side/html/', 'accedi.html')

@app.route('/home')
def home():
    return send_from_directory('../client-side/html/', 'home.html')


# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run()