info = {
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    }
    
};

$(document).ready(info.init_home());
