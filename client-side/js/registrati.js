registrati = {
    
    init: function() {
        this.richiesta_registrazione();
    },
    
    richiesta_registrazione: function() {
        $('#registra_utente').on('click', function() {
            registrati.registra_utente();
        });
        $('#username, #password, #password2').on('keyup', function(e) {
            if (e.keyCode == 13) {
                registrati.registra_utente();
            }
        });
    },
    
    username_valido: function(username) {
        if (!(username.length >= 4 && username.length <= 16)) {
            $('#username').val('');
            $('#username').css('border-color', 'red');
            errore.messaggio('L\'username deve avere dai 4 ai 16 caratteri!');
            return false;
        } else if (!(username.match(/^[a-z0-9]*$/gi))) {
            $('#username').val('');
            $('#username').css('border-color', 'red');
            errore.messaggio('L\'username deve avere solo caratteri alfanumerici!');
            return false;
        } else {
            return true;
        }
    },
    
    password_valida: function(password1, password2, username) {
        if (!(password1.length >= 8)) {
            $('#password, #password2').val('');
            $('#password, #password2').css('border-color', 'red');
            errore.messaggio('La password deve essere lunga almeno 8 caratteri!');
            return false;
        } else if (password1 != password2) {
            $('#password, #password2').val('');
            $('#password, #password2').css('border-color', 'red');
            errore.messaggio('Le due password non corrispondono!');
            return false;
        } else if (password1.toLowerCase() == username.toLowerCase()) {
            $('#password, #password2').val('');
            $('#password, #password2').css('border-color', 'red');
            errore.messaggio('La password non pu&ograve; corrispondere allo username!');
            return false;
        } else {
            return true;
        }
    },
    
    registra_utente: function() {
        $('#username, #password, #password2').css('border-color', '#757575');
        var username = $('#username').val();
        var password1 = $('#password').val();
        var password2 = $('#password2').val();
        if (username.length > 0 && password1.length > 0 && password2.length > 0) {
            if (this.username_valido(username) && this.password_valida(password1, password2, username)) {
                $('.caricamento').css('display', 'inline');
                var password = SHA256(password1);
                var chiavi = cryptico.generateRSAKey(password, 512);
                var chiave_pubblica = cryptico.publicKeyString(chiavi);     
                var richiesta = {
                    username: username,
                    password: password,
                    chiave: chiave_pubblica
                };
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
                            errore.messaggio('Username gi&agrave; presente nel sistema!');
                        } else if (risposta.utente_registrato) {
                            sessionStorage.clear();
                            sessionStorage.setItem('username', username.toLowerCase());
                            sessionStorage.setItem('password', password);
                            window.location.href = '/home';
                        }
                    },
                    error: function() {
                        $('.caricamento').css('display', 'none');
                        errore.messaggio('Errore del server!');
                    }
                });
            }
        } else {
            $('#username, #password, #password2').css('border-color', 'red');
            errore.messaggio('Completa tutti i campi!');
        }
    }
    
};


$(document).ready(registrati.init());
