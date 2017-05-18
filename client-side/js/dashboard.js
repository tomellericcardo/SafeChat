dashboard = {
    
    init: function() {
        dashboard.buttafuori();
        dashboard.init_richiesta_modifica();
        dashboard.init_conferma_modifica();
        dashboard.init_chiudi_modifica();
        dashboard.init_richiesta_elimina();
        dashboard.init_conferma_elimina();
        dashboard.init_chiudi_elimina();
    },
    
    buttafuori: function() {
        if (utente.username != 'admin') {
            window.location.href = '/home';
        }
    },
    
    init_richiesta_modifica: function() {
        $('#modifica_password').on('click', function() {
            dashboard.modifica_password();
        });
        $('#password_admin, #username, #password_utente, #password_utente2').on('keyup', function(e) {
            if (e.keyCode == 13) {
                dashboard.modifica_password();
            }
        });
    },
    
    modifica_password: function() {
        $('#password_admin, #username, #password_utente, #password_utente2').css('border-color', '#757575');
        var password_admin = $('#password_admin').val();
        var username = $('#username').val();
        var password_utente = $('#password_utente').val();
        var password_utente2 = $('#password_utente2').val();
        if (password_admin.length > 0 && username.length > 0 && password_utente.length > 0 && password_utente2.length > 0) {
            if (password_utente.length >= 8) {
                if (password_utente == password_utente2) {
                    $('#nome_utente').html(username);
                    $('#conferma_modifica').css('display', 'block');
                } else {
                    $('#password_utente, #password_utente2').css('border-color', 'red');
                    $('#password_utente, #password_utente2').val('');
                    errore.messaggio('Le due password non corrispondono!');
                }
            } else {
                $('#password_utente, #password_utente2').css('border-color', 'red');
                $('#password_utente, #password_utente2').val('');
                errore.messaggio('La password deve essere lunga almeno 8 caratteri!');
            }
        } else {
            $('#password_admin, #username, #password_utente, #password_utente2').css('border-color', 'red');
            errore.messaggio('Completa tutti i campi!');
        }
    },
    
    init_conferma_modifica: function() {
        $('#modifica_definitivo').on('click', function() {
            $('#conferma_modifica').css('display', 'none');
            $('#caricamento_modifica').css('display', 'inline');
            var password_admin = SHA256($('#password_admin').val());
            var username = $('#username').val();
            var password_utente = SHA256($('#password_utente').val());
            $('#password_admin, #username, #password_utente, #password_utente2').val('');
            var chiavi = cryptico.generateRSAKey(password_utente, 1024);
            var nuova_chiave = cryptico.publicKeyString(chiavi); 
            var richiesta = {
                password_admin: password_admin,
                username: username,
                nuova_password: password_utente,
                nuova_chiave: nuova_chiave
            };
            $.ajax({
                url: 'modifica_password_utente',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('#caricamento_modifica').css('display', 'none');
                    if (risposta.utente_non_valido) {
                        errore.messaggio('Password amministratore non corretta!');
                    } else if (risposta.modificata) {
                        successo.messaggio('Password di <b>' + username + '</b> modificata con successo!');
                    }
                },
                error: function() {
                    $('#caricamento_modifica').css('display', 'none');
                    errore.messaggio('Errore del server!');
                }
            });
        });
    },
    
    init_chiudi_modifica: function() {
        $('#chiudi_modifica, #sfondo_modifica').on('click', function() {
            $('#password_admin, #username, #password_utente, #password_utente2').val('');
            $('#conferma_modifica').css('display', 'none');
        });
    },
    
    init_richiesta_elimina: function() {
        $('#elimina_account').on('click', function() {
            dashboard.elimina_account();
        });
        $('#password_admin2, #username2').on('keyup', function(e) {
            if (e.keyCode == 13) {
                dashboard.elimina_account();
            }
        });
    },
    
    elimina_account: function() {
        $('#password_admin2, #username2').css('border-color', '#757575');
        var password_admin = $('#password_admin2').val();
        var username = $('#username2').val();
        if (password_admin.length > 0 && username.length > 0) {
            $('#nome_utente2').html(username);
            $('#conferma_elimina').css('display', 'block');
        } else {
            $('#password_admin2, #username2').css('border-color', 'red');
            errore.messaggio('Completa tutti i campi!');
        }
    },
    
    init_conferma_elimina: function() {
        $('#elimina_definitivo').on('click', function() {
            $('#conferma_elimina').css('display', 'none');
            $('#caricamento_elimina').css('display', 'inline');
            var password_admin = SHA256($('#password_admin2').val());
            var username = $('#username2').val();
            $('#password_admin2, #username2').val('');
            var richiesta = {
                password_admin: password_admin,
                username: username
            };
            $.ajax({
                url: 'elimina_account_utente',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('#caricamento_elimina').css('display', 'none');
                    if (risposta.utente_non_valido) {
                        errore.messaggio('Password amministratore non corretta!');
                    } else if (risposta.eliminato) {
                        successo.messaggio('Utente <b>' + username + '</b> eliminato con successo!');
                    }
                },
                error: function() {
                    $('#caricamento_elimina').css('display', 'none');
                    errore.messaggio('Errore del server!');
                }
            });
        });
    },
    
    init_chiudi_elimina: function() {
        $('#chiudi_elimina, #sfondo_elimina').on('click', function() {
            $('#password_admin2, #username2').val('');
            $('#conferma_elimina').css('display', 'none');
        });
    }

};


$(document).ready(dashboard.init());
