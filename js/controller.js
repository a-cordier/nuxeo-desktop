var controller = {
	init: function(){
		/* TODO: Authentication Logic : Ask for 
				login if not authenticated else display desktop */
		if(!$.cookie('auth-token')){
			view.login();
		}else{
			this.initDesktop();
		}	
	},
	authenticate: function(username, password){
		$.cookie('auth-token', 'Basic ' + $.base64.encode(username + ':' + password));
		this.init();
	},
	initDesktop: function(){
		/* get user workspace data from model and ask view to display desktop */
		model.getRoot('Administrator').
			then(model.getChildren).
			then(model.getContent).
			then(function(content){
				view.display(model.constants.LAYER.DESKTOP, content);
			});
	},
	handleFolderishDoubleClick: function(event){
		/* if document is folderish then display its content in a window */
		model.getChildren(event.data.doc).
			then(model.getContent).
			then(function(content){
				view.display(model.constants.LAYER.WINDOW, content);
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