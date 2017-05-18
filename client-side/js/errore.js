errore = {
    
    messaggio: function(testo) {
        $('#messaggio').html(testo);
        $('#errore').css('display', 'block');
    },
    
    init_chiudi_errore: function() {
        $('#chiudi_errore, #sfondo_errore').on('click', function() {
            $('#errore').css('display', 'none');
        });
    }
    
};


$(document).ready(errore.init_chiudi_errore());
