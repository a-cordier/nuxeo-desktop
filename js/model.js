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
 	getContent: function(nuxeoResponse){
 		return {
 			parentUid: nuxeoResponse.parentUid,
 			parentTitle: nuxeoResponse.parentTitle,
 			children: nuxeoResponse.entries
 		};
 	},
 	getBlobAsPDF: function(doc){
 		return $.ajax({
 			url: ['/nuxeo/api/v1/id/',doc.uid,'/@blob/file:content/@op/Blob.ToPDF'].join(''),
 			type: 'POST',
 			contentType: 'application/json+nxrequest',
 			data: JSON.stringify({'params':{}}),
 			dataType: 'text',
 			beforeSend: function(xhr){
 				xhr.setRequestHeader('X-NXDocumentProperties','*');
 				xhr.setRequestHeader("Authorization", "Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y");
 			}
 		});	
 	},
 	// TODO : get info about how to handle this async
 	getBlob: function (doc){
 		var blob;
 		var xhr = new XMLHttpRequest();
 		xhr.open("POST", ['/nuxeo/api/v1/id/',doc.uid,'/@blob/file:content/@op/Blob.ToPDF'].join(''), true);
 		xhr.setRequestHeader('X-NXDocumentProperties','*');
 		xhr.setRequestHeader("Authorization", "Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y");
 		xhr.setRequestHeader("Content-Type", 'application/json+nxrequest');
 		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
 		xhr.overrideMimeType("application/pdf; charset=x-user-defined");
 		xhr.responseType = 'blob';
 		xhr.onload = function(e){
 			if(this.status == 200){
 				blob = this.response;
 				var fileURL = URL.createObjectURL(blob);
       			window.open(fileURL);
 			}
 		}
 		xhr.send(JSON.stringify({'params':{}}));
 		return blob;
 	},
}