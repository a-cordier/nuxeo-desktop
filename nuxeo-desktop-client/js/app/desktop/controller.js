define([
    'require',
    'common/model',
    'desktop/model',
    'desktop/view',
    'auth/controller',
    'auth/view',
    'jquery',
    'jquery.cookie'
  ],
  function(require, commonModel, model, view, authController, authView, $) {
    return {
      init: function() {
        require('common/model').cache.init();
        $(document).on('ajaxError', function(event, xhr) {
          if (xhr.status === 401 || xhr.status === 403) {
            window.console.log(xhr.status + ": please log in");
            console.log('1 ##');
            authView.login();
          }
        });
        var nxuser = $.cookie("nxuser");
        if (typeof nxuser !== "undefined") {
          this.initDesktop(nxuser);
        } else {
          view.login();
        }
      },
      initDesktop: function(username) {
        /* get user workspace data from model and ask view to display desktop */
        commonModel.getRoot(username).
        then(function(content) {
          return require('common/model').getChildren(content);
        }).
        then(require('common/model').getContent).
        then(function(content) {
          view.desktop(content);
        });
      }

    };
  });