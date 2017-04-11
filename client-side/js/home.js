home = {
    
    init: function() {
        this.scrivi_nuovo();
        this.leggi_conversazioni();
        this.chiudi_elimina();
        this.elimina_definitivo();
        setInterval(this.leggi_conversazioni, 1000);
    },
    
    scrivi_nuovo: function() {
        $('#nuovo').on('click', function() {
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
                        var non_letti = risposta.conversazioni[i][2];
                        risposta.conversazioni[i] = {
                            partecipante: partecipante,
                            foto: foto,
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
        $('#chiudi_elimina').on('click', function() {
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
