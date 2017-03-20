accedi = {
    
    init: function() {
        this.accesso_eseguito();
        this.richiesta_accesso();
    },
    
    accesso_eseguito: function() {
        if (sessionStorage.length != 0) {
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
                    if (risposta.utente_valido) {
                        window.location.href = '/home';
                    } else {
                        sessionStorage.clear();
                    }
                },
                error: function() {
                    accedi.errore('Errore del server!');
                }
            });
        }
    },
    
    richiesta_accesso: function() {
        $('#connetti_utente').on('click', function() {
            accedi.connetti_utente();
        });
        $('#username, #password').on('keyup', function(e) {
            if (e.keyCode == 13) {
                accedi.connetti_utente();
            }
        });
    },
    
    connetti_utente: function() {
        $('#username, #password').css('border-color', '#757575');
        var username = $('#username').val();
        var password_chiara = $('#password').val();
        if (username.length > 0 && password_chiara.length > 0) {
            $('.caricamento').css('display', 'inline');
            var password = SHA256(password_chiara);
            var richiesta = {username: username, password: password};
            $.ajax({
                url: 'connetti_utente',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('.caricamento').css('display', 'none');
                    if (risposta.utente_valido) {
                        sessionStorage.setItem('username', username.toLowerCase());
                        sessionStorage.setItem('password', password);
                        window.location.href = '/home';
                    } else {
                        $('#username, #password').val('');
                        $('#username, #password').css('border-color', 'red');
                        accedi.errore('Credenziali non valide!');
                    }
                },
                error: function() {
                    $('.caricamento').css('display', 'none');
                    accedi.errore('Errore del server!');
                }
            });
        } else {
            $('#username, #password').css('border-color', 'red');
            accedi.errore('Completa i campi!');
        }
    },
    
    errore: function(messaggio) {
        $('#messaggio').css('color', 'red');
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(accedi.init());
