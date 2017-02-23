scrivi = {
    
    init: function() {
        this.accesso_eseguito();
        this.menu();
        this.disconnetti_utente();
        this.richiesta_ricerca();
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
                    scrivi.errore('Errore del server!');
                }
            });
        }
    },
    
    menu: function() {
        $('#menu').on('click', function() {
            if ($('#sidenav').css('display') == 'none') {
                $('#sidenav').css('display', 'block');
            } else {
                $('#sidenav').css('display', 'none');
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
    
    richiesta_ricerca: function() {
        $('#cerca_utente').on('click', function() {
            scrivi.cerca_utente();
        });
        $('#username').on('keyup', function(e) {
            if (e.keyCode == 13) {
                scrivi.cerca_utente();
            }
        });
    },
    
    cerca_utente: function() {
        $('#messaggio').html('<br>');
        $('#username').css('border-color', '#757575');
        var username = $('#username').val();
        if (username.length > 0) {
            $('.caricamento').css('display', 'inline');
            var richiesta = {username: username};
            $.ajax({
                url: 'cerca_utente',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('.caricamento').css('display', 'none');
                    if (risposta.risultati) {
                        $.get('/html/templates.html', function(contenuto) {
                            var template = $(contenuto).filter('#cerca_utente').html();
                            $('#risultati').html(Mustache.render(template, risposta));
                        });
                    } else {
                        $('#username').val('');
                        $('#username').css('border-color', 'red');
                        scrivi.errore('Nessuna corrispondenza trovata!');
                    }
                },
                error: function() {
                    $('.caricamento').css('display', 'none');
                    scrivi.errore('Errore del server!');
                }
            });
        } else {
            $('#username').css('border-color', 'red');
            scrivi.errore('Inserisci uno username!');
        }
    },
    
    crea_conversazione: function(destinatario) {
        var mittente = sessionStorage.getItem('username');
        if (mittente != destinatario) {
            $('.caricamento').css('display', 'inline');
            var richiesta = {mittente: mittente, destinatario: destinatario};
            $.ajax({
                url: 'crea_conversazione',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('.caricamento').css('display', 'none');
                    window.location.href = '/conversazione?utente=' + destinatario;
                },
                error: function() {
                    $('.caricamento').css('display', 'none');
                    scrivi.errore('Errore del server!');
                }
            });
        } else {
            scrivi.errore('Vuoi parlare da solo?');
        }
    },
    
    errore: function(messaggio) {
        $('#messaggio').css('color', 'red');
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(scrivi.init());
