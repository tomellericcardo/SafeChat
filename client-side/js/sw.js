self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.matchAll({
        type: 'window'
    }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if ('focus' in client) {
                return client.focus();
            }
        }
    }));
});

/*
self.addEventListener('periodicSync', function(event) {
    event.waitUntil(function() {
        var richiesta = new FormData();
        richiesta.append('json', event.tag);
        fetch('/leggi_notifiche', {
            method: 'POST',
            body: richiesta
        }).then(function(risposta) {
            return risposta.json();
        }).then(function(risposta) {
            if (risposta.n_notifiche != 0) {
                if (risposta.n_notifiche == 1) {
                    var testo_notifica = 'Hai un nuovo messaggio';
                } else {
                    var testo_notifica = 'Hai ' + risposta.n_notifiche + ' nuovi messaggi';
                }
                self.registration.showNotification('SafeChat', {
                    body: testo_notifica,
                    icon: '/img/icona128.png',
                    vibrate: [200, 100, 200],
                    tag: 'sf'
                });
            }
        });
    });
});
*/
