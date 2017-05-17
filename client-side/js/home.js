home = {
    
    init: function() {
        this.chiave_privata = cryptico.generateRSAKey(utente.password, 512);
        this.scrivi();
        this.leggi_conversazioni();
        this.chiudi_elimina();
        this.elimina_definitivo();
        setInterval(this.leggi_conversazioni, 5000);
    },
    
    scrivi: function() {
        $('#scrivi').on('click', function() {
            window.location.href = '/scrivi';
        });
    },
    
    leggi_conversazioni: function() {
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
                    for (var i = 0; i < risposta.conversazioni.length; i++) {
                        var partecipante = risposta.conversazioni[i][0];
                        var foto = risposta.conversazioni[i][1];
                        var letto = risposta.conversazioni[i][2] == 1;
                        var mittente = risposta.conversazioni[i][3] == utente.username;
                        var immagine = risposta.conversazioni[i][4] == 1;
                        var testo = risposta.conversazioni[i][5];
                        var non_letti = risposta.conversazioni[i][6];
                        if (immagine) {
                            testo = '<i id="icona_immagine" class="material-icons">photo_camera</i> Immagine';
                        } else {
                            testo = cryptico.decrypt(
                                testo,
                                home.chiave_privata
                            ).plaintext;
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
                        risposta.conversazioni[i] = {
                            partecipante: partecipante,
                            foto: foto,
                            testo: testo,
                            non_letti: non_letti
                        };
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
    
    elimina_conversazione: function(partecipante) {
        $('#partecipante').html(partecipante);
        $('#elimina_conversazione').css('display', 'block');
    },
    
    chiudi_elimina: function() {
        $('#chiudi_elimina, #sfondo_elimina').on('click', function() {
            $('#elimina_conversazione').css('display', 'none');
        });
    },
    
    elimina_definitivo: function() {
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
                        errore.successo('Conversazione con <b>' + partecipante + '</b> eliminata con successo!');
                        home.leggi_conversazioni();
                    }
                },
                error: function() {
                    $('#elimina_conversazione').css('display', 'none');
                    errore.messaggio('Errore del server!');
                }
            });
        });
    }
    
};


$(document).ready(home.init());
