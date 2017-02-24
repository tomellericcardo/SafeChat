home = {
    
    init: function() {
        this.accesso_eseguito();
        this.init_menu();
        this.disconnetti_utente();
        this.leggi_conversazioni();
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
                    accedi.errore('Errore del server!');
                }
            });
        }
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
            sessionStorage.setItem('username', '');
            sessionStorage.setItem('password', '');
            window.location.href = '/accedi';
        });
    },
    
    leggi_conversazioni: function() {
        $('.caricamento').css('display', 'inline');
        var richiesta = {username: sessionStorage.getItem('username'),
                         password: sessionStorage.getItem('password')};
        $.ajax({
            url: 'leggi_conversazioni',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    sessionStorage.setItem('username', '');
                    sessionStorage.setItem('password', '');
                    window.location.href = '/accedi';
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
    
    errore: function(messaggio) {
        $('#conversazioni').css('color', 'red');
        $('#conversazioni').html('<div class="w3-center"><p>' + messaggio + '</p></div>');
    }
    
};

$(document).ready(home.init());
