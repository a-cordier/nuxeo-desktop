define(
  [
    'nuxeo',
    'jquery'
  ],
  function(nuxeo,$) {
    return {
    	createFile: function(files, parent){
    		var file=files[0];
    		var self = this;
    		alert(file.type);
    		var client = new nuxeo.Client();
    		client.operation('Document.Create')
			 .params({
			   type: 'File',
			   name: file.name,
			   properties: ['dc:title=',file.name].join('')
			 })
			 .input('doc:'+parent)
			 .execute(function(error, doc) {
			   if (error) {
			     throw error;
			   }
			   var id = doc.uid;
			   var reader = new FileReader();
			   reader.onload = function(evt){
			   		//self.attachBlob(evt.target.result, id);
			   }
			   //reader.readAsDataURL(file);   
			   self.attachBlob(file, id);
			});
		}, // createFile
		attachBlob: function(file, id){
			//alert(file);
			var client = new nuxeo.Client();
			// Create the uploader bound to the operation
			  var uploader = client.operation("Blob.Attach")
			  	.params({ document: id,
			  		save : true,
			  		xpath: "file:content"
			  	}).uploader();

			// Upload the file
			uploader.uploadFile(file, {mimeType: file.type, size: file.size}, function(fileIndex, file, timeDiff) {
			  // When done, execute the operation
			  uploader.execute(function(error, data) {
			    if (error) {
			      // something went wrong
			      throw error;
			    }
			    alert(data);
			  });
			});
 //execute
		}
  	};
 });