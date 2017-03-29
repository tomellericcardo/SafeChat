notifiche = {
    
    init: function() {
        this.n_notifiche = sessionStorage.getItem('n_notifiche');
        this.leggi_notifiche();
        setInterval(this.leggi_notifiche, 1000);
    },
    
    leggi_notifiche: function() {
        var richiesta = {
            username: utente.username,
            password: utente.password
        };
        $.ajax({
            url: 'leggi_notifiche',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (risposta.utente_non_valido) {
                    utente.disconnetti_utente();
                } else if (risposta.n_notifiche != notifiche.n_notifiche) {
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
        var opzioni = {
            body: testo_notifica,
            icon: '/img/icona128.png',
            vibrate: [200, 200]
        };
        if (Notification.permission == 'granted') {
            var notifica = new Notification('SafeChat', opzioni);
        } else if (Notification.permission != 'denied') {
            Notification.requestPermission(function (permission) {
                if (permission == 'granted') {
                    var notifica = new Notification('SafeChat', opzioni);
                }
            });
        }
    }
    
};

$(document).ready(notifiche.init());
