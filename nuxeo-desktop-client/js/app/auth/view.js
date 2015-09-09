define(['require', 'auth/controller', 'jquery-ui', 'jquery.modal.min', 'bootstrap'],
  function(require, controller, $) {
    return {
      login: function() {
        $('#loginButton').click(function(event) {
          require('auth/controller').authenticate($('input[type="text"]').val(),
            $('input[type="password"]').val());
        });
        $('#loginModal').css({
          'height': $(window).height() * 0.75,
          'top': '25%'
        });
        $('#loginModal').modal({
          'backdrop': false
        });
      }
    };
  });