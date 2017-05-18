scrivi = {
    
    init_richiesta_ricerca: function() {
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
            $.ajax({
                url: 'cerca_utente',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({testo: testo}),
                success: function(risposta) {
                    $('.caricamento').css('display', 'none');
                    if (risposta.risultati) {
                        risposta = scrivi.formatta_risultati(risposta);
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
    
    formatta_risultati: function(risposta) {
        var risultati = risposta.risultati;
        var foto, username, nome, cognome;
        for (var i = 0; i < risultati.length; i++) {
            foto = risultati[i][0];
            username = risultati[i][1];
            nome = risultati[i][2];
            cognome = risultati[i][3];
            risultati[i] = {
                foto: foto,
                username: username,
                nome: nome,
                cognome: cognome
            };
        }
        risposta.risultati = risultati;
        return risposta;
    },
    
    nuova_conversazione: function(destinatario) {
        var mittente = utente.username;
        if (mittente != destinatario) {
            window.location.href = '/conversazione?con=' + destinatario;
        }
    }
    
};


$(document).ready(scrivi.init_richiesta_ricerca());
