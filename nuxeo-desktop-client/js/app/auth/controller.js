define(['require', 'auth/model', 'auth/view', 'desktop/controller', 'jquery', 'jquery.cookie'],
  function(require, model, view, desktopController, $) {
    return {
      authenticate: function(username, password) {
        require('auth/model').getSession(username, password).
        then(function(response) {
          require('desktop/controller').initDesktop(username);
          $.cookie("nxuser", username);
        });
      },
      logOut: function() {
        $.removeCookie("nxuser");
        /// ...... to be continued
      }
    };
  });