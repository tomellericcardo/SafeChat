scrivi = {
    
    init: function() {
        this.richiesta_ricerca();
    },
    
    richiesta_ricerca: function() {
        $('#cerca_utente').on('click', function() {
            scrivi.cerca_utente();
        });
        $('#username, #nome, #cognome').on('keyup', function(e) {
            if (e.keyCode == 13) {
                scrivi.cerca_utente();
            }
        });
    },
    
    cerca_utente: function() {
        $('#testo').css('border-color', '#757575');
        var username = $('#username').val();
        var nome = $('#nome').val();
        var cognome = $('#cognome').val();
        if ((username.length > 0) && (nome.length == 0) && (cognome.length > 0)) {
            nome = '.*';
        }
        var testo = username + nome + cognome;
        if (testo.length > 0) {
            $('.caricamento').css('display', 'inline');
            var richiesta = {
                testo: testo
            };
            $.ajax({
                url: 'cerca_utente',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    $('.caricamento').css('display', 'none');
                    if (risposta.risultati) {
                        for (var i = 0; i < risposta.risultati.length; i++) {
                            var foto = risposta.risultati[i][0];
                            var username = risposta.risultati[i][1];
                            var nome = risposta.risultati[i][2];
                            var cognome = risposta.risultati[i][3];
                            risposta.risultati[i] = {
                                foto: foto,
                                username: username,
                                nome: nome,
                                cognome: cognome
                            };
                        }
                        $.get('/html/templates.html', function(contenuto) {
                            var template = $(contenuto).filter('#cerca_utente').html();
                            $('#risultati').html(Mustache.render(template, risposta));
                        });
                    } else {
                        $('#testo').val('');
                        $('#testo').css('border-color', 'red');
                        errore.messaggio('Nessuna corrispondenza trovata!');
                    }
                },
                error: function() {
                    $('.caricamento').css('display', 'none');
                    errore.messaggio('Errore del server!');
                }
            });
        } else {
            $('#testo').css('border-color', 'red');
            errore.messaggio('Inserisci un criterio di ricerca!');
        }
    },
    
    nuova_conversazione: function(destinatario) {
        var mittente = utente.username;
        if (mittente != destinatario) {
            window.location.href = '/conversazione?con=' + destinatario;
        }
    }
    
};


$(document).ready(scrivi.init());
