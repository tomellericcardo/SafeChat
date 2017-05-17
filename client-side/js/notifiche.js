notifiche = {
    
    init: function() {
        navigator.serviceWorker.register('/sw.js');
        this.leggi_utente();
        this.leggi_notifiche();
        setInterval(this.leggi_notifiche, 2000);
    },
    
    leggi_utente: function() {
        this.username = sessionStorage.getItem('username');
        this.password = sessionStorage.getItem('password');
        this.n_notifiche = sessionStorage.getItem('n_notifiche');
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
                if (risposta.n_notifiche != notifiche.n_notifiche) {
                    notifiche.n_notifiche = risposta.n_notifiche;
                    sessionStorage.setItem('n_notifiche', notifiche.n_notifiche);
                    if (notifiche.n_notifiche != 0) {
                        $('#notifiche').css('display', 'block');
                        if (notifiche.n_notifiche == 1) {
                            var testo_notifica = 'Hai un nuovo messaggio';
                        } else {
                            var testo_notifica = 'Hai ' + notifiche.n_notifiche + ' nuovi messaggi';
                        }
                        notifiche.notifica(testo_notifica);
                    } else {
                        $('#notifiche').html('notifications_none');
                    }
                } else if (notifiche.n_notifiche != 0) {
                    $('#notifiche').html('notifications');
                }
            }
        });
    },
    
    notifica: function(testo_notifica) {
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
