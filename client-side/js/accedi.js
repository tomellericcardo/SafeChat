accedi = {
    
    init: function() {
        this.login();
    },
    
    login: function() {
        $('#login').on('click', function() {
            var username = $('#username');
            var password = $('#password');
            var richiesta = {username: username, password: password};
            $.ajax({
                url: 'login',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(richiesta),
            });
        });
    }
    
};

$(document).ready(accedi.init());
