registrati = {
    
    init: function() {
        this.accesso_eseguito();
        this.richiesta_registrazione();
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
    
    richiesta_registrazione: function() {
        $('#registra_utente').on('click', function() {
            registrati.registra_utente();
        });
        $('#username, #password1, #password2').on('keyup', function(e) {
            if (e.keyCode == 13) {
                registrati.registra_utente();
            }
        });
    },
    
    registra_utente: function() {
        $('#username, #password1, #password2').css('border-color', '#757575');
        var username = $('#username').val();
        var password1 = $('#password1').val();
        var password2 = $('#password2').val();
        if (username.length > 0 && password1.length > 0 && password2.length > 0) {
            if (username.length >= 4) {
                if (password1.length >= 8) {
                    if (password1 == password2) {
                        $('.caricamento').css('display', 'inline');
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
                                $('.caricamento').css('display', 'none');
                                if (risposta.username_presente) {
                                    $('#username').val('');
                                    $('#username').css('border-color', 'red');
                                    registrati.errore('Username gi&agrave; presente nel sistema!');
                                } else if (risposta.utente_registrato) {
                                    sessionStorage.setItem('username', username.toLowerCase());
                                    sessionStorage.setItem('password', password);
                                    window.location.href = '/home';
                                }
                            },
                            error: function() {
                                $('.caricamento').css('display', 'none');
                                registrati.errore('Errore del server!');
                            }
                        });
                    } else {
                        $('#password1, #password2').val('');
                        $('#password1, #password2').css('border-color', 'red');
                        registrati.errore('Le due password non corrispondono!');
                    }
                } else {
                    $('#password1, #password2').val('');
                    $('#password1, #password2').css('border-color', 'red');
                    registrati.errore('La password deve essere lunga almeno 8 caratteri!');
                }
            } else {
                $('#username').val('');
                $('#username').css('border-color', 'red');
                registrati.errore('L\'username deve essere lungo almeno 4 caratteri!');
            }
        } else {
            $('#username, #password1, #password2').css('border-color', 'red');
            registrati.errore('Completa tutti i campi!');
        }
    },
    
    errore: function(messaggio) {
        $('#messaggio').css('color', 'red');
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(registrati.init());
