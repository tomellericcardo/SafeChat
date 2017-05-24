conversazione = {
    
    init: function() {
        conversazione.operazioni_iniziali();
        conversazione.carica_messaggi();
        conversazione.init_richiesta_invio();
        conversazione.init_testo();
        conversazione.init_seleziona_immagine();
        conversazione.init_leggi_immagine();
        conversazione.init_conferma_immagine();
        conversazione.init_chiudi_conferma();
        conversazione.init_chiudi_visualizza();
        setInterval(conversazione.aggiorna_notifiche, 2000);
    },
    
    operazioni_iniziali: function() {
        conversazione.proprietario = utente.username;
        conversazione.password = utente.password;
        conversazione.partecipante = conversazione.leggi_parametro('con');
        if (conversazione.proprietario == conversazione.partecipante || !conversazione.partecipante) {
            window.location.href = '/home';
        } else {
            conversazione.chiave_privata = cryptico.generateRSAKey(conversazione.password, 512);
            conversazione.chiave_pubblica = cryptico.publicKeyString(conversazione.chiave_privata);
            conversazione.leggi_chiave_destinatario();
            $('#partecipante').html(conversazione.partecipante);
            $('title').html(conversazione.partecipante + ' - SafeChat');
            conversazione.init_profilo();
            $('.caricamento').css('display', 'inline');
            conversazione.n_messaggi = 0;
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
    
    leggi_chiave_destinatario: function() {
        var richiesta = {
            username: conversazione.partecipante
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
    
    carica_messaggi: function() {
        var risultato = JSON.parse(sessionStorage.getItem('utente_' + conversazione.partecipante));
        if (risultato) {
            conversazione.n_messaggi = risultato.messaggi.length;
            $.get('/html/templates.html', function(contenuto) {
                var template = $(contenuto).filter('#leggi_messaggi').html();
                $('#messaggi').html(Mustache.render(template, risultato));
                $('html, body').animate({scrollTop: $(document).height()}, 'slow');
            });
            conversazione.aggiorna_messaggi();
        } else {
            conversazione.leggi_messaggi(false);
        }
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
                } else {
                    conversazione.n_notifiche = notifiche.n_notifiche;
                    if (risposta.n_messaggi != conversazione.n_messaggi) {
                        conversazione.leggi_messaggi(true);
                    }
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    leggi_messaggi: function(mostra_caricamento) {
        if (mostra_caricamento) {
            $('#messaggio_caricamento').html('Download messaggi...');
            $('#caricamento').css('display', 'block');
        }
        var richiesta = {
            proprietario: conversazione.proprietario,
            password: conversazione.password,
            partecipante: conversazione.partecipante
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
                    risposta = conversazione.formatta_messaggi(risposta);
                    sessionStorage.setItem('utente_' + conversazione.partecipante, JSON.stringify(risposta));
                    sessionStorage.setItem('nuovi', '1');
                    $('#caricamento').css('display', 'none');
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_messaggi').html();
                        $('#messaggi').html(Mustache.render(template, risposta));
                        $('html, body').animate({scrollTop: $(document).height()}, 'slow');
                    });
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_messaggi: function(risposta) {
        var messaggi = risposta.messaggi;
        var mittente, immagine, testo, data_ora;
        for (var i = 0; i < messaggi.length; i++) {
            mittente = messaggi[i][0] == conversazione.proprietario;
            immagine = messaggi[i][1] == 1;
            testo = conversazione.formatta_testo(messaggi[i][2], immagine);
            data_ora = conversazione.formatta_data(messaggi[i][3]);
            messaggi[i] = {
                mittente: mittente,
                immagine: immagine,
                testo: testo,
                data_ora: data_ora
            };
        }
        conversazione.n_messaggi = messaggi.length;
        risposta.messaggi = messaggi;
        return risposta;
    },
    
    formatta_testo: function(testo, immagine) {
        if (!(testo.match(/^data:image/g))) {
            testo = cryptico.decrypt(testo, conversazione.chiave_privata).plaintext;
        }
        if (!immagine) {
            testo = decodeURIComponent(escape(window.atob(testo)));
        }
        return testo;
    },
    
    formatta_data: function(data_ora) {
        data_ora = data_ora.split(' ');
        var data = data_ora[0].split('-');
        var ora = data_ora[1].split(':');
        data = data[2] + '/' + data[1] + '/' + data[0];
        ora = ora[0] + ':' + ora[1];
        return data + ' alle ' + ora;
    },
    
    init_richiesta_invio: function() {
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
        $('#testo').val('');
        if (testo.length > 0) {
            $('#messaggio_caricamento').html('Invio messaggio...');
            $('#caricamento').css('display', 'block');
            testo = window.btoa(unescape(encodeURIComponent(testo)));
            var testo_mittente = cryptico.encrypt(testo, conversazione.chiave_pubblica).cipher;
            var testo_destinatario = cryptico.encrypt(testo, conversazione.chiave_partecipante).cipher;
            var richiesta = {
                mittente: conversazione.proprietario,
                password: conversazione.password,
                destinatario: conversazione.partecipante,
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
                        conversazione.leggi_messaggi(false);
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
    
    init_seleziona_immagine: function() {
        $('#invia_immagine').on('click', function() {
            $('#immagine').click();
        });
    },
    
    init_leggi_immagine: function() {
        $('#immagine').change(function(evento) {
            var lettore = new FileReader();
            lettore.onload = function(e) {
                $('#valore_immagine').html(e.target.result);
                $('#conferma_immagine').css('display', 'block');
            };
            lettore.readAsDataURL(evento.target.files[0]);
        });
    },
    
    init_conferma_immagine: function() {
        $('#conferma_invio').on('click', function() {
            $('#messaggio_caricamento').html('Invio immagine...');
            $('#caricamento').css('display', 'block');
            $('#conferma_immagine').css('display', 'none');
            var valore_immagine = $('#valore_immagine').html();
            var in_chiaro = $('#in_chiaro').prop('checked');
            conversazione.ridimensiona_invia(valore_immagine, 300, 500, in_chiaro);
        });
    },
    
    ridimensiona_invia: function(sorgente, larghezza_massima, altezza_massima, in_chiaro) {
        var immagine = document.createElement('img');
        var canvas = document.createElement('canvas');
        immagine.onload = function() {
            var contesto = canvas.getContext('2d');
            contesto.drawImage(immagine, 0, 0);
            var larghezza = immagine.width;
            var altezza = immagine.height;
            if (larghezza > altezza) {
                if (larghezza > larghezza_massima) {
                    altezza *= larghezza_massima / larghezza;
                    larghezza = larghezza_massima;
                }
            } else {
                if (altezza > altezza_massima) {
                    larghezza *= altezza_massima / altezza;
                    altezza = altezza_massima;
                }
            }
            canvas.width = larghezza;
            canvas.height = altezza;
            var contesto = canvas.getContext('2d');
            contesto.drawImage(immagine, 0, 0, larghezza, altezza);
            conversazione.invia_immagine(canvas.toDataURL('image/png'), in_chiaro);
        };
        immagine.src = sorgente;
    },
    
    invia_immagine: function(immagine, in_chiaro) {
        var immagine_mittente = immagine;
        var immagine_destinatario = immagine;
        if (!in_chiaro) {
            immagine_mittente = cryptico.encrypt(immagine, conversazione.chiave_pubblica).cipher;
            immagine_destinatario = cryptico.encrypt(immagine, conversazione.chiave_partecipante).cipher;
        }
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
                    conversazione.leggi_messaggi(false);
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    init_chiudi_conferma: function() {
        $('#chiudi_conferma, #sfondo_conferma').on('click', function() {
            $('#conferma_immagine').css('display', 'none');
        });
    },
    
    visualizza_immagine: function(immagine) {
        $('#galleria_immagine').attr('src', $(immagine).attr('src'));
        $('#visualizza_immagine').css('display', 'block');
    },
    
    init_chiudi_visualizza: function() {
        $('#sfondo_visualizza').on('click', function() {
            $('#visualizza_immagine').css('display', 'none');
        });
    },
    
    aggiorna_notifiche: function() {
        if (conversazione.n_notifiche != notifiche.n_notifiche) {
            conversazione.aggiorna_messaggi();
        }
    }
    
};


$(document).ready(conversazione.init());
