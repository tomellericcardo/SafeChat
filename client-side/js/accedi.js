accedi = {
    
    init: function() {
        this.disconnetti_utente();
        this.richiesta_accesso();
    },
    
    disconnetti_utente: function() {
        localStorage.clear();
        sessionStorage.clear();
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
        var ricordami = $('#ricordami').prop('checked');
        if (username.length > 0 && password_chiara.length > 0) {
            $('.caricamento').css('display', 'inline');
            var password = SHA256(password_chiara);
            var richiesta = {
                username: username,
                password: password
            };
            $.ajax({
                url: 'connetti_utente',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('.caricamento').css('display', 'none');
                    if (risposta.utente_valido) {
                        if (ricordami) {
                            localStorage.setItem('ricordami', 'attivo');
                            localStorage.setItem('username', username.toLowerCase());
                            localStorage.setItem('password', password);
                            window.location.href = '/home';
                        } else {
                            sessionStorage.setItem('username', username.toLowerCase());
                            sessionStorage.setItem('password', password);
                            window.location.href = '/home';
                        }
                    } else {
                        $('#username, #password').val('');
                        $('#username, #password').css('border-color', 'red');
                        errore.messaggio('Credenziali non valide!');
                    }
                },
                error: function() {
                    $('.caricamento').css('display', 'none');
                    errore.messaggio('Errore del server!');
                }
            });
        } else {
            $('#username, #password').css('border-color', 'red');
            errore.messaggio('Completa i campi!');
        }
    }
    
};


$(document).ready(accedi.init());
