notifiche = {
    
    init: function() {
        navigator.serviceWorker.register('/sw.js');
        notifiche.leggi_utente();
        notifiche.leggi_notifiche();
        setInterval(notifiche.leggi_notifiche, 5000);
    },
    
    leggi_utente: function() {
        notifiche.username = sessionStorage.getItem('username');
        notifiche.password = sessionStorage.getItem('password');
        notifiche.n_notifiche = sessionStorage.getItem('n_notifiche');
    },
    
    leggi_notifiche: function() {
        var richiesta = {
            username: notifiche.username,
            password: notifiche.password
        };
        $.ajax({
            url: 'leggi_notifiche',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (!risposta.utente_non_valido && risposta.n_notifiche != notifiche.n_notifiche) {
                    notifiche.n_notifiche = risposta.n_notifiche;
                    sessionStorage.setItem('n_notifiche', notifiche.n_notifiche);
                    if (notifiche.n_notifiche != 0) {
                        $('#notifiche').css('display', 'block');
                        if (notifiche.n_notifiche == 1) {
                            var testo_notifica = 'Hai un nuovo messaggio';
                        } else {
                            var testo_notifica = 'Hai ' + notifiche.n_notifiche + ' nuovi messaggi';
                        }
                        notifiche.mostra_notifica(testo_notifica);
                    } else {
                        $('#notifiche').html('notifications_none');
                    }
                } else if (notifiche.n_notifiche != 0) {
                    $('#notifiche').html('notifications');
                }
            }
        });
    },
    
    mostra_notifica: function(testo_notifica) {
        Notification.requestPermission(function(result) {
            if (result === 'granted') {
                navigator.serviceWorker.ready.then(function(registration) {
                    registration.showNotification('SafeChat', {
                        body: testo_notifica,
                        icon: '/img/icona128.png',
                        vibrate: [200, 100, 200],
                        tag: 'sf'
                    });
                });
            }
        });
    }
    
};


$(document).ready(notifiche.init());
