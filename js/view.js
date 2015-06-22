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
  // display: function(layer, app, data){
  //   if(layer===model.constants.LAYER.DESKTOP){
  //     view.displayDesktop(data.content);
  //   } else if( layer===model.constants.LAYER.WINDOW ){
  //     switch(app){
  //       case model.constants.APP.EXPLORER:
  //         return view.displayExplorerWindow(data);
  //       default:
  //         break;
  //     }
  //   }
  // },
  displayDesktop: function(content){
    var children = content.children;
    if($('#desktopIcons').length){
      $('#desktopIcons').remove();
    }
    if($('#menuItems').find('li').length){
      $('#menuItems').find('li').remove();
    }
    view.populateMainMenu();
    $('<ul id="desktopIcons"></ul>').appendTo($('#desktop'));
    for(var i in children){
      var iconPlaceHolder = $('<li></li>').appendTo($('#desktopIcons'));
      if(controller.isFolderish(children[i])){
        iconPlaceHolder.append($('<div></div>').addClass('icon-big folder-collapsed-icon'));
        iconPlaceHolder.dblclick(
          {doc: children[i], init: true}, controller.openFolder);
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
      window.console.log(id+ " is allready bound");
      id = model.guid();
     }
     view.createWindow(function(_data){
      var id = _data.id;
      var table = $('<table>'); 
      $('#'+ id).append(table);
      view.head(table, ['', 'Title', 'Modified', 'Created', 'Type']);
      view.feedTable(table, _data.content);
    }, {'id': id, 'title': data.content['title'], 'content': data.content});
     view.showNavBar($('#'+id));
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
  displayCalendarWindow: function(data) {
    if(!data.dialogId) { 
      /* make sure dialog id is unique,
      among other things to allow binding
      to its history */
     var id=model.guid();
     while($('#'+id).length){
      window.console.log(id+ " is allready bound");
      id = model.guid();
     }
 
     view.createWindow(function(_data){
     var id = _data.id;
     var cal = $('<div>');
     cal.attr("id","#cal-"+id);
     $("#"+id).append(cal);
     cal.fullCalendar(); // TO DO CUSTOM DISPLAY AND BIND DATA
    }, {'id': id});
     return id;
   }else {
    view.updateWindow(function(_data){
     
    }, {'dialogId': data.dialogId, 'content': data.content});
     return data.dialogId;
  }
},
createWindow: function(callback, data, options){
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
  /* Overriding the collapse button behavior to implement 
  a "send to tray" functionality*/
  $('#'+id).siblings('.ui-dialog-titlebar').find('a[title="collapse"]').off().click(
  {
    dialog: $('#'+id)
  },function(event){
    var dialog = event.data.dialog;
    var widget = event.data.dialog.parents('.ui-widget');
    var dialogId = event.data.dialog.attr('id');
    var properties = {
      width: '60px',
      height: '30px'
    };
    var targetPosition = $('#dialogStack').offset();
    //targetPosition.top+=10;
    $.extend(properties, targetPosition);
    widget.animate(
      properties,
      function() {
      /* stuff to do after animation is complete */
       $('<div id="'+dialogId+'Stacked">').addClass('stacked').appendTo('#dialogStack');
       var dialogTitle = dialog.siblings('.ui-dialog-titlebar').find('.ui-dialog-title').text();
       $('#'+dialogId+'Stacked').text(dialogTitle); //dialog.find('.ui-dialog-title').text()
       widget.hide();
       /* pop from tray */
       $('#'+dialogId+'Stacked').click(function(){
         $('#'+dialogId+'Stacked').remove();
         widget.show();
         widget.animate({
            width: '500px', height: '375px', top:0, left: window.width/2-200
         });
       });
  });
    });
 // view.showNavBar($('#'+id));

  },
  updateWindow: function(callback, data){
    callback(data);
  },
  showNavBar: function(dialog){ // Prev. Next Buttons
   var id = dialog.attr('id');
   var navBar = $('<div>').addClass('nav-bar').insertBefore(dialog.siblings('.ui-dialog-titlebar').find('.ui-dialog-title')); 
   var backBtn = $('<span id="navBackBtn-' + id + '">').addClass('ui-icon back custom disabled').appendTo(navBar);
   var nextBtn = $('<span id="navForwBtn-' + id + '">').addClass('ui-icon next custom disabled').appendTo(navBar);
   view.updateNavBar(dialog);
  },
  updateNavBar: function(dialog){
    var id = dialog.attr('id');
    var history = model.cache.get(id);
    window.console.log("updateNavBar: " + id);
    var navBar = dialog.siblings('.ui-dialog-titlebar').find('.nav-bar');
    var backBtn = $('#navBackBtn-' + id), nextBtn = $('#navForwBtn-' + id);
    if(history && history.cursor > 0){
      if(backBtn.hasClass('disabled')){
         backBtn.removeClass('disabled');
         backBtn.bind('click', {'dialog': dialog}, controller.navigateBackward);
      }
    } else {
      if(!backBtn.hasClass('disabled')){
         backBtn.addClass('disabled');
         backBtn.unbind('click', controller.navigateBackward);
      }
    } 
    if(history && history.cursor < history.data.length-1){
      if(nextBtn.hasClass('disabled')){
         nextBtn.removeClass('disabled');
         nextBtn.bind('click', {'dialog': dialog}, controller.navigateForward);
      }
    }else {
      if(!nextBtn.hasClass('disabled')){
         nextBtn.addClass('disabled');
         nextBtn.unbind('click', controller.navigateForward);
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
      var row;
      if(controller.isFolderish(child)){
        columns.unshift('<div class="glyphicon glyphicon-folder-close"/>');
        columns.push('Folder');
        row = view.newRow(table, columns)
        .dblclick(
          {doc: child, dialogId: table.parent('div').attr('id')}, 
          controller.openFolder);
      }else{
        columns.unshift('<div class="glyphicon glyphicon-file"/>');
        columns.push('File');
        row = view.newRow(table, columns)
        .dblclick(
          {doc: child}, 
          controller.openFile);
      }
      row.click(function(){
        $(this).closest("tr").siblings().removeClass("highlighted");
        $(this).toggleClass("highlighted");
      });
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
  },
  populateMainMenu: function(){
    $('#menuItems').append('<li id="logOutItem">Log out</li>');
     $('#menuItems').append('<li id="calendar">Calendar</li>');
    $('#logOutItem').click(function(){
      controller.logOut();
    });
    $('#calendar').click(function(){
      controller.launchCalendar({});
    });

  }
};