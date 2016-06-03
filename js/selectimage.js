(function() {
  'use strict';
  window.loadThumbnails = function(searchTerms) {
    var url = 'https://api.flickr.com/services/rest/';
    var params = {
      method: 'flickr.photos.search',
      format: 'json',
      nojsoncallback: 1,
      tags: searchTerms
    };

    // Hack to avoid eslint camelCase error.
    var apiKey = 'api_key';

    params[apiKey] = 'df4aa9f4273411fa40e04118919f080f';

    $.getJSON(url, params, function(data) {
      var makeUrl = function(foto) {
        return 'https://farm' + foto.farm + '.staticflickr.com/' +
          foto.server + '/' + foto.id + '_' + foto.secret + '.jpg';
      };

      $('#thumbnails').empty();
      for (var i = 0; i < data.photos.photo.length; ++i) {
        var photo = data.photos.photo[i];
        var photoUrl = makeUrl(photo);
        var thumbnailUrl = photoUrl.slice(0, -4) + '_t.jpg';
        var $a = $('<a>').attr('href', photoUrl);

        $a.append($('<img>').attr('src', thumbnailUrl));
        $('#thumbnails').append($a);
      }
    });
  };

  $('#thumbnails').on('click', 'a', function(event) {
    $('#imageSelector').closeModal();
    $('#puzzleView').show();
    event.preventDefault();
    window.puzzle.create(event.currentTarget.href);
  });
})();
