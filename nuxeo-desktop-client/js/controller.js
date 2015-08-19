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
			then(function(content){
				return model.getChildren(content);
			}).
			then(model.getContent).
			then(function(content){
				view.desktop(content);
			});
	},
	openFolder: function(event){ // TODO rename to openFolder
		/* if document is folderish then display its content in a window */
		var dialogId = event.data.dialogId;
		window.console.log("open folder dialog id is " + event.data.dialogId);
		model.getChildren(event.data.doc).
			then(model.getContent).
			then(function(content){
				var id = view.explorerWindow(
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
	openFile: function(event){ 
		/* if document is file-like then display a pdf preview
		To do: detect events and don't open theim this way (there's no blob attached) */
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
	}, /* This function retrieves the last visited document in an explorer 
	window, using a cache */
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
	/* when navigateBackward has been triggered, one can use 
	navigateForward to get the previously visible document */
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
	/* fetch all calendars for the current user */
	loadCalendars: function(){
		var username = $.cookie("nxuser");
		model.calendars = {};
		var promises = [];
		model.getCalendars(username)
		.then(function(content){
			return model.getChildren(content);
		})
		.then(model.getContent)
		.then(function(content){
			var calendars = {};
			var children = content.children;
			for(var i in children){
				var calendar = children[i].title;
				model.calendars[calendar] = {'events': []};
				promises.push(model.getChildrenWithQuery(children[i], {'docType':'VEVENT'} )
				.then(model.getContent)
				.then(function(content){
					var _children = content.children;
					for(var i in _children){
						model.calendars[calendar]['events'].push(
							{
								'title': _children[i].title,
								'start': _children[i].properties['vevent:dtstart'],
								'end': _children[i].properties['vevent:dtend']
							}
						);
						
					}
				}));
			}
			$.when.apply($, promises).then(function(){
				view.calendarWindow({});
			});
		});
	}, /* Calendars are retrieved in a .agendas hidden folder located in
	/default-domain/UserWorkspaces/${username}/
	If we can't find one for the current user, let's create it 
	By default a calendar called "Personnal" is created for each user
	*/
	initCalendars: function(username){
		model.getCalendars(username).
		fail(function(result){
			model.getRoot(username).
			then(function(content){
				return model.createFolder(content, '.agendas', true);
			}).then(function(content){
				model.createFolder(content, 'Personnal');
			});
		});
	}, /* This function returns an object
	that is used to tell FullCalendar how to behave
	and what to display
	*/
	configureFullCalendar: function() {
		var config = {
			'events': model.calendars['Personnal'].events,
			dayClick: function(date, jsEvent, cview) {
				// create event addition window
			     //    model.createEvent('Personnal', 
			     //    	{'start':date.format(),
			     //    	'end': date.format(), 
			     //    	'title':'baze',
			     //    	'location': 'somewhere'
			    	// 	}
			    	// );
			},
			dayRender: function(date, element, cview){
       			element.bind('dblclick', function() {
            		view.eventWindow({});
        		});
    		}
		};
		return config;
	}
}