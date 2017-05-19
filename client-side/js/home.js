home = {
    
    init: function() {
        home.leggi_chiave();
        home.init_scrivi();
        home.leggi_conversazioni();
        home.init_chiudi_elimina();
        home.init_elimina_definitivo();
        setInterval(home.aggiorna_conversazioni, 2000);
    },
    
    leggi_chiave: function() {
        home.chiave_privata = cryptico.generateRSAKey(utente.password, 512);
    },
    
    init_scrivi: function() {
        $('#scrivi').on('click', function() {
            window.location.href = '/scrivi';
        });
    },
    
    leggi_conversazioni: function() {
        home.n_notifiche = notifiche.n_notifiche;
        $('.caricamento').css('display', 'inline');
        var richiesta = {
            username: utente.username,
            password: utente.password
        };
        $.ajax({
            url: 'leggi_conversazioni',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.conversazioni) {
                    risposta = home.elabora_conversazioni(risposta);
                    sessionStorage.setItem('nuovi', '0');
                    if (risposta.conversazioni.length == 0) {
                        $('#conversazioni').css('margin-bottom', '0px');
                    } else {
                        $('#conversazioni').css('margin-bottom', '100px');
                    }
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_conversazioni').html();
                        $('#conversazioni').html(Mustache.render(template, risposta));
                    });
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    elabora_conversazioni: function(risposta) {
        var conversazioni = risposta.conversazioni;
        var partecipante, foto, letto, mittente, immagine, testo, data_ora, non_letti;
        for (var i = 0; i < conversazioni.length; i++) {
            partecipante = conversazioni[i][0];
            foto = conversazioni[i][1];
            letto = conversazioni[i][2] == 1;
            mittente = conversazioni[i][3] == utente.username;
            immagine = conversazioni[i][4] == 1;
            testo = home.formatta_testo(immagine, conversazioni[i][5], mittente, letto);
            data_ora = home.formatta_data(conversazioni[i][6]);
            non_letti = conversazioni[i][7];
            conversazioni[i] = {
                partecipante: partecipante,
                foto: foto,
                testo: testo,
                data_ora: data_ora,
                non_letti: non_letti
            };
        }
        risposta.conversazioni = conversazioni;
        return risposta;
    },
    
    formatta_data: function(data_ora) {
        data_ora = data_ora.split(' ');
        var data = data_ora[0].split('-');
        var ora = data_ora[1].split(':');
        data = data[2] + '/' + data[1] + '/' + data[0];
        ora = ora[0] + ':' + ora[1];
        return data + ' alle ' + ora;
    },
    
    formatta_testo: function(immagine, testo, mittente, letto) {
        if (immagine) {
            testo = '<i id="icona_immagine" class="material-icons">photo_camera</i> Immagine';
        } else {
            testo = cryptico.decrypt(testo, home.chiave_privata).plaintext;
            testo = decodeURIComponent(escape(window.atob(testo)));
            if (testo.length > 20) {
                testo = testo.substring(0, 18) + '...';
            }
        }
        if (mittente) {
            testo = 'Tu: ' + testo;
        } else if (!letto) {
            testo = '<b>' + testo + '</b>';
        }
        return testo;
    },
    
    elimina_conversazione: function(partecipante) {
        $('#partecipante').html(partecipante);
        $('#elimina_conversazione').css('display', 'block');
    },
    
    init_chiudi_elimina: function() {
        $('#chiudi_elimina, #sfondo_elimina').on('click', function() {
            $('#elimina_conversazione').css('display', 'none');
        });
    },
    
    init_elimina_definitivo: function() {
        $('#elimina_definitivo').on('click', function() {
            var partecipante = $('#partecipante').html();
            var richiesta = {
                proprietario: utente.username,
                password: utente.password,
                partecipante: partecipante
           };
            $.ajax({
                url: 'elimina_conversazione',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    if (risposta.utente_non_valido) {
                        utente.disconnetti_utente();
                    } else {
                        $('#elimina_conversazione').css('display', 'none');
                        home.leggi_conversazioni();
                    }
                },
                error: function() {
                    $('#elimina_conversazione').css('display', 'none');
                    errore.messaggio('Errore del server!');
                }
            });
        });
    },
    
    aggiorna_conversazioni: function() {
        var nuovi = sessionStorage.getItem('nuovi') == '1';
        if (home.n_notifiche != notifiche.n_notifiche || nuovi) {
            home.leggi_conversazioni();
        }
    }

};


$(document).ready(home.init());
