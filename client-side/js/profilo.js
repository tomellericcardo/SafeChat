profilo = {
    
    init: function() {
        this.leggi_utente();
        this.leggi_profilo();
        this.leggi_immagine();
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
    
    leggi_utente: function() {
        var parametro = this.leggi_parametro('di');
        if (!parametro) {
            this.utente = utente.username;
        } else {
            this.utente = parametro;
        }
    },
    
    leggi_profilo: function() {
        $('.caricamento').css('display', 'inline');
        var richiesta = {
            username: utente.username,
            password: utente.password,
            utente: this.utente
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
                    var foto = risposta.profilo[0];
                    var username = risposta.profilo[1];
                    var nome = risposta.profilo[2];
                    var cognome = risposta.profilo[3];
                    risposta.profilo = {
                        foto: foto,
                        username: username,
                        nome: nome,
                        cognome: cognome
                    };
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_profilo').html();
                        $('#profilo').html(Mustache.render(template, risposta));
                    }).then(function() {
                        if (profilo.utente == utente.username) {
                            $('#modifica_profilo').css('display', 'inline')
                            profilo.modifica_profilo()
                            profilo.richiesta_modifica();
                            profilo.modifica_foto();
                        } else {
                            profilo.visualizza_foto();
                            profilo.chiudi_visualizza();
                        }
                    });
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    modifica_profilo: function() {
        $('#modifica_profilo').on('click', function() {
            $('#modifica_profilo').css('display', 'none');
            $('#conferma_modifiche').css('display', 'inline');
            $('#nome, #cognome').prop('disabled', false);
        });
    },
    
    richiesta_modifica: function() {
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
        $('#nome, #cognome').prop('disabled', true);
        $('#conferma_modifiche').css('display', 'none');
        $('#modifica_profilo').css('display', 'inline');
        var nome = $('#nome').val();
        var cognome = $('#cognome').val();
        var richiesta = {
            username: utente.username,
            password: utente.password,
            nome: nome,
            cognome: cognome
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
    
    modifica_foto: function() {
        $('#modifica_foto').on('click', function() {
            $('#immagine').click();
        });
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
            contesto.globalCompositeOperation = 'destination-in';
            contesto.beginPath();
            contesto.arc(dimensione_canvas / 2, dimensione_canvas / 2, dimensione_canvas / 2, 0, Math.PI * 2);
            contesto.closePath();
            contesto.fill();
            profilo.invia_immagine(canvas.toDataURL('image/png'));
        };
        immagine.src = sorgente;
    },
    
    leggi_immagine: function() {
        $('#immagine').change(function(evento) {
            var lettore = new FileReader();
            lettore.onload = function(e) {
                profilo.ridimensiona_invia(e.target.result, 250);
            };
            lettore.readAsDataURL(evento.target.files[0]);
        });
    },
    
    visualizza_foto: function() {
        $('#foto_profilo').on('click', function() {
            $('#galleria_foto').attr('src', $('#foto_profilo').attr('src'));
            $('#visualizza_foto').css('display', 'block');
        });
    },
    
    chiudi_visualizza: function() {
        $('#visualizza_foto').on('click', function() {
            $('#visualizza_foto').css('display', 'none');
        });
    }
    
};


$(document).ready(profilo.init());
