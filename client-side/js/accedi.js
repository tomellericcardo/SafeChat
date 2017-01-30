accedi = {
    
    init: function() {
        this.login();
    },
    
    login: function() {
        $('#login').on('click', function() {
            var username = $('#username').val();
            var password = SHA256($('#password').val());
            var richiesta = {username: username, password: password};
            $.ajax({
                url: 'login',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
                error: accedi.errore('Credenziali errate!')
            });
        });
    },
    
    errore: function(messaggio) {
        $('#messaggio').css('color', 'red');
        $('#messaggio').html(messaggio);
    }
    
};

$(document).ready(accedi.init());
