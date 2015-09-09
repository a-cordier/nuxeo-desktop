define(
  [
    'common/model',
    'common/controller',
    'jquery',
    'jquery.dialogExtend'
  ],
  function(commonModel, commonController, $) {
    return {
      /* Every window is built based on this function
      A callback function should handle window content presentation*/
      createWindow: function(callback, data, options) {
        var id = data.id;
        $('body').append(
          $('<div>').attr('title', data.title).attr('id', id).addClass('dialog_window'));
        callback(data);
        var width = (options && options.width) || 520,
          height = (options && options.height) || 375;
        $('#' + id).dialog({
          'width': width,
          'height': height,
          close: function(event, ui) {
            $(this).dialog('destroy').remove();
            if (commonModel.cache.get(id)) {
              commonModel.cache.delete(id);
            }
          }
        }).
        dialogExtend({
          'closable': true,
          'maximizable': true, // enable/disable maximize button
          'minimizable': false, // enable/disable minimize button
          'collapsable': true, // enable/disable collapse button
          'dblclick': 'collapse', // set action on double click.
          "icons": {
            "close": "close custom",
            "maximize": "plus custom",
            "collapse": "minus custom",
            "restore": "plus custom"
          },
          'events': {
            "load": function(event, dialog) {

            }
          }
        });
        $('a').removeClass('ui-state-default');
        $('.ui-dialog-titlebar-close,.close').css({
          'opacity': 1,
          'margin-top': 0
        });
        $('.ui-dialog-titlebar').addClass('custom');
        /* Overriding the collapse button behavior to implement 
        a "send to tray" functionality*/
        $('#' + id).siblings('.ui-dialog-titlebar').find('a[title="collapse"]').off().click({
          dialog: $('#' + id)
        }, function(event) {
          var dialog = event.data.dialog;
          var widget = event.data.dialog.parents('.ui-widget');
          var dialogId = event.data.dialog.attr('id');
          var properties = {
            width: '60px',
            height: '30px'
          };
          var targetPosition = $('#dialogStack').offset();
          $.extend(properties, targetPosition);
          widget.animate(
            properties,
            function() {
              /* stuff to do after animation is complete */
              $('<div id="' + dialogId + 'Stacked">').addClass('stacked').appendTo('#dialogStack');
              var dialogTitle = dialog.siblings('.ui-dialog-titlebar').find('.ui-dialog-title').text();
              $('#' + dialogId + 'Stacked').text(dialogTitle); //dialog.find('.ui-dialog-title').text()
              widget.hide();
              /* pop from tray */
              $('#' + dialogId + 'Stacked').click(function() {
                $('#' + dialogId + 'Stacked').remove();
                widget.show();
                widget.animate({
                  width: '500px',
                  height: '375px',
                  top: 0,
                  left: window.width / 2 - 200
                });
              });
            });
        });

      },
      updateWindow: function(callback, data) {
        callback(data);
      },
      newRow: function(table, cols) { // add table row
        var row = $('<tr>');
        for (var i in cols) {
          row.append($('<td>').html(cols[i]));
        }
        table.append(row);
        return row;
      },
      head: function(table, cells) { // add table header
        var header = table.append($('<thead>').append('<tr>'));
        for (var i in cells) {
          header.append($('<th>').html(cells[i]));
        }
        table.append($('<tbody>'));
      },
      /* This function feeds an explorer window with expected documents
		  using a table   */
      feedTable: function(table, content) {
        var children = content.children;
        for (var i in children) {
          var child = children[i];
          var dcCreated = child.properties['dc:created'];
          var dcModified = child.properties['dc:modified'];
          if (dcCreated) {
            dcCreated = dcCreated.substring(0, 10);
          }
          if (dcModified) {
            dcModified = dcModified.substring(0, 10);
          }
          var columns = [child.title, dcModified, dcCreated];
          var row;
          if (commonController.isFolderish(child)) {
            columns.unshift('<div class="glyphicon glyphicon-folder-close"/>');
            columns.push('Folder');
            row = this.newRow(table, columns)
              .dblclick({
                  doc: child,
                  dialogId: table.parent('div').attr('id')
                },
                require('explorer/controller').openFolder);
          } else {
            columns.unshift('<div class="glyphicon glyphicon-file"/>');
            columns.push('File');
            row = this.newRow(table, columns)
              .dblclick({
                  doc: child
                },
                require('explorer/controller').openFile);
          }
          row.click(function() {
            $(this).closest("tr").siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
          });
        }
      }
    };
  }
);