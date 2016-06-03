(function() {
  'use strict';

  var $missing;
  var missingi;
  var missingj;
  var $tiles;
  var size;
  var tileWidth;
  var tileHeight;
  var moves;

  var isSolved = function() {
    for (var i = 0; i < size; ++i) {
      for (var j = 0; j < size; ++j) {
        var match = $tiles[i][j][0].id.match(/i(\d)+j(\d+)/);
        var k = Number(match[1]);
        var ll = Number(match[2]);

        if (i !== k || j !== ll) {
          return false;
        }
      }
    }

    return true;
  };

  var makeClickable = function() {
    var isInside = function(ii, jj) {
      return ii >= 0 && ii < size && jj >= 0 && jj < size;
    };

    var tryToMakeClickable = function(/* ii, jj, top, left, width, height,
      $div*/) {
      var ii = arguments[0]; // Hack to avoid eslint too-many-args error.
      var jj = arguments[1];
      var top = arguments[2];
      var left = arguments[3];
      var width = arguments[4];
      var height = arguments[5];
      var $div = arguments[6];

      if (isInside(ii, jj)) {
        $tiles[ii][jj].addClass('clickable');
        $div.css('top', top);
        $div.css('left', left);
        $div.css('width', width);
        $div.css('height', height);
        $tiles[ii][jj].draggable({
          containment: '.' + $div.attr('id') + '}',
          revert: true
        });
        $tiles[ii][jj].draggable('enable');
      }
    };

    $('canvas.clickable').draggable('disable');
    $('canvas').removeClass('clickable');
    var i = missingi;
    var j = missingj;

    tryToMakeClickable(i + 1, j, i * tileHeight, j * tileWidth,
      tileWidth, tileHeight * 2, $('#channel0'));
    tryToMakeClickable(i - 1, j, (i - 1) * tileHeight, j * tileWidth,
      tileWidth, tileHeight * 2, $('#channel1'));
    tryToMakeClickable(i, j + 1, i * tileHeight, j * tileWidth,
      tileWidth * 2, tileHeight, $('#channel2'));
    tryToMakeClickable(i, j - 1, i * tileHeight, (j - 1) * tileWidth,
      tileWidth * 2, tileHeight, $('#channel3'));
    $('.droptarget').css('top', missingi * tileHeight);
    $('.droptarget').css('left', missingj * tileWidth);
    $('.droptarget').css('width', tileWidth);
    $('.droptarget').css('height', tileHeight);
  };

  $('#puzzleDiv').on('click', 'canvas.clickable', function(event) {
    moves += 1;
    var $tile = $(event.target);
    var i = parseInt($tile.css('top')) / tileHeight;
    var j = parseInt($tile.css('left')) / tileWidth;
    var temp = $tile.css('top');

    (function() { // IIFE hack to avoid eslint fn-too-long error.
      $tile.css('top', $missing.css('top'));
      $missing.css('top', temp);
      temp = $tile.css('left');
      $tile.css('left', $missing.css('left'));
      $missing.css('left', temp);
      temp = $tiles[i][j];
      $tiles[i][j] = $tiles[missingi][missingj];
      $tiles[missingi][missingj] = temp;
      missingi = i;
      missingj = j;
    })();
    if (isSolved()) {
      $('#puzzleDiv').prepend($missing);
      window.Materialize.toast('Solved in ' + moves + ' moves!', 4000);
      missingi = -1;
      missingj = -1;
    }
    makeClickable();
  });

  var makePuzzle = function(img, mm) {
    var width = img.width;
    var height = img.height;
    var i;
    var j;
    var $row;
    var $canvas;
    var ctx;
    var drawOutline = function(ww, hh) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ww, 0);
      ctx.lineTo(ww, hh);
      ctx.lineTo(0, hh);
      ctx.closePath();
      ctx.stroke();
    };

    var createCanvas = function(ii, jj) {
      $canvas = $('<canvas>');
      $canvas.ii = ii;
      $canvas.jj = jj;
      $canvas.attr('id', 'i' + ii + 'j' + jj);
    };

    (function() { // Hack to avoid eslint fn-too-long error.
      size = mm;
      moves = 0;
      $tiles = [];

      tileWidth = Math.floor(width / mm);
      tileHeight = Math.floor(height / mm);
      $('#puzzleView').css('width', width + 20);
      $('#puzzleView').css('height', height + 20);
      $('#puzzleDiv').empty();
      $('#puzzleDiv').css('width', width);
      $('#puzzleDiv').css('height', height);

      $('#puzzleDiv').append($('<div id="channel0" class="channel0">'));
      $('#puzzleDiv').append($('<div id="channel1" class="channel1">'));
      $('#puzzleDiv').append($('<div id="channel2" class="channel2">'));
      $('#puzzleDiv').append($('<div id="channel3" class="channel3">'));
      $('#puzzleDiv').append($('<div class="droptarget">'));
    })();

    (function() { // Hack to avoid eslint fn-too-long error.
      for (i = 0; i < mm; ++i) {
        $row = [];
        for (j = 0; j < mm; ++j) {
          createCanvas(i, j);
          $canvas.attr('width', tileWidth);
          $canvas.attr('height', tileHeight);
          ctx = $canvas[0].getContext('2d');
          ctx.drawImage(img, tileWidth * j, tileHeight * i,
            tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
          drawOutline(tileWidth, tileHeight);
          $row.push($canvas);
        }
        $tiles.push($row);
      }
      missingi = Math.floor(Math.random() * mm);
      missingj = Math.floor(Math.random() * mm);
      $missing = $tiles[missingi][missingj];
    })();

    var swapi;
    var swapj;

    (function() { // Hack to avoid eslint fn-too-long error.
      for (i = 0; i < mm; ++i) {
        do {
          swapi = missingi;
          swapj = missingj;
          if (Math.random() < 0.5) {
            swapi += Math.random() < 0.5 ? -1 : 1;
          }
          else {
            swapj += Math.random() < 0.5 ? -1 : 1;
          }
        } while (swapi < 0 || swapi >= mm || swapj < 0 || swapj >= mm);
        var $temp = $tiles[swapi][swapj];

        $missing = $tiles[swapi][swapj] = $tiles[missingi][missingj];
        $tiles[missingi][missingj] = $temp;
        missingi = swapi;
        missingj = swapj;
      }
    })();
    (function() { // Hack to avoid eslint fn-too-long error.
      for (i = 0; i < mm; ++i) {
        for (j = 0; j < mm; ++j) {
          $tiles[i][j].css('top', tileHeight * i);
          $tiles[i][j].css('left', tileWidth * j);
          if (i !== missingi || j !== missingj) {
            $('#puzzleDiv').append($tiles[i][j]);
          }
        }
      }
      makeClickable();
    })();
  };

  window.puzzle.create = function(url) {
    var img = new window.Image();

    img.addEventListener('load', function() {
      makePuzzle(img, 4);
    });
    img.setAttribute('src', url);
  };
})();
