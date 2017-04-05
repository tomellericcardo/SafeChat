# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request
from flask_sslify import SSLify
from safeChat import SafeChat
from json import dumps


# VARIABILI GLOBALI

app = Flask(__name__)
ssLify = SSLify(app)
safeChat = SafeChat(g, 'database.db', 'piper_nigrum')


# OPERAZIONI DI SESSIONE

@app.before_request
def apri_connessione():
    safeChat.safeBase.apri_connessione()

@app.teardown_request
def chiudi_connessione(exception):
    safeChat.safeBase.chiudi_connessione()


# INVIO FILES

@app.route('/')
def accedi():
    return send_from_directory('../client-side/html/', 'accedi.html')

@app.route('/<nome_pagina>')
def invia_pagina(nome_pagina):
    return send_from_directory('../client-side/html/', nome_pagina + '.html')

@app.route('/<nome_cartella>/<nome_file>')
def invia_file(nome_cartella, nome_file):
    return send_from_directory('../client-side/' + nome_cartella + '/', nome_file)


# CONTESTI

@app.route('/accesso_eseguito', methods = ['POST'])
@app.route('/connetti_utente', methods = ['POST'])
def utente_valido():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    password = richiesta['password']
    return dumps({'utente_valido': safeChat.utente_valido(username, password)})

@app.route('/registra_utente', methods = ['POST'])
def registra_utente():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    if safeChat.username_presente(username):
        return dumps({'username_presente': True})
    password = richiesta['password']
    chiave = richiesta['chiave']
    safeChat.registra_utente(username, password, chiave)
    return dumps({'utente_registrato': True})

@app.route('/cerca_utente', methods = ['POST'])
def cerca_utente():
    richiesta = request.get_json(force = True)
    testo = richiesta['testo'].lower()
    return dumps({'risultati': safeChat.cerca_utente(testo)})

@app.route('/chiave_pubblica', methods = ['POST'])
def chiave_pubblica():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    return dumps({'chiave_pubblica': safeChat.chiave_pubblica(username)})

@app.route('/leggi_conversazioni', methods = ['POST'])
def leggi_conversazioni():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(username, password):
        return dumps({'utente_non_valido': True})
    return dumps({'conversazioni': safeChat.leggi_conversazioni(username)})

@app.route('/elimina_conversazione', methods = ['POST'])
def elimina_conversazione():
    richiesta = request.get_json(force = True)
    proprietario = richiesta['proprietario'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(proprietario, password):
        return dumps({'utente_non_valido': True})
    partecipante = richiesta['partecipante'].lower()
    safeChat.elimina_conversazione(proprietario, partecipante)
    return dumps({'success': True})

@app.route('/n_conversazioni', methods = ['POST'])
def n_conversazioni():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(username, password):
        return dumps({'utente_non_valido': True})
    return dumps({'n_conversazioni': safeChat.n_conversazioni(username)})

@app.route('/leggi_messaggi', methods = ['POST'])
def leggi_messaggi():
    richiesta = request.get_json(force = True)
    proprietario = richiesta['proprietario'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(proprietario, password):
        return dumps({'utente_non_valido': True})
    partecipante = richiesta['partecipante'].lower()
    return dumps({'messaggi': safeChat.leggi_messaggi(proprietario, partecipante)})

@app.route('/invia_messaggio', methods = ['POST'])
def invia_messaggio():
    richiesta = request.get_json(force = True)
    mittente = richiesta['mittente'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(mittente, password):
        return dumps({'utente_non_valido': True})
    destinatario = richiesta['destinatario'].lower()
    testo_mittente = richiesta['testo_mittente']
    testo_destinatario = richiesta['testo_destinatario']
    safeChat.invia_messaggio(mittente, destinatario, testo_mittente, testo_destinatario)
    return dumps({'inviato': True})

@app.route('/invia_immagine', methods = ['POST'])
def invia_immagine():
    richiesta = request.get_json(force = True)
    mittente = richiesta['mittente'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(mittente, password):
        return dumps({'utente_non_valido': True})
    destinatario = richiesta['destinatario'].lower()
    immagine_mittente = richiesta['immagine_mittente']
    immagine_destinatario = richiesta['immagine_destinatario']
    safeChat.invia_immagine(mittente, destinatario, immagine_mittente, immagine_destinatario)
    return dumps({'inviata': True})

@app.route('/n_messaggi', methods = ['POST'])
def n_messaggi():
    richiesta = request.get_json(force = True)
    proprietario = richiesta['proprietario'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(proprietario, password):
        return dumps({'utente_non_valido': True})
    partecipante = richiesta['partecipante'].lower()
    return dumps({'n_messaggi': safeChat.n_messaggi(proprietario, partecipante)})

@app.route('/leggi_notifiche', methods = ['POST'])
def leggi_notifiche():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(username, password):
        return dumps({'utente_non_valido': True})
    return dumps({'n_notifiche': safeChat.leggi_notifiche(username)})

@app.route('/leggi_profilo', methods = ['POST'])
def leggi_profilo():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(username, password):
        return dumps({'utente_non_valido': True})
    utente = richiesta['utente'].lower()
    return dumps({'profilo': safeChat.leggi_profilo(utente)})

@app.route('/modifica_profilo', methods = ['POST'])
def modifica_profilo():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(username, password):
        return dumps({'utente_non_valido': True})
    nome = richiesta['nome']
    cognome = richiesta['cognome']
    safeChat.modifica_profilo(username, nome, cognome)
    return dumps({'modificato': True})

@app.route('/modifica_password', methods = ['POST'])
def modifica_password():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(username, password):
        return dumps({'utente_non_valido': True})
    nuova_password = richiesta['nuova_password']
    nuova_chiave = richiesta['nuova_chiave']
    safeChat.modifica_password(username, nuova_password, nuova_chiave)
    return dumps({'modificata': True})

@app.route('/elimina_account', methods = ['POST'])
def elimina_account():
    richiesta = request.get_json(force = True)
    username = richiesta['username'].lower()
    password = richiesta['password']
    if not safeChat.utente_valido(username, password):
        return dumps({'utente_non_valido': True})
    safeChat.elimina_account(username)
    return dumps({'eliminato': True})


# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run(threaded = True)
