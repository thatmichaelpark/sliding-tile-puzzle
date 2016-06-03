(function() {
  'use strict';
  window.puzzle = {};

  $('.modal-trigger.instructions').leanModal();
  $('.modal-trigger.imageSelector').leanModal({
    complete: function() {
      $('#thumbnails').empty();
    }
  });
  $('.picture-category').click(function(event) {
    window.loadThumbnails($(event.target).text());
  });
  $('form').submit(function(event) {
    event.preventDefault();
    window.loadThumbnails($('#tags').val());
  });

  $('#puzzleView').hide();

  $('#instructions').openModal();
})();
