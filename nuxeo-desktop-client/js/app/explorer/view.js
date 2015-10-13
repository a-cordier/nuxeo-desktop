define(
  [
    'require',
    'common/model',
    'common/view',
    'common/controller',
    'explorer/controller',
    'jquery'
  ],
  function(require, commonModel, commonView, commonController, controller, $) {
    return {
      explorer: function(data) {
        if (!data.dialogId) {
          /* make sure dialog id is unique,
          among other things to allow binding
          to its history */
          var id = data.content.uid;
          while ($('#' + id).length) {
            window.console.log(id + " is allready bound");
            id = commonController.guid();
          }
          commonView.createWindow(function(_data) {
            var id = _data.id;
            var table = $('<table>');
            $('#' + id).append(table);
            commonView.head(table, ['', 'Title', 'Modified', 'Created', 'Type']);
            commonView.feedTable(table, _data.content);
          }, {
            'id': id,
            'title': data.content['title'],
            'content': data.content
          });
          this.showNavBar($('#' + id));
          // utile ou pas ? v
         // $('#' + id).append(['<div data-docId="',data.content.uid,'"  style="display: none;">'].join(''));
          $('#' + id).on('dragenter', function(event){
            event.stopPropagation();
            event.preventDefault();
            $(this).addClass('file-dragover');
            //$(this).css('border', 'solid 5px green');
          });
          $('#' + id).on('dragover', function(event){
            event.stopPropagation();
            event.preventDefault();
          });
            $('#' + id).on('dragleave', function(event){
           event.preventDefault();
           $(this).removeClass('file-dragover');
          });
          $('#' + id).on('drop', function(event){
            if(event.originalEvent.dataTransfer){
              if(event.originalEvent.dataTransfer.files.length) {
               event.preventDefault();
               event.stopPropagation();
               //$(this).css('border', '3px dashed green');
               var files = event.originalEvent.dataTransfer.files;
                $(this).removeClass('file-dragover');
                require('explorer/controller').createFile(files, data.content.uid);
              }  
            }
           
            //We need to send dropped files to Server
            //handleFileUpload(files,obj);
          });
          return id;
        } else {
          commonView.updateWindow(function(_data) {
            var windowSelector = '#' + _data.dialogId;
            $(windowSelector + ' tr').remove();
            var table = $(windowSelector + ' table');
            this.feedTable(table, _data.content);
            $(windowSelector).dialog("option", "title", _data.content['title']);
            if (!$(windowSelector).siblings('.ui-dialog-titlebar').find('.nav-bar').length) {
              this.showNavBar($(windowSelector));
            }
          }, {
            'dialogId': data.dialogId,
            'content': data.content
          });
          if($("div[data-docId]").length) {
            $("div[data-docId]").remove();
          }
          // utile ou pas ?
          //$('#' + id).append(['<div data-docid="',data.content.uid,'"  style="display: none;">'].join(''));
          return data.dialogId;
        }
      },
      showNavBar: function(dialog) { // Prev. Next Buttons
        var id = dialog.attr('id');
        var navBar = $('<div>').addClass('nav-bar').insertBefore(dialog.siblings('.ui-dialog-titlebar').find('.ui-dialog-title'));
        var backBtn = $('<span id="navBackBtn-' + id + '">').addClass('ui-icon back custom disabled').appendTo(navBar);
        var nextBtn = $('<span id="navForwBtn-' + id + '">').addClass('ui-icon next custom disabled').appendTo(navBar);
        this.updateNavBar(dialog);
      },
      /* this function updates nav bar view 
			  according to the current navigation context */
      updateNavBar: function(dialog) {
        var id = dialog.attr('id');
        var history = commonModel.cache.get(id);
        window.console.log("updateNavBar: " + id);
        var navBar = dialog.siblings('.ui-dialog-titlebar').find('.nav-bar');
        var backBtn = $('#navBackBtn-' + id),
          nextBtn = $('#navForwBtn-' + id);
        if (history && history.cursor > 0) {
          if (backBtn.hasClass('disabled')) {
            backBtn.removeClass('disabled');
            backBtn.bind('click', {
              'dialog': dialog
            }, require('explorer/controller').navigateBackward);
          }
        } else {
          if (!backBtn.hasClass('disabled')) {
            backBtn.addClass('disabled');
            backBtn.unbind('click', require('explorer/controller').navigateBackward);
          }
        }
        if (history && history.cursor < history.data.length - 1) {
          if (nextBtn.hasClass('disabled')) {
            nextBtn.removeClass('disabled');
            nextBtn.bind('click', {
              'dialog': dialog
            }, require('explorer/controller').navigateForward);
          }
        } else {
          if (!nextBtn.hasClass('disabled')) {
            nextBtn.addClass('disabled');
            nextBtn.unbind('click', require('explorer/controller').navigateForward);
          }
        }
      }
    };
  }
);