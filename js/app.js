(function() {
  'use strict';
  window.puzzle = {};

  $('.modal-trigger.instructions').leanModal();
  $('.modal-trigger.imageSelector').leanModal({
    complete: () => {
      // $('#thumbnails').empty();
    }
  });
  $('.picture-category').click((event) => {
    window.loadThumbnails($(event.target).text());
  });
  $('form').submit((event) => {
    event.preventDefault();
    window.loadThumbnails($('#tags').val());
  });

  $('#puzzleView').hide();

  $('#instructions').openModal();
})();
