/**
 * @author: com.acordier@gmail.com
 * @update: sept. 2014
 * fetching data from nuxeo server 
 * using rest calls 
 * storing constants
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
 	/* get children for the given document
  this function does not operate recursivly */
 	getChildren: function(doc){
 		return $.ajax({
 			url: ['/nuxeo/api/v1/id/',doc.uid,'/@children'].join(''),
 			type: 'GET',
 			dataType: 'json',
 			success: function(data){
 				data.uid = doc.uid;
 				data['title'] = doc.title;
 			},
      headers: {'X-NXDocumentProperties':'*'}
 		});	
 	},
  /* get children for the current document using fine grain options
  TODO: merge with getChildren */
  getChildrenWithQuery: function(doc, options){
    var query="select * from Document where ecm:parentId='"+doc.uid+"'";
    if(typeof options === 'undefined' || 'true' !== options.includeHidden){
        query+=" AND ecm:mixinType !='HiddenInNavigation'"; 
    }
    if(typeof options !== 'undefined' && options.childrenType !== 'undefined'){
        query+=" AND ecm:primaryType ='" + options.docType + "'"; 
    }
    return model.query(query, {'eager':'true'});
  },
  query: function(query, options){
    return $.ajax({
      url:'/nuxeo/api/v1/query?query='+query,
      type: 'GET',
      dataType: 'json',
      headers: {'X-NXDocumentProperties':'*'}
    });
    
  },
 	/* get result of the getChildren operation and add a ref to parent */
 	getContent: function(data){
 		return {
 			uid: data.uid,
 			title: data['title'],
 			children: data.entries
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
 		xhr.open('GET', ['/nuxeo/api/v1/id/',doc.uid,'/@blob/file:content'].join(''), true);	
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
  createFolder: function(parent, name, hidden){
    return $.ajax({
      url: '/nuxeo/api/v1/path' + parent.path,
      type: 'POST',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify({ 
        "entity-type":"document",
        "name": name ,
        "type": (hidden==true? 'HiddenFolder':'Folder') ,
        "properties": {"dc:title": name }})
    });     
  },
  getSession: function(username, password){
 		return $.ajax({
       type: "GET",
       dataType: 'json',
       url: '/nuxeo/api/v1/path/default-domain/UserWorkspaces/' + username,
       beforeSend: function(xhr){
         xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username+':'+password));
       }
    });
 	},
  getCalendars: function(username){
      return $.ajax({
      url: '/nuxeo/api/v1/path/default-domain/UserWorkspaces/' + username + '/.agendas',
      type: 'GET',
      dataType: 'json'
    });
  },
  createEvent: function(calendar, fcEvent){
    var username = $.cookie("nxuser");
     return $.ajax({
      url: ['/nuxeo/api/v1/path/default-domain/UserWorkspaces/', username, '/.agendas/', calendar].join(''),
      type: 'POST',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify({ 
        "entity-type":"document",
        "name": fcEvent.title ,
        "type": "VEVENT",
        "properties": {
          "dc:title": fcEvent.title,
          "vevent:location": fcEvent.location,
          "vevent:dtstart": fcEvent.start,
          "vevent:dtend": fcEvent.end
         }
      })
    });     
  }, /* this id generation function is used to 
  keep every window attached to a unique id and isolate its context */
 	guid: function() {

  		function s4() {
    		return Math.floor((1 + Math.random()) * 0x10000)
      		.toString(16)
      		.substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    		s4() + '-' + s4() + s4() + s4();
	}, /* document cache used to keep tracks of visited document
  (the navbar neeeds it)
  */
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
        delete this.memory[key];
      }
    },
    hasKey: function(key){
      return typeof(this.memory[key]) !== 'undefined';
    }
  }
}