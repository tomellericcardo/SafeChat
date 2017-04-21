utente = {
    
    init: function() {
        this.leggi_utente();
        this.accesso_eseguito();
    },
    
    leggi_utente: function() {
        if (localStorage.getItem('ricordami') == 'attivo') {
            this.ricordami = true;
            this.username = localStorage.getItem('username');
            this.password = localStorage.getItem('password');
        } else {
            this.ricordami = false;
            this.username = sessionStorage.getItem('username');
            this.password = sessionStorage.getItem('password');
        }
    },
    
    accesso_eseguito: function() {
        if (this.username && this.password) {
            var richiesta = {
                username: this.username,
                password: this.password
            };
            $.ajax({
                url: 'accesso_eseguito',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                success: function(risposta) {
                    if (!risposta.utente_valido) {
                        localStorage.clear();
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
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/accedi';
    }
    
};


$(document).ready(utente.init());
