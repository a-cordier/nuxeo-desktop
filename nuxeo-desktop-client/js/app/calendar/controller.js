define(
  [
    'require',
    'common/model',
    'calendar/model',
    'calendar/view',
    'fullcalendar',
    'jquery',
    'jquery.cookie'
  ],
  function(require, commonModel, model, view, fullcalendar, $) {
    return {
      /* fetch all calendars for the current user */
      loadCalendars: function() {
        var username = $.cookie("nxuser");
        model.calendars = model.calendars || {};
        var promises = [];
        model.getCalendars(username)
          .then(function(content) {
            return commonModel.getChildren(content);
          })
          .then(commonModel.getContent)
          .then(function(content) {
            var children = content.children;
            for (var i in children) {
              var calendar = children[i].title;
              window.console.log(""+i+": "+calendar);

              model.calendars[calendar] = {
                'events': []
              };
              (function(calendar){
	              promises.push(commonModel.getChildrenWithQuery(children[i], {
	                  'docType': 'VEVENT'
	                })
	                .then(model.getContent)
	                .then(function(content) {
	 
	                  var _children = content.entries;
	                  for (var i in _children) {
	                  	window.console.log('calendar: ' + calendar );
	                  	window.console.log(_children[i].title + ' - ' + _children[i].properties['vevent:dtstart']);
	                    require('calendar/model').calendars[calendar]['events'].push({
	                      'title': _children[i].title,
	                      'start': _children[i].properties['vevent:dtstart'],
	                      'end': _children[i].properties['vevent:dtend']
	                    });
						window.console.log(JSON.stringify(require('calendar/model').calendars['Personnal'].events));

	                  }
	                }));
              })(calendar);
            }
            $.when.apply($, promises).done(function() {
              require('calendar/view').calendarWindow({});
            });
          });
      },
      /* Calendars are retrieved in a .agendas hidden folder located in
	/default-domain/UserWorkspaces/${username}/
	If we can't find one for the current user, let's create it 
	By default a calendar called "Personnal" is created for each user
	*/
      initCalendars: function(username) {
        model.getCalendars(username).
        fail(function(result) {
          commonModel.getRoot(username).
          then(function(content) {
            return commonModel.createFolder(content, '.agendas', true);
          }).then(function(content) {
            commonModel.createFolder(content, 'Personnal');
          });
        });
      },
      /* This function returns an object
	that is used to tell FullCalendar how to behave
	and what to display
	*/
      configureFullCalendar: function(wrapper) {
      	console.log(JSON.stringify(model.calendars['Personnal']));
        var config = {
          'events': require('calendar/model').calendars['Personnal'].events,
          dayClick: function(date, jsEvent, cview) {
            // create event addition window
            //    model.createEvent('Personnal', 
            //    	{'start':date.format(),
            //    	'end': date.format(), 
            //    	'title':'baze',
            //    	'location': 'somewhere'
            // 	}
            // );
          },
          dayRender: function(date, element, cview) {
            element.bind('dblclick', function() {
              require('calendar/view').eventWindow({
                "date": date,
                "wrapper": wrapper
              });
            });
          }
        };
        return config;
      },
      saveEvent: function(event) {
        model.createEvent("Personnal", event);
      }
    };
  }
);