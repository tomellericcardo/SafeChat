conversazione = {
    
    init: function() {
        this.operazioni_iniziali();
        if (this.partecipante) {
            this.leggi_messaggi();
            this.richiesta_invio();
            this.init_testo();
            this.seleziona_immagine();
            this.invia_immagine();
            this.chiudi_visualizza();
            setInterval(this.aggiorna_messaggi, 1000);
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
        this.proprietario = utente.username;
        this.password = utente.password;
        this.partecipante = this.leggi_parametro('con');
        if (this.proprietario == this.partecipante || !this.partecipante) {
            window.location.href = '/home';
        } else {
            this.chiave_privata = cryptico.generateRSAKey(this.password, 1024);
            this.chiave_pubblica = cryptico.publicKeyString(this.chiave_privata);
            this.chiave_destinatario();
            $('#partecipante').html(this.partecipante);
            $('title').html(this.partecipante + ' - SafeChat');
            this.init_profilo();
            $('.caricamento').css('display', 'inline');
            this.n_messaggi = 0;
        }
    },
    
    chiave_destinatario: function() {
        var richiesta = {
            username: this.partecipante
        };
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
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    init_profilo: function() {
        $('#partecipante').on('click', function() {
            window.location.href = '/profilo?di=' + conversazione.partecipante;
        });
    },
    
    leggi_messaggi: function() {
        var richiesta = {
            proprietario: this.proprietario,
            password: this.password,
            partecipante: this.partecipante
        };
        $.ajax({
            url: 'leggi_messaggi',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.messaggi) {
                    var messaggi = [];
                    for (var i = 0; i < risposta.messaggi.length; i++) {
                        var mittente = risposta.messaggi[i][0] == conversazione.proprietario;
                        var immagine = risposta.messaggi[i][1] == 1;
                        var testo = cryptico.decrypt(risposta.messaggi[i][2], conversazione.chiave_privata).plaintext;
                        if (!immagine) {
                            testo = decodeURIComponent(escape(window.atob(testo)));
                        }
                        messaggi[i] = {
                            mittente: mittente,
                            immagine: immagine,
                            testo: testo
                        };
                    }
                    conversazione.n_messaggi = messaggi.length;
                    var risultato = {
                        messaggi: messaggi
                    };
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_messaggi').html();
                        $('#messaggi').html(Mustache.render(template, risultato));
                    });
                    $('html, body').animate({scrollTop: $(document).height()}, 'slow');
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
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
    
    invia_messaggio: function(testo) {
        var testo = $('#testo').val();
        $('#testo').val('');
        if (testo.length > 0) {
            testo = window.btoa(unescape(encodeURIComponent(testo)));
            var testo_mittente = cryptico.encrypt(testo, conversazione.chiave_pubblica).cipher;
            var testo_destinatario = cryptico.encrypt(testo, conversazione.chiave_partecipante).cipher;
            var richiesta = {
                mittente: this.proprietario,
                password: this.password,
                destinatario: this.partecipante,
                testo_mittente: testo_mittente,
                testo_destinatario: testo_destinatario
            };
            $.ajax({
                url: 'invia_messaggio',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    if (risposta.utente_non_valido) {
                        utente.disconnetti_utente();
                    } else if (risposta.inviato) {
                        conversazione.leggi_messaggi();
                    }
                },
                error: function() {
                    errore.messaggio('Errore del server!');
                }
            });
        }
    },
    
    init_testo: function() {
        $('#testo').on('click', function() {
            $('html, body').animate({scrollTop: $(document).height()}, 'slow');
        });
    },
    
    aggiorna_messaggi: function() {
        var richiesta = {
            proprietario: conversazione.proprietario,
            password: conversazione.password,
            partecipante: conversazione.partecipante
        };
        $.ajax({
            url: 'n_messaggi',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.n_messaggi != conversazione.n_messaggi) {
                    conversazione.leggi_messaggi();
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    seleziona_immagine: function() {
        $('#invia_immagine').on('click', function() {
            $('#immagine').click();
        });
    },
    
    invia_immagine: function() {
        $('#immagine').change(function(evento) {
            var lettore = new FileReader();
            lettore.onload = function(e) {
                var immagine = e.target.result;
                var immagine_mittente = cryptico.encrypt(immagine, conversazione.chiave_pubblica).cipher;
                var immagine_destinatario = cryptico.encrypt(immagine, conversazione.chiave_partecipante).cipher;
                var richiesta = {
                    mittente: conversazione.proprietario,
                    password: conversazione.password,
                    destinatario: conversazione.partecipante,
                    immagine_mittente: immagine_mittente,
                    immagine_destinatario: immagine_destinatario
                };
                $.ajax({
                    url: 'invia_immagine',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(richiesta),
                    success: function(risposta) {
                        if (risposta.utente_non_valido) {
                            utente.disconnetti_utente();
                        } else if (risposta.inviata) {
                            conversazione.leggi_messaggi();
                        }
                    },
                    error: function() {
                        errore.messaggio('Errore del server!');
                    }
                });
            };
            lettore.readAsDataURL(evento.target.files[0]);
        });
    },
    
    visualizza_immagine: function(immagine) {
        $('#galleria_immagine').attr('src', $(immagine).attr('src'));
        $('#visualizza_immagine').css('display', 'block');
    },
    
    chiudi_visualizza: function() {
        $('#visualizza_immagine').on('click', function() {
            $('#visualizza_immagine').css('display', 'none');
        });
    }
    
};


$(document).ready(conversazione.init());
