define(
  ['common/model'],
  function(model) {
    return {
      isFolderish: function(doc) {
        window.console.log(JSON.stringify(doc));
        return doc.facets.indexOf('Folderish') > -1 ||
          doc.facets.indexOf('Collection') > -1;
      },
      cropTitle: function(title) {
        return title.length > 8 ? title.substring(0, 5) + '...' : title;
      },
      saveToCache: function(key, data) {
        /* feed cache to allow preview / next navigation */
        var history = model.cache.get(key) || {
          cursor: -1,
          data: []
        };
        history.data.push(data);
        history.cursor++; // keeping a track on the currently opened document
        window.console.log("saving to cache - cursor: " + history.cursor);
        model.cache.set(key, history);
      },
      guid: function() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }
    };
  });