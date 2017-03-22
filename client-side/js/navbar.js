navbar = {
    
    init: function() {
        this.init_menu();
        this.disconnetti_utente();
        this.init_notifiche();
    },
    
    init_menu: function() {
        $('#menu, #chiudi_menu').on('click', function() {
            if ($('#sidenav').css('display') == 'none') {
                $('#sidenav').css('display', 'block');
                $('#chiudi_menu').css('display', 'block');
            } else {
                $('#sidenav').css('display', 'none');
                $('#chiudi_menu').css('display', 'none');
            }
        });
    },
    
    disconnetti_utente : function() {
        $('#disconnetti_utente').on('click', function() {
            utente.disconnetti_utente();
        });
    },
    
    init_notifiche: function() {
        $('#notifiche').on('click', function() {
            window.location.href = '/home';
        });
    }
    
};

$(document).ready(navbar.init());
