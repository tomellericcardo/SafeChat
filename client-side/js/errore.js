errore = {
    
    messaggio: function(testo) {
        $('#errore .w3-green').addClass('.w3-red').removeClass('.w3-green');
        $('#messaggio').html(testo);
        $('#errore').css('display', 'block');
    },
    
    successo: function(testo) {
        $('#errore .w3-red').addClass('.w3-green').removeClass('.w3-red');
        $('#messaggio').html(testo);
        $('#errore').css('display', 'block');
    },
    
    chiudi_errore: function() {
        $('#chiudi_errore, #sfondo_errore').on('click', function() {
            $('#errore').css('display', 'none');
        });
    }
    
};


$(document).ready(errore.chiudi_errore());
