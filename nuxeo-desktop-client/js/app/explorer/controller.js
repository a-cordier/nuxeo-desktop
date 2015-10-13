define(
  [
    'require',
    'common/model',
    'common/controller',
    'explorer/model',
    'explorer/view',
    'jquery'
  ],
  function(require, commonModel, commonController, model, view, $) {
    return {
      openFolder: function(event) { // TODO rename to openFolder
        /* if document is folderish then display its content in a window */
        var dialogId = event.data.dialogId;
        window.console.log("open folder dialog id is " + event.data.dialogId);
        commonModel.getChildren(event.data.doc).
        then(commonModel.getContent).
        then(function(content) {
          var id = view.explorer({
            'content': content,
            'dialogId': event.data.dialogId,
          });
          // saving document to cache to allow prev./next navigation
          if (!event.data.bypass) {
            commonController.saveToCache(id, event.data.doc);
            // window.console.log("openFolder - cursor = " + commonModel.cache.get(id).cursor);
            // window.console.log(JSON.stringify(commonModel.cache));
          }
          if (!event.data.init) {
            view.updateNavBar($('#' + id));
          }
        });
      },
      openFile: function(event) {
        /* if document is file-like then display a pdf preview
        To do: detect events and don't open theim this way (there's no blob attached) */
        commonModel.getPdfPreview(event.data.doc, function() {
          if (this.status == 200) {
            var fileURL = URL.createObjectURL(this.response);
            window.open(fileURL);
          }
        });
      },
      /* This function retrieves the last visited document in an explorer 
				window, using a cache */
      navigateBackward: function(event) {
        var dialog = event.data.dialog;
        var id = dialog.attr('id');
        var history = model.cache.get(id);
        var item = history.data[--history.cursor];
        window.console.log("backward: retrived document: " + item.title);
        window.console.log("backward - cursor: " + history.cursor);
        if (item) {
          this.openFolder({
            data: {
              doc: item,
              dialogId: dialog.attr('id'),
              bypass: true
            }
          });
        }
        require('explorer/view').updateNavBar(dialog);
      },
      /* when navigateBackward has been triggered, one can use 
      navigateForward to get the previously visible document */
      navigateForward: function(event) {
        var dialog = event.data.dialog;
        var id = dialog.attr('id');
        var history = model.cache.get(id);
        var item = history.data[++history.cursor];
        window.console.log("forward - cursor: " + history.cursor);
        window.console.log("forward: retrived document: " + item.title);
        if (item) {
          this.openFolder({
            data: {
              doc: item,
              dialogId: dialog.attr('id'),
              bypass: true
            }
          });
        }
        require('explorer/view').updateNavBar(dialog);
      },
      createFile: function(files, parent){
        require('explorer/model').createFile(files, parent);
      }
    };
  }
);