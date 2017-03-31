profilo = {
    
    init: function() {
        this.leggi_utente();
        this.leggi_profilo();
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
    
    leggi_utente: function() {
        var parametro = this.leggi_parametro('di');
        if (!parametro) {
            this.utente = utente.username;
        } else {
            this.utente = parametro;
        }
    },
    
    leggi_profilo: function() {
        $('.caricamento').css('display', 'inline');
        var richiesta = {
            username: utente.username,
            password: utente.password,
            utente: this.utente
        };
        $.ajax({
            url: 'leggi_profilo',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.profilo) {
                    var username = risposta.profilo[0];
                    var nome = risposta.profilo[1];
                    var cognome = risposta.profilo[2];
                    risposta.profilo = {
                        username: username,
                        nome: nome,
                        cognome: cognome
                    };
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_profilo').html();
                        $('#profilo').html(Mustache.render(template, risposta));
                    }).then(function() {
                        if (profilo.utente == utente.username) {
                            $('#modifica_profilo').css('display', 'inline')
                            profilo.modifica_profilo()
                            profilo.richiesta_modifica();
                        }
                    });
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    modifica_profilo: function() {
        $('#modifica_profilo').on('click', function() {
            $('#modifica_profilo').css('display', 'none');
            $('#conferma_modifica').css('display', 'inline');
            $('#nome, #cognome').prop('disabled', false);
        });
    },
    
    richiesta_modifica: function() {
        $('#conferma_modifica').on('click', function() {
            profilo.conferma_modifica();
        });
        $('#nome, #cognome').on('keyup', function(e) {
            if (e.keyCode == 13) {
                profilo.conferma_modifica();
            }
        });
    },
    
    conferma_modifica: function() {
        $('#nome, #cognome').prop('disabled', true);
        $('#conferma_modifica').css('display', 'none');
        $('#modifica_profilo').css('display', 'inline');
        var nome = $('#nome').val();
        var cognome = $('#cognome').val();
        var richiesta = {
            username: utente.username,
            password: utente.password,
            nome: nome,
            cognome: cognome
        };
        $.ajax({
            url: 'modifica_profilo',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.modificato) {
                    profilo.leggi_profilo();
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    }
    
};

$(document).ready(profilo.init());
