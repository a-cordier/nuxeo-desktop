var controller = {
	init: function(){
		/* TODO: Authentication Logic : Ask for 
				login if not authenticated else display desktop */
		if(!$.cookie('nx-auth')){
			view.login();
		}else{
			this.initDesktop();
		}	
	},
	authenticate: function(username, password){
		/* MOCK // TODO: Authentication logic and security based on session id */
		$.cookie('nx-auth', 'Basic ' + $.base64.encode(username + ':' + password));
		$.cookie('nx-user', username);
		this.init();
	},
	initDesktop: function(){
		/* get user workspace data from model and ask view to display desktop */
		model.getRoot($.cookie('nx-user')).
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
		model.getPdfPreview(event.data.doc, function(){
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