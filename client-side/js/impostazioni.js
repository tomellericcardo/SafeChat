impostazioni = {
    
    init: function() {
        this.richiesta_modifica();
        this.conferma_modifica();
        this.chiudi_conferma();
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
        $('#messaggio').html('<br>');
        $('#vecchia_password, #nuova_password1, #nuova_password2').css('border-color', '#757575');
        var vecchia_password = $('#vecchia_password').val();
        var nuova_password1 = $('#nuova_password1').val();
        var nuova_password2 = $('#nuova_password2').val();
        if (vecchia_password.length > 0 && nuova_password1.length > 0 && nuova_password2.length > 0) {
            if (nuova_password1.length >= 8) {
                if (nuova_password1 == nuova_password2) {
                    $('#conferma_modifica').css('display', 'block');
                } else {
                    $('#nuova_password1, #nuova_password2').css('border-color', 'red');
                    $('#nuova_password1, #nuova_password2').val('');
                    impostazioni.errore('Le due password non corrispondono!');
                }
            } else {
                $('#nuova_password1, #nuova_password2').css('border-color', 'red');
                $('#nuova_password1, #nuova_password2').val('');
                impostazioni.errore('La password deve essere lunga almeno 8 caratteri!');
            }
        } else {
            $('#vecchia_password, #nuova_password1, #nuova_password2').css('border-color', 'red');
            impostazioni.errore('Completa tutti i campi!');
        }
    },
    
    conferma_modifica: function() {
        $('#modifica_definitivo').on('click', function() {
            $('#conferma_modifica').css('display', 'none');
            $('.caricamento').css('display', 'inline');
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
                    $('.caricamento').css('display', 'none');
                    if (risposta.modificata) {
                        $('#messaggio').css('color', 'green');
                        $('#messaggio').html('Password modificata!');
                    }
                },
                error: function() {
                    $('.caricamento').css('display', 'none');
                    impostazioni.errore('Errore del server!');
                }
            });
        });
    },
    
    chiudi_conferma: function() {
        $('#chiudi_conferma').on('click', function() {
            $('#vecchia_password, #nuova_password1, #nuova_password2').val('');
            $('#conferma_modifica').css('display', 'none');
        });
    },
    
    errore: function(messaggio) {
        $('#messaggio').css('color', 'red');
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(impostazioni.init());
