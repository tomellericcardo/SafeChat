conversazione = {
    
    init: function() {
        this.accesso_eseguito();
        this.operazioni_iniziali();
        this.init_home();
        this.leggi_messaggi();
        this.richiesta_invio();
        this.init_testo();
    },
    
    accesso_eseguito: function() {
        if (!sessionStorage.length == 0) {
            var username = sessionStorage.getItem('username');
            var password = sessionStorage.getItem('password');
            var richiesta = {username: username, password: password};
            $.ajax({
                url: 'accesso_eseguito',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    if (!risposta.utente_valido) {
                        window.location.href = '/accedi';
                    }
                },
                error: function() {
                    conversazione.errore('Errore del server!');
                }
            });
        }
    },
    
    leggi_parametro: function(parametro) {
        var indirizzo_pagina = decodeURIComponent(window.location.search.substring(1));
        var variabili = indirizzo_pagina.split('&');
        var nome_parametro, i;
        for (i = 0; i < variabili.length; i++) {
            nome_parametro = variabili[i].split('=');
            if (nome_parametro[0] === parametro) {
                return nome_parametro[1] === undefined ? true : nome_parametro[1];
            }
        }
    },
    
    operazioni_iniziali: function() {
        this.proprietario = sessionStorage.getItem('username');
        this.password = sessionStorage.getItem('password');
        this.partecipante = this.leggi_parametro('con');
        this.chiave_privata = cryptico.generateRSAKey(this.password, 1024);
        this.chiave_pubblica = cryptico.publicKeyString(this.chiave_privata);
        this.chiave_destinatario();
        $('#partecipante').html(this.partecipante);
        $('title').html(this.partecipante + ' - SafeChat');
        $('.caricamento').css('display', 'inline');
    },
    
    chiave_destinatario: function() {
        var richiesta = {username: this.partecipante};
        $.ajax({
            url: 'chiave_pubblica',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.chiave_pubblica) {
                    conversazione.chiave_partecipante = risposta.chiave_pubblica;
                }
            },
            error: function() {
                conversazione.errore('Errore del server!');
            }
        });
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    leggi_messaggi: function() {
        var richiesta = {proprietario: this.proprietario,
                         password: this.password,
                         partecipante: this.partecipante};
        $.ajax({
            url: 'leggi_messaggi',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    sessionStorage.setItem('username', '');
                    sessionStorage.setItem('password', '');
                    window.location.href = '/accedi';
                } else if (risposta.messaggi) {
                    var messaggi = [];
                    for (var i = 0; i < risposta.messaggi.length; i++) {
                        var mittente = risposta.messaggi[i][0] == conversazione.proprietario;
                        var testo = cryptico.decrypt(risposta.messaggi[i][1], conversazione.chiave_privata).plaintext;
                        messaggi[i] = {mittente: mittente, testo: testo};
                    }
                    var risultato = {messaggi: messaggi};
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_messaggi').html();
                        $('#messaggi').html(Mustache.render(template, risultato));
                    });
                    $('html, body').animate({scrollTop: $(document).height()}, 'slow');
                }
            },
            error: function() {
                conversazione.errore('Errore del server!');
            }
        });
    },
    
    richiesta_invio: function() {
        $('#invia_messaggio').on('click', function() {
            conversazione.invia_messaggio();
        });
        $('#testo').on('keyup', function(e) {
            if (e.keyCode == 13) {
                conversazione.invia_messaggio();
            }
        });
    },
    
    invia_messaggio: function() {
        var testo = $('#testo').val();
        if (testo.length > 0) {
            var testo_mittente = cryptico.encrypt(testo, conversazione.chiave_pubblica).cipher;
            var testo_destinatario = cryptico.encrypt(testo, conversazione.chiave_partecipante).cipher;
            var richiesta = {mittente: this.proprietario,
                             password: this.password,
                             destinatario: this.partecipante,
                             testo_mittente: testo_mittente,
                             testo_destinatario: testo_destinatario};
            $.ajax({
                url: 'invia_messaggio',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    if (risposta.utente_non_valido) {
                        sessionStorage.setItem('username', '');
                        sessionStorage.setItem('password', '');
                        window.location.href = '/accedi';
                    } else if (risposta.inviato) {
                        $('#testo').val('');
                        conversazione.leggi_messaggi();
                    }
                },
                error: function() {
                    conversazione.errore('Errore del server!');
                }
            });
        }
    },
    
    init_testo: function() {
        $('#testo').on('click', function() {
            $('html, body').animate({scrollTop: $(document).height()}, 'slow');
        });
    },
    
    errore: function(messaggio) {
        $('#messaggi').css('color', 'red');
        $('#messaggi').html('<div class="w3-center"><p>' + messaggio + '</p></div>');
    }
    
};

$(document).ready(conversazione.init());
