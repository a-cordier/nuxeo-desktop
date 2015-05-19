var controller = {
	init: function(){
		model.cache.init();
		$(document).on('ajaxError', function(event, xhr) {
			if (xhr.status === 401 || xhr.status === 403) {
				window.console.log(xhr.status + ": please log in");
				view.login(); 	
			}
		});
		var nxuser = $.cookie("nxuser");
		if(typeof nxuser !== "undefined") {
			controller.initDesktop(nxuser);
		} else {
			view.login(); 				
		}
	},
	authenticate: function(username, password){
		model.getToken(username, password).
		then(function(response){
			controller.initDesktop(username);
			$.cookie("nxuser", username);
		});
	},
	initDesktop: function(username){
					$.ajaxSetup({
				beforeSend: function(xhr){
					///xhr.setRequestHeader('X-Authentication-Token', response);
					/* TODO : X-NXDocumentProperties header should
					be set on demand to save bandwith */
					xhr.setRequestHeader('X-NXDocumentProperties','*');
				}
			});
		/* get user workspace data from model and ask view to display desktop */
		model.getRoot(username).
			then(model.getChildren).
			then(model.getContent).
			then(function(content){
				view.display(model.constants.LAYER.DESKTOP, null, {'content': content});
			});
	},
	openFolder: function(event){ // TODO rename to openFolder
		/* if document is folderish then display its content in a window */
		var dialogId = event.data.dialogId;
		window.console.log("open folder: " + event.data.dialogId);
		model.getChildren(event.data.doc).
			then(model.getContent).
			then(function(content){
				var id = view.display(
					model.constants.LAYER.WINDOW, 
					model.constants.APP.EXPLORER, 
					{'content': content, 
					 'dialogId': event.data.dialogId,				 
					});
				// saving document to cache to allow prev./next navigation
				if(!event.data.bypass){
					controller.saveToCache(id, event.data.doc);
					view.updateNavBar($('#'+id));
				} 
			});
	},
	openFile: function(event){ // TODO rename to openFile
		/* if document is file-like then display a pdf preview*/
		model.getBlob(event.data.doc, function(){
			if(this.status == 200){
 				var fileURL = URL.createObjectURL(this.response);
       			window.open(fileURL);
 			}
		});		
	},
	saveToCache: function(key, data){
		/* feed cache to allow preview / next navigation */
		var history = model.cache.get(key)||{cursor:-1, data:[]};
		history.data.push(data);
		history.cursor++; // keeping a track on the currently opened document
		window.console.log("saving to cache - cursor: " + history.cursor);
		model.cache.set(key, history);	
	},
	navigateBackward: function(event){
		var dialog = event.data.dialog;
		var id = dialog.attr('id');
		var history = model.cache.get(id);
		var item = history.data[--history.cursor];
		window.console.log("backward: retrived document: " + item.title);
		window.console.log("backward - cursor: " + history.cursor);
		if(item){
			controller.openFolder({
				data:{
					doc: item,
					dialogId: dialog.attr('id'),
					bypass: true
				}
			});
		}
		view.updateNavBar(dialog);
	},
	navigateForward: function(event){
		var dialog = event.data.dialog;
		var id = dialog.attr('id');
		var history = model.cache.get(id);
		var item = history.data[++history.cursor];
				window.console.log("forward - cursor: " + history.cursor);
		window.console.log("forward: retrived document: " + item.title);
		if(item){
			controller.openFolder({
				data:{
					doc: item,
					dialogId: dialog.attr('id'),
					bypass: true
				}
			});
		}
		view.updateNavBar(dialog);
	},
	isFolderish: function(doc){
		return doc.facets.indexOf('Folderish') > -1;
	}
}