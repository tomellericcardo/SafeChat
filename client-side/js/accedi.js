accedi = {
    
    init: function() {
        this.accesso_eseguito();
        this.login();
    },
    
    accesso_eseguito: function() {
        var username = sessionStorage.getItem('username');
        var password = sessionStorage.getItem('password');
        var richiesta = {username: username, password: password};
        $.ajax({
            url: 'utente_valido',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_valido) {
                    window.location.href = '/home';
                }
            },
            error: function() {
                accedi.errore('Errore del server!');
            }
        });
    },
    
    login: function() {
        $('#login').on('click', function() {
            var username = $('#username').val();
            var plain_password = $('#password').val();
            if (username.length > 0 || password.length > 0) {
                var password = SHA256(plain_password);
                var richiesta = {username: username, password: password};
                $.ajax({
                    url: 'login',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(richiesta),
                    success: function(risposta) {
                        if (risposta.utente_valido) {
                            sessionStorage.setItem('username', username);
                            sessionStorage.setItem('password', password);
                            window.location.href = '/home';
                        } else {
                            accedi.errore('Credenziali non valide!');
                            $('#username').val('');
                            $('#password').val('');
                        }
                    },
                    error: function() {
                        accedi.errore('Errore del server!');
                    }
                });
            } else {
                accedi.errore('Completa i campi!');
            }
        });
    },
    
    errore: function(messaggio) {
        $('#messaggio').css('color', 'red');
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(accedi.init());
