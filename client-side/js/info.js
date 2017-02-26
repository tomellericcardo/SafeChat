info = {
    
    init: function() {
        this.accesso_eseguito();
        this.init_home();
    },
    
    accesso_eseguito: function() {
        if (!sessionStorage.length == 0) {
            var username = sessionStorage.getItem('username');
            var password = sessionStorage.getItem('password');
            var richiesta = {username: username, password: password};
            $.ajax({
                url: 'accesso_eseguito',
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
                    info.errore('Errore del server!');
                }
            });
        }
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    errore: function(messaggio) {
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(info.init());
