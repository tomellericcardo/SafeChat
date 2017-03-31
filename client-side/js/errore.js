errore = {
    
    messaggio: function(testo) {
        $('#messaggio').html(testo);
        $('#errore').css('display', 'block');
    },
    
    chiudi_errore: function() {
        $('#chiudi_errore').on('click', function() {
            $('#errore').css('display', 'none');
        });
    }
    
};

$(document).ready(errore.chiudi_errore());
