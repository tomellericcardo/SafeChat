home = {
    
    init: function() {
        this.accesso_eseguito();
        this.init_menu();
        this.disconnetti_utente();
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
                    accedi.errore('Errore del server!');
                }
            });
        }
    },
    
    init_menu: function() {
        $('#menu').on('click', function() {
            if ($('#sidenav').css('display') == 'none') {
                $('#sidenav').css('display', 'block');
            } else {
                $('#sidenav').css('display', 'none');
            }
        });
    },
    
    disconnetti_utente : function() {
        $('#disconnetti_utente').on('click', function() {
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
