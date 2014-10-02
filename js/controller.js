var controller = {
	init: function(){
		/* TODO: Authentication Logic : Ask for 
				login if not authenticated else display desktop */
		this.initDesktop();
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
		/* if document is file-like then display */
		model.getBlob(event.data.doc);		
	},
	isFolderish: function(doc){
		return doc.facets.indexOf('Folderish') > -1;
	}
}