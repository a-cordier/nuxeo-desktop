var view = {
  login: function(){
    $('.login-form').modal({
      escapeClose: false,
      clickClose: false,
      showClose: false
    });
    $('#credentialSubmit').click(function(event) {
      controller.authenticate($('input[type="text"]').val(), 
        $('input[type="password"]').val());
    });
  },
  display: function(layer, content){
    if(layer==model.constants.LAYER.DESKTOP){
      this.displayDestop(content);
    }else if(layer==model.constants.LAYER.WINDOW){
      this.displayWindowAsList(content);
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
  displayWindow: function(content) {
   var divIdSelector = '#' + content.parentUid;
   /* One window per folder */
   if($(divIdSelector).length!=0){
    $(divIdSelector).dialog("destroy");
    $(divIdSelector).remove();
  } 
  /* Create and fill window */
  var children = content.children;
  $('body').append(
    $('<div></div>').attr('title', content.parentTitle).
    attr('id', content.parentUid).
    addClass('dialog_window'));
  var ulId = content.parentUid + 'Icons';
  $('<ul></ul>').appendTo($(divIdSelector)).attr('id', ulId);
  for(var i in children){
    var iconPlaceHolder = $('<li></li>').appendTo($('#' + ulId));
    if(controller.isFolderish(children[i])){
      iconPlaceHolder.append($('<div></div>').addClass('icon-big folder-collapsed-icon'));
      iconPlaceHolder.append($('<div></div>').addClass('icon-caption').text(this.cropTitle(children[i].title)));
      iconPlaceHolder.dblclick(
        {doc: children[i]}, controller.handleFolderishDoubleClick);
    }else{
      iconPlaceHolder.append($('<div></div>').addClass('icon-big file-blank-icon'));
      iconPlaceHolder.append($('<div></div>').addClass('icon-caption').text(this.cropTitle(children[i].title)));
      iconPlaceHolder.dblclick(
        {doc: children[i]}, controller.handleBlobishDoubleClick);
    }
  }
     $(divIdSelector).dialog(); // open dialog
   },
   displayWindowAsList: function(content) {
    var divId = '#' + content.parentUid;
     /* window is unique */
     if($(divId).length!=0){
      $(divId).dialog('destroy');
      $(divId).remove();
    } 
    var children = content.children;  
    /* Create and fill window */
    $('body').append(
      $('<div>').
        attr('title', content.parentTitle).
        attr('id', content.parentUid).
        addClass('dialog_window'));
    /* create and fill table */
    var table = $('<table>'); 
    $(divId).append(table);

    /* add table header */
    var head = function(table, headers){
      var tr = table.append($('<thead>').append('<tr>'));
      console.log(tr.html());
      for(var i in headers){
        tr.append($('<th>').html(headers[i]));
      }
      table.append($('<tbody>'));
    };

    /* add table row */
    var newRow = function(table, cols){
      var tr = $('<tr>');
      for(var i in cols){
        tr.append($('<td>').html(cols[i]));
      }
      return table.append(tr);
    };

    head(table, ['', 'Title', 'Modified', 'Created', 'Type']);
    for(var i in children){
      var child = children[i];
      if(controller.isFolderish(child)){
        var row = newRow(table, 
          ['<div class="folder-collapsed-icon icon-big"/>', 
          child.title, 
          child.lastModified, 
          child.properties['dc:created'], 'Folder']);
        row.dblclick(
          {doc: child}, controller.handleFolderishDoubleClick);
      }else{
        var row = newRow(table, 
          ['<div class="file-blank-icon icon-big"/>', 
          child.title, 
          child.lastModified, 
          child['dc:created'], 'File']);
        row.dblclick(
          {doc: child}, controller.handleBlobishDoubleClick);
      }
    }

    $(divId).dialog().
      dialogExtend({
        "closable" : true,
        "maximizable" : true, // enable/disable maximize button
        "minimizable" : true, // enable/disable minimize button
        "collapsable" : true, // enable/disable collapse button
        "dblclick" : "collapse", // set action on double click.
        "icons" : { // jQuery UI icon class
          "close" : "ui-icon-circle-close",
          "maximize" : "ui-icon-circle-plus",
          "minimize" : "ui-icon-circle-minus",
          "collapse" : "ui-icon-triangle-1-s",
          "restore" : "ui-icon-bullet"
},
      }); // open dialog
   },
   cropTitle: function(title){
    return title.length > 8 ? title.substring(0, 5) + '...' : title;
  }
};