utente = {
    
    init: function() {
        utente.leggi_utente();
        utente.accesso_eseguito();
    },
    
    leggi_utente: function() {
        utente.username = sessionStorage.getItem('username');
        utente.password = sessionStorage.getItem('password');
    },
    
    accesso_eseguito: function() {
        if (utente.username && utente.password) {
            var richiesta = {
                username: utente.username,
                password: utente.password
            };
            $.ajax({
                url: 'accesso_eseguito',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    if (!risposta.utente_valido) {
                        sessionStorage.clear();
                        window.location.href = '/accedi';
                    }
                }
            });
        } else {
            window.location.href = '/accedi';
        }
    },
    
    disconnetti_utente : function() {
        sessionStorage.clear();
        window.location.href = '/accedi';
    }
    
};


$(document).ready(utente.init());
