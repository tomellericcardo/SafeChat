home = {
    
    init: function() {
        this.accesso_eseguito();
        this.logout();
    },
    
    accesso_eseguito: function() {
        var username = sessionStorage.getItem('username');
        var password = sessionStorage.getItem('password');
        var richiesta = {username: username, password: password};
        $.ajax({
            url: 'utente_valido',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(richiesta),
            success: function(risposta) {
                if (!risposta.utente_valido) {
                    window.location.href = '/accedi';
                }
            },
            error: function() {
                accedi.errore('Errore del server!');
            }
        });
    },
    
    logout : function() {
        $('#logout').on('click', function() {
            sessionStorage.setItem('username', '');
            sessionStorage.setItem('password', '');
            window.location.href = '/accedi';
        });
    },
    
    errore: function(messaggio) {
        $('#messaggio').css('color', 'red');
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(home.init());
