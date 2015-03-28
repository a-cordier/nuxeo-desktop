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
    }else if(layer===model.constants.LAYER.WINDOW){
      switch(app){
        case model.constants.APP.EXPLORER:
        view.displayExplorerWindow(data);
        break;
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
        iconPlaceHolder.append($('<div></div>').addClass('icon-caption').text(this.cropTitle(children[i].title)));
        iconPlaceHolder.dblclick(
          {doc: children[i]}, controller.handleFolderishDoubleClick);
        iconPlaceHolder.draggable();
      }
    }
  },
  displayExplorerWindow: function(data) {
    if(!data.targetWindowId) { 
     view.createWindow(function(_data){
      var table = $('<table>'); 
      $('#'+_data.id).append(table);
      view.head(table, ['', 'Title', 'Modified', 'Created', 'Type']);
      view.feedTable(table, _data.content);
    }, {'id': data.content.parentUid, 'title': data.content.parentTitle, 'content': data.content});
   }else {
    view.updateWindow_(function(_data){
      var windowSelector = '#'+_data.targetWindowId;
      var children = _data.content.children;
      $(windowSelector+' tr').remove();
      var table = $(windowSelector+' table');
      view.feedTable(table,  _data.content);
      $(windowSelector).attr('id', _data.content.parentUid);
      $(windowSelector).attr('title', _data.content.title);
    }, {'targetWindowId': data.targetWindowId, 'content': data.content});
  }
},
createWindow: function(callback, data){
  /* Create and fill window */
  if($('#'+data.id))$('#'+data.id).dialog('destroy').remove();
  $('body').append(
    $('<div>').
    attr('title', data.title).
    attr('id', data.id).
    addClass('dialog_window'));
  callback(data);
  $('#'+data.id).dialog(
    {'width':560,
    'height':375,
    close: function(event, ui) { 
      $(this).dialog('destroy').remove(); 
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
    //$('').css('opacity',1);
},
updateWindow_: function(callback, data){
  callback(data);
},
updateWindow: function(content, windowId){
  var children = content.children;
  var targetWindow = $('#'+windowId);
  $('#'+windowId+' tr').remove();
  var table = $('#'+windowId+' table');
  view.feedTable(table, content);
  targetWindow.attr("id", content.parentUid);
},
feedTable: function(table, content){
  var children = content.children;
  for(var i in children){
    var child = children[i];
    var dcCreated = child['dc:created'];
    var dcModified = child.lastModified;
    if(dcCreated) { 
      dcCreated.substring(0,10);
    }
    if(dcModified) {
      dcModified.substring(0,10);
    }
    var columns = [child.title, dcModified, dcCreated];
    if(controller.isFolderish(child)){
      columns.unshift('<div class="glyphicon glyphicon-folder-close"/>');
      columns.push('Folder');
      view.newRow(table, columns)
      .dblclick(
        {doc: child, windowId: content.parentUid}, 
        controller.handleFolderishDoubleClick);
    }else{
      columns.unshift('<div class="glyphicon glyphicon-file"/>');
      columns.push('File');
      view.newRow(table, columns)
      .dblclick(
        {doc: child}, 
        controller.handleBlobishDoubleClick);
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