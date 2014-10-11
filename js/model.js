/**
 * @author: com.acordier@gmail.com
 * @update: sept. 2014
 * this model class is responsible for fetching data from nuxeo server 
 * using rest calls and storing constants used to enforce logic
 */
 var model = {
 	constants: {
 		LAYER: {
 			DESKTOP: 0,
 			WINDOW: 1
 		}
 	},
 	/* Root document is used to init desktop */
 	getRoot: function(username){
 		return $.ajax({
 			url: '/nuxeo/api/v1/path/default-domain/UserWorkspaces/' + username,
 			type: 'GET',
 			dataType: 'json',
 			beforeSend: function(xhr){
 				model.setCredentials(xhr);
 			}
 		});    	
 	},
 	/* self explanatory */
 	getChildren: function(doc){
 		return $.ajax({
 			url: ['/nuxeo/api/v1/id/',doc.uid,'/@children'].join(''),
 			type: 'GET',
 			dataType: 'json',
 			beforeSend: function(xhr){
 				model.setCredentials(xhr);
 				xhr.setRequestHeader('X-NXDocumentProperties','*');
 			},
 			success: function(data){
 				data.parentUid = doc.uid;
 				data.parentTitle = doc.title;
 			}
 		});	
 	},
 	/* get result of the getChildren operation and add a ref to parent */
 	getContent: function(nuxeoResponse){
 		return {
 			parentUid: nuxeoResponse.parentUid,
 			parentTitle: nuxeoResponse.parentTitle,
 			children: nuxeoResponse.entries
 		};
 	},
 	/* convert a blob holder as a pdf and get result as stream */
 	getPdfPreview: function (doc, callback){
 		var xhr = new XMLHttpRequest();
 		xhr.open('POST', ['/nuxeo/api/v1/id/',doc.uid,'/@blob/file:content/@op/Blob.ToPDF'].join(''), true);
 		model.setCredentials(xhr);
 		xhr.setRequestHeader('Content-Type', 'application/json+nxrequest');
 		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
 		xhr.overrideMimeType('application/pdf');
 		xhr.responseType = 'blob';
 		xhr.onload = callback;
 		xhr.send(JSON.stringify({'params':{}}));
 	},
 	/* get blob from blob as stream */
 	getBlob: function (doc, callback){
 		var xhr = new XMLHttpRequest();
 		xhr.open('POST', ['/nuxeo/api/v1/id/',doc.uid,'/@op/Blob.Get'].join(''), true);
		model.setCredentials(xhr); 		
		xhr.setRequestHeader('Content-Type', 'application/json+nxrequest');
 		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
 		xhr.overrideMimeType(doc.properties['file:content']['mime-type']);
 		xhr.responseType = 'blob';
 		xhr.onload = callback;
 		xhr.send(JSON.stringify({'params':{}}));
 	},
 	/* get blob as stream */
 	getDocumentById: function (id){
 		
 	},
 	setCredentials: function(xhr){
 		xhr.setRequestHeader('Authorization', $.cookie('nx-auth'));
 	}
}