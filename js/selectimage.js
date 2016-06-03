(function() {
  'use strict';
  window.loadThumbnails = (searchTerms) => {
    const url = 'https://api.flickr.com/services/rest/';
    const params = {
      method: 'flickr.photos.search',
      format: 'json',
      nojsoncallback: 1,
      tags: searchTerms
    };

    // Hack to avoid eslint camelCase error.
    const apiKey = 'api_key';

    params[apiKey] = 'df4aa9f4273411fa40e04118919f080f';

    $.getJSON(url, params, (data) => {
      const makeUrl = (foto) => {
        return `https://farm${foto.farm}.staticflickr.com/` +
        `${foto.server}/${foto.id}_${foto.secret}.jpg`;
      };

      $('#thumbnails').empty();
      for (let i = 0; i < data.photos.photo.length; ++i) {
        const photo = data.photos.photo[i];
        const photoUrl = makeUrl(photo);
        const thumbnailUrl = `${photoUrl.slice(0, -4)}_t.jpg`;
        const $a = $('<a>').attr('href', photoUrl);

        $a.append($('<img>').attr('src', thumbnailUrl));
        $('#thumbnails').append($a);
      }
    });
  };

  $('#thumbnails').on('click', 'a', (event) => {
    $('#imageSelector').closeModal();
    $('#puzzleView').show();
    event.preventDefault();
    window.createPuzzle(event.currentTarget.href);
    $('#thumbnails').empty();
  });
})();
