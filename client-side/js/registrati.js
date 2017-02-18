registrati = {
    
    init: function() {
        this.accesso_eseguito();
        this.signin();
    },
    
    accesso_eseguito: function() {
        if (!sessionStorage.length === 0) {
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
                    }
                },
                error: function() {
                    registrati.errore('Errore del server!');
                }
            });
        }
    },
    
    registra_utente: function() {
        $('#registra_utente').on('click', function() {
            var username = $('#username').val();
            if (username.length >= 4) {
                var password1 = $('#password1').val();
                var password2 = $('#password2').val();
                if (password1.length >= 8) {
                    if (password1 === password2) {
                        var password = SHA256(password1);
                        var chiavi = cryptico.generateRSAKey(password, 1024);
                        var chiave_pubblica = cryptico.publicKeyString(chiavi);     
                        var richiesta = {username: username, password: password, chiave: chiave_pubblica};
                        $.ajax({
                            url: 'registra_utente',
                            method: 'POST',
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(richiesta),
                            success: function(risposta) {
                                if (risposta.username_presente) {
                                    registrati.errore('Username gi&agrave; presente nel sistema!');
                                    $('#username').val('');
                                } else if (risposta.utente_registrato) {
                                    sessionStorage.setItem('username', username);
                                    sessionStorage.setItem('password', password);
                                    window.location.href = '/home';
                                }
                            },
                            error: function() {
                                registrati.errore('Errore del server!');
                            }
                        });
                    } else {
                        registrati.errore('Le due password non corrispondono!');
                        $('#password1').val('');
                        $('#password2').val('');
                    }
                } else {
                    registrati.errore('La password deve essere lunga almeno 8 caratteri!');
                    $('#password1').val('');
                    $('#password2').val('');
                }
            } else {
                registrati.errore('L\'username deve essere lungo almeno 4 caratteri!');
            }
        });
    },
    
    errore: function(messaggio) {
        $('#messaggio').css('color', 'red');
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(registrati.init());
