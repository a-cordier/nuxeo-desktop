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
		model.getSession(username, password).
		then(function(response){
			controller.initDesktop(username);
			$.cookie("nxuser", username);
		});
	},
	initDesktop: function(username){
		/* get user workspace data from model and ask view to display desktop */
		model.getRoot(username).
			//then(model.getChildren).
			then(function(content){
				return model.getChildren(content);
			}).
			then(model.getContent).
			then(function(content){
				view.displayDesktop(content);
				//view.display(model.constants.LAYER.DESKTOP, null, {'content': content});
			});
	},
	openFolder: function(event){ // TODO rename to openFolder
		/* if document is folderish then display its content in a window */
		var dialogId = event.data.dialogId;
		window.console.log("open folder dialog id is " + event.data.dialogId);
		model.getChildren(event.data.doc).
			then(model.getContent).
			then(function(content){
				// var id = view.display(
				// 	model.constants.LAYER.WINDOW, 
				// 	model.constants.APP.EXPLORER, 
				// 	{'content': content, 
				// 	 'dialogId': event.data.dialogId,				 
				// 	});
				var id = view.displayExplorerWindow(
					{'content': content, 
				 	 'dialogId': event.data.dialogId,
				    });
				// saving document to cache to allow prev./next navigation
				if(!event.data.bypass){
					controller.saveToCache(id, event.data.doc);
					window.console.log("openFolder - cursor = " + model.cache.get(id).cursor);
					window.console.log(JSON.stringify(model.cache));
				} 
				if(!event.data.init) {
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
		window.console.log(JSON.stringify(doc));
		return doc.facets.indexOf('Folderish') > -1 || 
			doc.facets.indexOf('Collection') > -1;
	},
	logOut: function(){
		$.removeCookie("nxuser");
		/// ...... to be continued
	},
	loadCalendars: function(){
		var username = $.cookie("nxuser");
		controller.initCalendars(username);
		model.getCalendars(username).
			then(function(content){
				return model.getChildrenByQuery(content,  {'includeHidden':'true'});
			}).
			then(model.getContent).
			then(function(content){alert(JSON.stringify(content));});
		var id = view.displayCalendarWindow({});
	},
	initCalendars: function(username){
		model.getCalendars(username).
		fail(function(result){
			model.getRoot(username).
			then(function(content){
		//		alert('create agenda root');
				return model.createFolder(content, '.agendas', true);
			}).then(function(content){
		//		alert('creating personnal agenda: ' + JSON.stringify(content));
				model.createFolder(content, 'Personnal');
			});
		});
	}
}