successo = {
    
    messaggio: function(testo) {
        $('#messaggio_successo').html(testo);
        $('#successo').css('display', 'block');
    },
    
    init_chiudi_successo: function() {
        $('#chiudi_successo, #sfondo_successo').on('click', function() {
            $('#successo').css('display', 'none');
        });
    }
    
};


$(document).ready(successo.init_chiudi_successo());
