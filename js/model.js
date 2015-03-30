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
 		APP: {
 			EXPLORER: 0
 		}
 	},
 	/* Root document is used to init desktop */
 	getRoot: function(username){
 		return $.ajax({
 			url: '/nuxeo/api/v1/path/default-domain/UserWorkspaces/' + username,
 			type: 'GET',
 			dataType: 'json'
 		});    	
 	},
 	/* self explanatory */
 	getChildren: function(doc){
 		return $.ajax({
 			url: ['/nuxeo/api/v1/id/',doc.uid,'/@children'].join(''),
 			type: 'GET',
 			dataType: 'json',
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
 	/* TODO get blob as stream */
 	getDocumentById: function (id){
 		
 	},
 	getToken: function(username, password){
 		return $.ajax({
          	type: "GET",
          	dataType: 'text',
          	url: '/nuxeo/authentication/token?applicationName=Nuxeo%20Desktop&deviceId=' +
          	model.guid() +
          	'&deviceDescription=Nuxeo%20desktop&permission=rw',
 			beforeSend: function(xhr){
 				xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username+':'+password));
 			},
 			error: function (xhr, ajaxOptions, thrownError) {
 				//TODO feedback to user
     		 }
    	});
 	},
 	guid: function() {
  		function s4() {
    		return Math.floor((1 + Math.random()) * 0x10000)
      		.toString(16)
      		.substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    		s4() + '-' + s4() + s4() + s4();
	},
  cache: {
    init: function(){
      if(typeof(this.memory) === 'undefined'){
        this.memory = {};
      }
    },
    get: function(key){
      if(!this.hasKey(key)){
        return false;
      }
      return this.memory[key];
    },
    set: function(key, value){
      this.memory[key] = value;
    },
    delete: function(key){
      if(this.hasKey(key)){
        delete cache[key];
      }
    },
    hasKey: function(key){
      return typeof(this.memory[key]) !== 'undefined';
    }
  }
}