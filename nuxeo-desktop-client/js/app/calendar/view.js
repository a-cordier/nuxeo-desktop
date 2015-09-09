define(
  [
    'require',
    'common/view',
    'common/controller',
    'calendar/controller',
    'datetimepicker',
    'jquery-ui',
    'jquery'
  ],
  function(require, commonView, commonController, controller, dateTimePicker, $) {
    return {
      calendarWindow: function(data) {
        if (!data.dialogId) {
          /* make sure dialog id is unique,
      			among other things to allow binding
      to its history */
          var id = commonController.guid();
          while ($('#' + id).length) {
            window.console.log(id + " is allready bound");
            id = commonController.guid();
          }

          commonView.createWindow(function(_data) {
            var id = _data.id;
            var cal = $('<div>');
            cal.attr("id", "#cal-" + id);
            $("#" + id).append(cal);
            var fcConfig = require('calendar/controller').configureFullCalendar(cal);
            window.console.log('events: ' + JSON.stringify(fcConfig.events));
            cal.fullCalendar(fcConfig); // TO DO CUSTOM DISPLAY AND BIND DATA
          }, {
            'id': id
          });
          return id;
        } else {
          commonView.updateWindow(function(_data) {

          }, {
            'dialogId': data.dialogId,
            'content': data.content
          });
          return data.dialogId;
        }
      },
      eventWindow: function(data) {
        /*
        EVENT CONFIGURATION
         IN CASE OF ADDITION DATA SHOULD CONTAIN THE DATE OF THE DAY CLICKED 
         FOR FORM FILLING

         TODO: MAKE CREATE WINDOW RECEIVING SIZE AS PARAMETERS
         (WE WANT A PORTRAIT WINDOW HERE)
         */
        var self = this;
        if (!data.dialogId) {
          /* make sure dialog id is unique,
          among other things to allow binding
          to its history */
          var id = commonController.guid();
          while ($('#' + id).length) {
            window.console.log(id + " is allready bound");
            id = commonController.guid();
          }
          data.id = id;
          commonView.createWindow(function(_data) {
            var id = _data.id;
            var form = $('<form role="form">');
            form.attr("id", "#new-event-" + id);
            self.feedEventForm(form, _data);
            $("#" + id).append(form);
          }, data, {
            width: 320,
            height: 500
          });
          return id;
        } else {
          commonView.updateWindow(function(_data) {

          }, {
            'dialogId': data.dialogId,
            'content': data.content
          });
          return data.dialogId;
        }
      },
      /* to do include window id */
      feedEventForm: function(form, data) {
        var textField = function(id, labelText, placeholder, dftValue) {
          var formElement = $('<div class="form-group">');
          var div = $('<div class="col-md-8">');
          var label = $('<label class="control-label">');
          label.attr('for', id);
          label.text(labelText);
          div.append(label);
          var input = $('<input type="text" class="form-control input-sm">');
          if (placeholder) {
            input.attr('placeholder', placeholder);
          }
          if (dftValue) {
            input.val(dftValue);
          }
          div.append(input);
          div.attr('id', id);
          formElement.append(div);
          return formElement;
        };

        var dateField = function(id, labelText, dateTime) {
          var formElement = $('<div class="form-group">');
          var div = $('<div class="col-md-12 ">');
          var label = $('<label class="control-label">');
          label.attr('for', id);
          label.text(labelText);
          div.append(label);
          var _div = $('<div class="input-group date">');
          div.attr('id', id)
          _div.append('<input type="text" class="form-control" />');
          _div.append('<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>');
          _div.find('input').val(dateTime);
          _div.datetimepicker({
            format: 'LLLL'
          });
          div.append(_div);
          formElement.append(div);
          return formElement;
        };

        var checkBox = function(id, labelText, callback) {
          var formElement = $('<div class="form-group form-inline">');
          var div = $('<div class="col-md-12">');
          var label = $('<label class="control-label">');
          label.attr('for', id);
          label.text(labelText);
          label.css({
            'margin-right': '10px'
          });
          div.append(label);
          var checkbox = $('<input type="checkbox" value="" class="form-control">');
          callback(checkbox);
          div.append(checkbox);
          div.attr('id', id);
          formElement.append(div);
          return formElement;
        };

        var textArea = function(id, labelText, placeholder) {
          var formElement = $('<div class="form-group">');
          var div = $('<div class="col-md-8">');
          var label = $('<label class="control-label">');
          label.attr('for', id);
          label.text(labelText);
          div.append(label);
          div.append($('<textarea class="form-control">'));
          div.attr('id', id);
          formElement.append(div);
          return formElement;
        }

        var btn = function(id, labelText, type, btnClass, callback) {
          // var formElement = $('<div class="form-group">');
          var button = $('<button/>');
          button.addClass('btn');
          button.addClass(btnClass);
          button.attr('type', type);
          button.text(labelText);
          button.attr('id', id);
          // formElement.append(div);
          button.css({
            'margin-top': '10px',
            'margin-left': '15px'
          });
          if (callback) {
            callback(button);
          }
          return button;
        };

        var formElement = textField('event-name-' + data.id, 'Event name:', null, 'untitled-event');
        form.append(formElement);
        formElement = dateField('startDatePicker-' + data.id, 'Event starts:', data.date);
        form.append(formElement);
        formElement = dateField('endDatePicker-' + data.id, 'Event ends:', data.date);
        form.append(formElement);
        formElement = checkBox('allDayCheck-' + data.id, 'All day event  ',
          function(checkbox) {
            checkbox.click(function() {
              if ($(this).is(':checked')) {
                // alert('checked')
                $(this).closest('.form-group').siblings().each(function() {
                  $(this).find('div[id^=endDatePicker-]').hide();
                });
              } else {
                $(this).closest('.form-group').siblings().each(function() {
                  $(this).find('div[id^=endDatePicker-]').show();
                });
              }
            });
          });
        form.append(formElement);
        formElement = textField('event-location-' + data.id, 'Event location:');
        form.append(formElement);
        formElement = textArea('event-description-' + data.id, 'Event description:');
        form.append(formElement);
        var btnBar = $('<div class="inline pull-left">');
        btnBar.append(btn('submit-' + data.id, 'Save', 'button', 'btn-primary', function(button) {
          button.click(function() {
            var form = button.closest('form');
            var evt = {
              'title': form.find('div[id^=event-name]').find('input').val(),
              'start': form.find('div[id^=startDatePicker-]').find('input').val()
            };
            data.wrapper.fullCalendar('renderEvent', evt);
            require('calendar/controller').saveEvent(evt);
            $(this).closest('.dialog_window').dialog('destroy').remove();
          });
        }));
        btnBar.append(btn('cancel-' + data.id, 'Cancel', 'button', 'btn-danger', function(button) {
          button.click(function() {
            $(this).closest('.dialog_window').dialog('destroy').remove();
          });
        }));
        form.append(btnBar);
        // div = $('<div class="col-md-12 ">');
        // div.append($('<label class="control-label" for="event-name">Start date:</label>'));
        // var _div = $('<div class="input-group date">');
        // _div.attr('id', 'startDatePicker-' + data.id)
        // _div.append('<input type="text" class="form-control" />');
        // _div.append('<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>');
        // _div.find('input').val(data.date);
        // div.append(_div);
        // formElement.append(div);
        // form.append(formElement);
        // _div.datetimepicker({format: 'LLLL'});
      }
    };
  }
);