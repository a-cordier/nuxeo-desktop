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
      this.displayWindow(content);
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
   cropTitle: function(title){
    return title.length > 8 ? title.substring(0, 5) + '...' : title;
  }
};