define(
  ['jquery'],
  function($) {
    return {
      getCalendars: function(username) {
        return $.ajax({
          url: '/nuxeo/api/v1/path/default-domain/UserWorkspaces/' + username + '/.agendas',
          type: 'GET',
          dataType: 'json'
        });
      },
      createEvent: function(calendar, fcEvent) {
        var username = $.cookie("nxuser");
        return $.ajax({
          url: ['/nuxeo/api/v1/path/default-domain/UserWorkspaces/', username, '/.agendas/', calendar].join(''),
          type: 'POST',
          dataType: 'json',
          contentType: "application/json",
          data: JSON.stringify({
            "entity-type": "document",
            "name": fcEvent.title,
            "type": "VEVENT",
            "properties": {
              "dc:title": fcEvent.title,
              "vevent:location": fcEvent.location,
              "vevent:dtstart": fcEvent.start,
              "vevent:dtend": fcEvent.end
            }
          })
        });
      }
    };
  }
);