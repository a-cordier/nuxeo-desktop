var view = {
  login: function(){
    $('#loginButton').click(function(event) {
      controller.authenticate($('input[type="text"]').val(), 
        $('input[type="password"]').val());
    });
    $('#loginModal').css(
      {'height':$(window).height()*0.75, 'top':'25%'});
    $('#loginModal').modal({'backdrop':false});
  },
  display: function(layer, app, data){
    if(layer===model.constants.LAYER.DESKTOP){
      view.displayDestop(data.content);
    } else if( layer===model.constants.LAYER.WINDOW ){
      switch(app){
        case model.constants.APP.EXPLORER:
          return view.displayExplorerWindow(data);
        default:
          break;
      }
    }
  },
  displayDestop: function(content){
    var children = content.children;
    $('<ul id="desktopIcons"></ul>').appendTo($('#desktop'));
    for(var i in children){
      var iconPlaceHolder = $('<li></li>').appendTo($('#desktopIcons'));
      if(controller.isFolderish(children[i])){
        iconPlaceHolder.append($('<div></div>').addClass('icon-big folder-collapsed-icon'));
        iconPlaceHolder.dblclick(
          {doc: children[i]}, controller.openFolder);
      } else {
        iconPlaceHolder.append($('<div></div>').addClass('icon-big file-blank-icon'));
        iconPlaceHolder.dblclick(
          {doc: children[i]}, controller.openFile);
        
      }
      iconPlaceHolder.append($('<div></div>').addClass('icon-caption').text(this.cropTitle(children[i].title)));
      iconPlaceHolder.draggable();
    }
  },
  displayExplorerWindow: function(data) {
    if(!data.dialogId) { 
      /* make sure dialog id is unique,
      among other things to allow binding
      to its history */
     var id = data.content.uid;
     while($('#'+id).length){
      id = model.guid();
     }
     view.createWindow(function(_data){
      var id = _data.id;
      var table = $('<table>'); 
      $('#'+ id).append(table);
      view.head(table, ['', 'Title', 'Modified', 'Created', 'Type']);
      view.feedTable(table, _data.content);
    }, {'id': id, 'title': data.content['title'], 'content': data.content});
     return id;
   }else {
    view.updateWindow(function(_data){
      var windowSelector = '#'+_data.dialogId;
      $(windowSelector+' tr').remove();
      var table = $(windowSelector+' table');
      view.feedTable(table,  _data.content);
      $(windowSelector).dialog("option", "title", _data.content['title']);
      if(!$(windowSelector).siblings('.ui-dialog-titlebar').find('.nav-bar').length){
        view.showNavBar($(windowSelector));
      }
    }, {'dialogId': data.dialogId, 'content': data.content});
     return data.dialogId;
  }
},
createWindow: function(callback, data){
  var id = data.id;
  $('body').append(
    $('<div>').
    attr('title', data.title).
    attr('id', id).
    addClass('dialog_window'));
  callback(data);
  $('#'+id).dialog(
    {'width':560,
    'height':375,
    close: function(event, ui) { 
      $(this).dialog('destroy').remove(); 
      if(model.cache.get(id)){
        model.cache.delete(id);
      }
    }
  } 
  ).
  dialogExtend({
    'closable' : true,
      'maximizable' : true, // enable/disable maximize button
      'minimizable' : false, // enable/disable minimize button
      'collapsable' : true, // enable/disable collapse button
      'dblclick' : 'collapse', // set action on double click.
      "icons" : {
        "close" : "close custom",
        "maximize" : "plus custom",
        "collapse" : "minus custom",
        "restore" : "plus custom"
      },
      'events': {
        "load": function(event,dialog){
        }
      }
    }
    );
  $('a').removeClass('ui-state-default');
  $('.ui-dialog-titlebar-close,.close').css(
  {
    'opacity': 1,
    'margin-top': 0
  });
  $('.ui-dialog-titlebar').addClass('custom');
  },
  updateWindow: function(callback, data){
    callback(data);
  },
  showNavBar: function(dialog){ // Prev. Next Buttons
    // if(dialog.siblings('.nav-bar').length){ 
    //   return;
    // }
    var navBar = $('<div>').addClass('nav-bar').insertAfter(dialog.siblings('.ui-dialog-titlebar').find('.ui-dialog-title'));
   
    // var nextBtn = $('<span>').addClass('ui-icon next custom').appendTo(navBar);
    // nextBtn.click(function(event) {
    //   controller.navigateForward(dialog);
    // });
    view.updateNavBar(dialog);
    //navBar.append(nextBtn);
  },
  updateNavBar: function(dialog){
    var history = model.cache.get(dialog.attr('id'));
    window.console.log("updateNavBar: " + dialog.attr('id'));
    window.console.log(JSON.stringify(model.cache));
    var navBar = dialog.siblings('.ui-dialog-titlebar').find('.nav-bar');
    if(history && history.cursor > 0){
      if(!navBar.find('.back').length){
         var backBtn = $('<span>').addClass('ui-icon back custom').appendTo(navBar);
         backBtn.click(function(event) {
          window.console.log('update nav bar click event');
          controller.navigateBackward(dialog);
         });
         navBar.append(backBtn);
      }
    } else {
      if(navBar.find('.back').length){
         navBar.find('.back').remove();
      }
    } 
    if(history && history.cursor < history.data.length-1){
      if(!navBar.find('.next').length){
         var nextBtn = $('<span>').addClass('ui-icon next custom').appendTo(navBar);
          nextBtn.click(function(event) {
          window.console.log('update nav bar click event');
          controller.navigateBackward(dialog);
         });
         navBar.append(nextBtn);
      }
    }else {
      if(navBar.find('.next').length){
         navBar.find('.next').remove();
      }
    }
  },
  feedTable: function(table, content){
    var children = content.children;
    for(var i in children){
      var child = children[i];
      var dcCreated = child.properties['dc:created'];
      var dcModified = child.properties['dc:modified'];
      if(dcCreated) { 
        dcCreated = dcCreated.substring(0,10);
      }
      if(dcModified) {
        dcModified = dcModified.substring(0,10);
      }
      var columns = [child.title, dcModified, dcCreated];
      if(controller.isFolderish(child)){
        columns.unshift('<div class="glyphicon glyphicon-folder-close"/>');
        columns.push('Folder');
        view.newRow(table, columns)
        .dblclick(
          {doc: child, dialogId: table.parent('div').attr('id')}, 
          controller.openFolder);
      }else{
        columns.unshift('<div class="glyphicon glyphicon-file"/>');
        columns.push('File');
        view.newRow(table, columns)
        .dblclick(
          {doc: child}, 
          controller.openFile);
      }
    }
  },
  newRow: function(table, cols){ // add table row
    var row = $('<tr>');
    for(var i in cols){
      row.append($('<td>').html(cols[i]));
    }
    table.append(row);
    return row;
  },    
  head: function(table, cells){ // add table header
    var header = table.append($('<thead>').append('<tr>'));
    for(var i in cells){
      header.append($('<th>').html(cells[i]));
    }
    table.append($('<tbody>'));
  },
  cropTitle: function(title){
    return title.length > 8 ? title.substring(0, 5) + '...' : title;
  }
};