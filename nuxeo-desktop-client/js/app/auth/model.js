define(['jquery'],
  function($) {
    return {
      getSession: function(username, password) {
        return $.ajax({
          type: "GET",
          dataType: 'json',
          url: '/nuxeo/api/v1/path/default-domain/UserWorkspaces/' + username,
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
          }
        });
      }
    };
  });