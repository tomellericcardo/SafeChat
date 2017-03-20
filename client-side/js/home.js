home = {
    
    init: function() {
        this.init_menu();
        this.disconnetti_utente();
        this.leggi_conversazioni();
        this.chiudi_elimina();
        this.elimina_definitivo();
        setInterval(this.leggi_conversazioni, 5000);
    },
    
    init_menu: function() {
        $('#menu, #chiudi_menu').on('click', function() {
            if ($('#sidenav').css('display') == 'none') {
                $('#sidenav').css('display', 'block');
                $('#chiudi_menu').css('display', 'block');
            } else {
                $('#sidenav').css('display', 'none');
                $('#chiudi_menu').css('display', 'none');
            }
        });
    },
    
    disconnetti_utente : function() {
        $('#disconnetti_utente').on('click', function() {
            utente.disconnetti_utente();
        });
    },
    
    leggi_conversazioni: function() {
        $('.caricamento').css('display', 'inline');
        var richiesta = {username: utente.username,
                         password: utente.password};
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
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_conversazioni').html();
                        $('#conversazioni').html(Mustache.render(template, risposta));
                    });
                }
            },
            error: function() {
                home.errore('Errore del server!');
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
            var richiesta = {proprietario: utente.username,
                             password: utente.password,
                             partecipante: partecipante};
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
                    home.errore('Errore del server!');
                }
            });
        });
    },
    
    errore: function(messaggio) {
        $('#conversazioni').css('color', 'red');
        $('#conversazioni').html('<div class="w3-center"><p>' + messaggio + '</p></div>');
    }
    
};

$(document).ready(home.init());
