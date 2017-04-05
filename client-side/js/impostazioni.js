impostazioni = {
    
    init: function() {
        this.richiesta_modifica();
        this.conferma_modifica();
        this.chiudi_modifica();
        this.richiesta_elimina();
        this.conferma_elimina();
        this.chiudi_elimina();
    },
    
    richiesta_modifica: function() {
        $('#modifica_password').on('click', function() {
            impostazioni.modifica_password();
        });
        $('#vecchia_password, #nuova_password1, #nuova_password2').on('keyup', function(e) {
            if (e.keyCode == 13) {
                impostazioni.modifica_password();
            }
        });
    },
    
    modifica_password: function() {
        $('#vecchia_password, #nuova_password1, #nuova_password2').css('border-color', '#757575');
        var vecchia_password = $('#vecchia_password').val();
        var nuova_password1 = $('#nuova_password1').val();
        var nuova_password2 = $('#nuova_password2').val();
        if (vecchia_password.length > 0 && nuova_password1.length > 0 && nuova_password2.length > 0) {
            if (nuova_password1.length >= 8) {
                if (nuova_password1 == nuova_password2) {
                    if (nuova_password1 != vecchia_password) {
                        $('#conferma_modifica').css('display', 'block');
                    } else {
                        $('#nuova_password1, #nuova_password2').css('border-color', 'red');
                        $('#nuova_password1, #nuova_password2').val('');
                        errore.messaggio('La nuova password deve essere diversa da quella vecchia!');
                    }
                } else {
                    $('#nuova_password1, #nuova_password2').css('border-color', 'red');
                    $('#nuova_password1, #nuova_password2').val('');
                    errore.messaggio('Le due password non corrispondono!');
                }
            } else {
                $('#nuova_password1, #nuova_password2').css('border-color', 'red');
                $('#nuova_password1, #nuova_password2').val('');
                errore.messaggio('La password deve essere lunga almeno 8 caratteri!');
            }
        } else {
            $('#vecchia_password, #nuova_password1, #nuova_password2').css('border-color', 'red');
            errore.messaggio('Completa tutti i campi!');
        }
    },
    
    conferma_modifica: function() {
        $('#modifica_definitivo').on('click', function() {
            $('#conferma_modifica').css('display', 'none');
            $('#caricamento_modifica').css('display', 'inline');
            var password = SHA256($('#vecchia_password').val());
            var nuova_password = SHA256($('#nuova_password1').val());
            $('#vecchia_password, #nuova_password1, #nuova_password2').val('');
            var chiavi = cryptico.generateRSAKey(nuova_password, 1024);
            var nuova_chiave = cryptico.publicKeyString(chiavi); 
            var richiesta = {
                username: utente.username,
                password: password,
                nuova_password: nuova_password,
                nuova_chiave: nuova_chiave
            };
            $.ajax({
                url: 'modifica_password',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('#caricamento_modifica').css('display', 'none');
                    if (risposta.utente_non_valido) {
                        errore.messaggio('Vecchia password non corretta!');
                    } else if (risposta.modificata) {
                        utente.disconnetti_utente();
                    }
                },
                error: function() {
                    $('#caricamento_modifica').css('display', 'none');
                    errore.messaggio('Errore del server!');
                }
            });
        });
    },
    
    chiudi_modifica: function() {
        $('#chiudi_modifica').on('click', function() {
            $('#vecchia_password, #nuova_password1, #nuova_password2').val('');
            $('#conferma_modifica').css('display', 'none');
        });
    },
    
    richiesta_elimina: function() {
        $('#elimina_account').on('click', function() {
            impostazioni.elimina_account();
        });
        $('#password').on('keyup', function(e) {
            if (e.keyCode == 13) {
                impostazioni.elimina_account();
            }
        });
    },
    
    elimina_account: function() {
        $('#password').css('border-color', '#757575');
        var password = $('#password').val();
        if (password.length > 0) {
            $('#conferma_elimina').css('display', 'block');
        } else {
            $('#password').css('border-color', 'red');
            errore.messaggio('Inserisci la tua password!');
        }
    },
    
    conferma_elimina: function() {
        $('#elimina_definitivo').on('click', function() {
            $('#conferma_elimina').css('display', 'none');
            $('#caricamento_elimina').css('display', 'inline');
            var password = SHA256($('#password').val());
            var richiesta = {
                username: utente.username,
                password: password
            };
            $.ajax({
                url: 'elimina_account',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('#caricamento_elimina').css('display', 'none');
                    if (risposta.utente_non_valido) {
                        errore.messaggio('Vecchia password non corretta!');
                    } else if (risposta.eliminato) {
                        utente.disconnetti_utente();
                    }
                },
                error: function() {
                    $('#caricamento_elimina').css('display', 'none');
                    errore.messaggio('Errore del server!');
                }
            });
        });
    },
    
    chiudi_elimina: function() {
        $('#chiudi_elimina').on('click', function() {
            $('#password').val('');
            $('#conferma_elimina').css('display', 'none');
        });
    }
    
};


$(document).ready(impostazioni.init());
