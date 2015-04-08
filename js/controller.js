var controller = {
	init: function(){
		$.ajaxSetup({
			statusCode: {
				401: function(){
					view.login();
				}
			}
		});
		view.login(); 				
	},
	authenticate: function(username, password){
		model.getToken(username, password).
		then(function(response){
			$.ajaxSetup({
				beforeSend: function(xhr){
					xhr.setRequestHeader('X-Authentication-Token', response);
					/* TODO : X-NXDocumentProperties header should
					be set on demand to save bandwith */
					xhr.setRequestHeader('X-NXDocumentProperties','*');
				}
			});
			controller.initDesktop(username);
		});
	},
	initDesktop: function(username){
		/* get user workspace data from model and ask view to display desktop */
		model.getRoot(username).
			then(model.getChildren).
			then(model.getContent).
			then(function(content){
				view.display(model.constants.LAYER.DESKTOP, null, {'content': content});
			});
	},
	handleFolderishDoubleClick: function(event){
		/* if document is folderish then display its content in a window */
		model.getChildren(event.data.doc).
			then(model.getContent).
			then(function(content){
				view.display(
					model.constants.LAYER.WINDOW, 
					model.constants.APP.EXPLORER, 
					{'content': content, 
					 'targetWindowId':event.data.windowId
					});
			});
	},
	handleBlobishDoubleClick: function(event){
		/* if document is file-like then display a pdf preview*/
		model.getBlob(event.data.doc, function(){
			if(this.status == 200){
 				var fileURL = URL.createObjectURL(this.response);
       			window.open(fileURL);
 			}
		});		
	},
	isFolderish: function(doc){
		return doc.facets.indexOf('Folderish') > -1;
	}
}