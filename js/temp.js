jQuery(document).ready(function($) {
    /* drag and drop listeners */
    var folder1 = $("#folder1");
    folder1.on('dragenter', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
        $(this).css('border', '2px dotted #AAAAAA');
    });
    folder1.on('dragover', function (e)
    {
       e.stopPropagation();
       e.preventDefault();

   });
    folder1.on('drop', function (e)
    {

       $(this).css('border', 'none');
       e.preventDefault();
       var files = e.originalEvent.dataTransfer.files;

     //We need to send dropped files to Server
     handleFileUpload(files,folder1);
    }); 
    /* ends drag and drop listeners */
    /* draggable components */
    folder1.draggable();
    /* ends draggable components */    
    var folder1 = $("#folder1");
    folder1.on('dragenter', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
    });
    /* Prevents default browser Drag and drop handling */
    $(document).on('dragenter', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
    });
    $(document).on('dragover', function (e)
    {
      e.stopPropagation();
      e.preventDefault();
  });
    $(document).on('drop', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
    });
    /* ends: Prevents default browser Drag and drop handling  */
});

var view = {

};

 $(function(){ 
  $('#div18').dblclick({ 
    param1: '#scrollspan9', 
    param2: 'dblclick ', 
    param3: '**JavaScript event triggered** ' 
  }, addText2); 
  function addText2(event) { 
    $(event.data.param1).append(
      event.data.param2 + ''<code>' + event.data.param3+ ''</code>'); 
  } 
}); 