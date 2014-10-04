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
 		},
 		AUTH: ''
 	},
 	/* Root document is used to init desktop */
 	getRoot: function(username){
 		return $.ajax({
 			url: '/nuxeo/api/v1/path/default-domain/UserWorkspaces/' + username,
 			type: 'GET',
 			dataType: 'json',
 			beforeSend: function(xhr){
 				xhr.setRequestHeader("Authorization", "Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y");
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
 				xhr.setRequestHeader('X-NXDocumentProperties','*');
 				xhr.setRequestHeader("Authorization", "Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y");
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
 		xhr.setRequestHeader('Authorization', 'Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y');
 		xhr.setRequestHeader('Content-Type', 'application/json+nxrequest');
 		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
 		xhr.overrideMimeType('application/pdf');
 		xhr.responseType = 'blob';
 		xhr.onload = callback;
 		xhr.send(JSON.stringify({'params':{}}));
 	},
 	getBlob: function (doc, callback){
 		var xhr = new XMLHttpRequest();
 		xhr.open('POST', ['/nuxeo/api/v1/id/',doc.uid,'/@op/Blob.Get'].join(''), true);
 		xhr.setRequestHeader('Authorization', 'Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y');
 		xhr.setRequestHeader('Content-Type', 'application/json+nxrequest');
 		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
 		xhr.overrideMimeType(doc.properties['file:content']['mime-type']);
 		xhr.responseType = 'blob';
 		xhr.onload = callback;
 		xhr.send(JSON.stringify({'params':{}}));
 	},
}