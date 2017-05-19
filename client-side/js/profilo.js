profilo = {
    
    init: function() {
        profilo.leggi_utente();
        profilo.leggi_profilo();
        profilo.init_leggi_immagine();
    },
    
    leggi_utente: function() {
        var parametro = profilo.leggi_parametro('di');
        if (!parametro) {
            profilo.utente = utente.username;
        } else {
            profilo.utente = parametro;
        }
        $('#utente').html(profilo.utente);
        $('title').html(profilo.utente + ' - SafeChat');
    },
    
    leggi_parametro: function(parametro) {
        var indirizzo_pagina = decodeURIComponent(window.location.search.substring(1));
        var variabili = indirizzo_pagina.split('&');
        var nome_parametro, i;
        for (i = 0; i < variabili.length; i++) {
            nome_parametro = variabili[i].split('=');
            if (nome_parametro[0] === parametro) {
                return nome_parametro[1] === undefined ? true : nome_parametro[1];
            }
        }
    },
    
    leggi_profilo: function() {
        $('.caricamento').css('display', 'inline');
        var richiesta = {
            username: utente.username,
            password: utente.password,
            utente: profilo.utente
        };
        $.ajax({
            url: 'leggi_profilo',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.profilo) {
                    risposta = profilo.formatta_profilo(risposta);
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_profilo').html();
                        $('#profilo').html(Mustache.render(template, risposta));
                        $('#caricamento').css('display', 'none');
                        $('#modifica_profilo, #conferma_modifiche').css('bottom', '20px');
                    }).then(function() {
                        if (profilo.utente == utente.username) {
                            $('#modifica_profilo').css('display', 'block')
                            profilo.init_modifica_profilo()
                            profilo.init_richiesta_modifica();
                            profilo.init_modifica_foto();
                        } else {
                            profilo.init_visualizza_foto();
                            profilo.init_chiudi_visualizza();
                        }
                    });
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_profilo: function(risposta) {
        var profilo = risposta.profilo;
        var foto = profilo[0];
        var nome = profilo[1];
        var cognome = profilo[2];
        var stato = profilo[3];
        risposta.profilo = {
            foto: foto,
            nome: nome,
            cognome: cognome,
            stato: stato
        };
        return risposta;
    },
    
    init_modifica_profilo: function() {
        $('#modifica_profilo').on('click', function() {
            $('#modifica_profilo').css('display', 'none');
            $('#conferma_modifiche').css('display', 'block');
            $('#nome, #cognome, #stato').prop('disabled', false);
        });
    },
    
    init_richiesta_modifica: function() {
        $('#conferma_modifiche').on('click', function() {
            profilo.conferma_modifiche();
        });
        $('#nome, #cognome').on('keyup', function(e) {
            if (e.keyCode == 13) {
                profilo.conferma_modifiche();
            }
        });
    },
    
    conferma_modifiche: function() {
        $('#nome, #cognome, #stato').prop('disabled', true);
        $('#conferma_modifiche').css('display', 'none');
        $('#modifica_profilo').css('display', 'block');
        var nome = $('#nome').val();
        var cognome = $('#cognome').val();
        var stato = $('#stato').val();
        var richiesta = {
            username: utente.username,
            password: utente.password,
            nome: nome,
            cognome: cognome,
            stato: stato
        };
        $.ajax({
            url: 'modifica_profilo',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.modificato) {
                    profilo.leggi_profilo();
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    init_modifica_foto: function() {
        $('#modifica_foto').on('click', function() {
            $('#immagine').click();
        });
    },
    
    init_leggi_immagine: function() {
        $('#immagine').change(function(evento) {
            var lettore = new FileReader();
            lettore.onload = function(e) {
                $('#caricamento').css('display', 'block');
                $('#modifica_profilo, #conferma_modifiche').css('bottom', '65px');
                profilo.ridimensiona_invia(e.target.result, 250);
            };
            lettore.readAsDataURL(evento.target.files[0]);
        });
    },
    
    ridimensiona_invia: function(sorgente, dimensione_massima) {
        var immagine = document.createElement('img');
        var canvas = document.createElement('canvas');
        immagine.onload = function() {
            var larghezza_immagine = immagine.width;
            var altezza_immagine = immagine.height;
            var dimensione_canvas = dimensione_massima;
            var dimensione_taglio = 0;
            if (larghezza_immagine >= altezza_immagine) {
                if (altezza_immagine < dimensione_massima) {
                    dimensione_canvas = altezza_immagine;
                }
                dimensione_taglio = altezza_immagine;
            } else if (altezza_immagine > larghezza_immagine) {
                if (larghezza_immagine < dimensione_massima) {
                    dimensione_canvas = larghezza_immagine;
                }
                dimensione_taglio = larghezza_immagine;
            }
            canvas.width = dimensione_canvas;
            canvas.height = dimensione_canvas;
            var contesto = canvas.getContext('2d');
            contesto.drawImage(immagine, 0, 0, dimensione_taglio, dimensione_taglio, 0, 0, dimensione_canvas, dimensione_canvas);
            profilo.invia_immagine(canvas.toDataURL('image/png'));
        };
        immagine.src = sorgente;
    },
    
    invia_immagine: function(immagine) {
        var richiesta = {
            username: utente.username,
            password: utente.password,
            foto: immagine
        };
        $.ajax({
            url: 'modifica_foto',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.modificata) {
                    profilo.leggi_profilo();
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    init_visualizza_foto: function() {
        $('#foto_profilo').on('click', function() {
            $('#galleria_foto').attr('src', $('#foto_profilo').attr('src'));
            $('#visualizza_foto').css('display', 'block');
        });
    },
    
    init_chiudi_visualizza: function() {
        $('#sfondo_visualizza').on('click', function() {
            $('#visualizza_foto').css('display', 'none');
        });
    }
    
};


$(document).ready(profilo.init());
