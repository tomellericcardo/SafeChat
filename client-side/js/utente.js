utente = {
    
    username: sessionStorage.getItem('username'),
    password: sessionStorage.getItem('password'),
    
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


$(document).ready(utente.accesso_eseguito());
