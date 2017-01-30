# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request, redirect
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


# CONTESTI

@app.route('/<nome_cartella>/<nome_file>')
def invia_file(nome_cartella, nome_file):
    return send_from_directory('../client-side/' + nome_cartella + '/', nome_file)

@app.route('/')
@app.route('/accedi')
def accedi():
    id_sessione = request.cookies.get('id_sessione')
    if safeChat.sessione_valida(id_sessione):
        return redirect('/home')
    return send_from_directory('../client-side/html/', 'accedi.html')

@app.route('/login', methods = ['POST'])
def login():
    richiesta = request.get_json(force = True)
    username = richiesta['username']
    password = richiesta['password']
    if safeChat.utente_valido(username, password):
        risposta = app.make_response(redirect('/home'))
        risposta.set_cookie('id_sessione', value = safeChat.genera_id_sessione(username))
        return risposta
    return dumps({'error': True}), 500

@app.route('/home')
def home():
    id_sessione = request.cookies.get('id_sessione')
    if safeChat.sessione_valida(id_sessione):
        return send_from_directory('../client-side/html/', 'home.html')
    return redirect('/home')


# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run()