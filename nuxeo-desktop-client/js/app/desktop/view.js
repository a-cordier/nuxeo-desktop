define(
  [
    'require',
    'explorer/controller',
    'auth/controller',
    'calendar/controller',
    'common/controller',
    'jquery-ui',
    'jquery.modal.min',
    'bootstrap'
  ],
  function(require,
    explorerController,
    authController,
    calendarController,
    commonController,
    $) {
    return {
      login: function() {
        $('#loginButton').click(function(event) {
          authController.authenticate($('input[type="text"]').val(),
            $('input[type="password"]').val());
        });
        $('#loginModal').css({
          'height': $(window).height() * 0.75,
          'top': '25%'
        });
        $('#loginModal').modal({
          'backdrop': false
        });
      },
      /* Once authenticated it all begins with it ... */
      desktop: function(content) {
        var children = content.children;
        if ($('#desktopIcons').length) {
          $('#desktopIcons').remove();
        }
        if ($('#menuItems').find('li').length) {
          $('#menuItems').find('li').remove();
        }
        this.populateMainMenu();
        $('<ul id="desktopIcons"></ul>').appendTo($('#desktop'));
        for (var i in children) {
          var iconPlaceHolder = $('<li></li>').appendTo($('#desktopIcons'));
          if (commonController.isFolderish(children[i])) {
            iconPlaceHolder.append($('<div></div>').addClass('icon-big folder-collapsed-icon'));
            iconPlaceHolder.dblclick({
              doc: children[i],
              init: true
            }, explorerController.openFolder);
          } else {
            iconPlaceHolder.append($('<div></div>').addClass('icon-big file-blank-icon'));
            iconPlaceHolder.dblclick({
              doc: children[i]
            }, explorerController.openFile);

          }
          iconPlaceHolder.append($('<div></div>').addClass('icon-caption').text(commonController.cropTitle(children[i].title)));
          iconPlaceHolder.draggable();
        }
      },
      populateMainMenu: function() {
        $('#menuItems').append('<li id="logOutItem">Log out</li>');
        $('#menuItems').append('<li id="calendar">Calendar</li>');
        $('#logOutItem').click(function() {
          authController.logOut();
        });
        $('#calendar').click(function() {
          calendarController.loadCalendars({});
        });
      }
    };
  });