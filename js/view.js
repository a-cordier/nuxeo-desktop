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
    view.updateWindow(content ,data.targetWindowId);
  }
},
createWindow: function(callback, data){
  /* Create and fill window */
  $('body').append(
    $('<div>').
    attr('title', data.title).
    attr('id', data.id).
    addClass('dialog_window'));
  callback(data);
  $('#'+data.id).dialog({'width':560,'height':375}).
  dialogExtend({
    "closable" : true,
        "maximizable" : true, // enable/disable maximize button
        "minimizable" : false, // enable/disable minimize button
        "collapsable" : true, // enable/disable collapse button
        "dblclick" : "collapse", // set action on double click.
        "icons" : { // jQuery UI icon class
          "close" : "ui-icon-circle-plus",
          "maximize" : "ui-icon-circle-plus",
          "minimize" : "ui-icon-circle-minus",
          "collapse" : "ui-icon-triangle-1-s",
          "restore" : "ui-icon-bullet"
        },
      });
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
    if(controller.isFolderish(child)){
      var row = view.newRow(table, 
        ['<div class="glyphicon glyphicon-folder-close"/>', 
        child.title, 
        child.lastModified, 
        child.properties['dc:created'], 'Folder']);
      row.dblclick(
        {doc: child, windowId: content.parentUid}, 
        controller.handleFolderishDoubleClick);
    }else{
      var row = view.newRow(table, 
        ['<div class="glyphicon glyphicon-file"/>', 
        child.title, 
        child.lastModified, 
        child['dc:created'], 'File']);
      row.dblclick(
        {doc: child}, 
        controller.handleBlobishDoubleClick);
    }
  }
},
  newRow: function(table, cols){ // add table row
    var tr = $('<tr>');
    for(var i in cols){
      tr.append($('<td>').html(cols[i]));
    }
    table.append(tr);
    return tr;
  },    
  head: function(table, headers){ // add table header
    var tr = table.append($('<thead>').append('<tr>'));
    console.log(tr.html());
    for(var i in headers){
      tr.append($('<th>').html(headers[i]));
    }
    table.append($('<tbody>'));
  },
  cropTitle: function(title){
    return title.length > 8 ? title.substring(0, 5) + '...' : title;
  }
};