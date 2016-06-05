(function() {
  'use strict';

  let moves;          // Counts player's moves.

  const puzzle = {    // Puzzle object.
    size: 4,          // Puzzle is size x size tiles.
    $tiles: null,     // size x size array of $canvas objects.
    $missing: null,   // The missing piece; points to element of $tile array.
    tileWidth: 0,     // Width in pixels of a tile on screen.
    tileHeight: 0,    // Height in pixels of a tile on screen.
    isSolved() {
      for (let i = 0; i < this.size; ++i) {
        for (let j = 0; j < this.size; ++j) {
          // Turn tile id ('i#j#'') into i0, j0.
          const match = puzzle.$tiles[i][j][0].id.match(/i(\d)+j(\d+)/);
          const i0 = Number(match[1]);
          const j0 = Number(match[2]);

          if (i !== i0 || j !== j0) {
            return false;
          }
        }
      }

      return true;
    }
  };

  const swapWithMissingTile = (clicked) => {
    const id = clicked.id;
    for (let i = 0; i < puzzle.size; ++i) {
      for (let j = 0; j < puzzle.size; ++j) {
        if (puzzle.$tiles[i][j][0].id === id) {
          const $tile = puzzle.$tiles[i][j];
          // $tile.css('top', puzzle.$missing.css('top'));
          puzzle.$missing.css('top', i * puzzle.tileHeight);
          // $tile.css('left', puzzle.$missing.css('left'));
          puzzle.$missing.css('left', j * puzzle.tileWidth);
          let temp = puzzle.$tiles[i][j];
          puzzle.$tiles[i][j] = puzzle.$tiles[puzzle.$missing.i][puzzle.$missing.j];
          puzzle.$tiles[puzzle.$missing.i][puzzle.$missing.j] = temp;
          puzzle.$tiles[puzzle.$missing.i][puzzle.$missing.j].i = puzzle.$missing.i;
          puzzle.$tiles[puzzle.$missing.i][puzzle.$missing.j].j = puzzle.$missing.j;
          puzzle.$missing.i = i;
          puzzle.$missing.j = j;
          return;
        }
      }
    }
  };

  const makeClickable = function() {
  // Makes the tiles around $missing clickable.

    const isInside = function(ii, jj) {
      return ii >= 0 && ii < puzzle.size && jj >= 0 && jj < puzzle.size;
    };

    const tryToMakeClickable = function(...args) {
    // args: ii, jj, top, left, width, height, $div

      const ii = args[0]; // Hack to avoid eslint too-many-args error.
      const jj = args[1];
      const top = args[2];
      const left = args[3];
      const width = args[4];
      const height = args[5];
      const $div = args[6];

      if (isInside(ii, jj)) {
        puzzle.$tiles[ii][jj].addClass('clickable');
        $div.css('top', top);
        $div.css('left', left);
        $div.css('width', width);
        $div.css('height', height);
        puzzle.$tiles[ii][jj].draggable({
          start: (event, ui) => {
            $(event.target).draggable({
              'revert': true,
              revertDuration: 0
            });
          },
          containment: `.${$div.attr('id')}`,
          disabled: false,
          revert: false
        });
      }
    };

    $('canvas.clickable').draggable('disable');
    $('canvas').removeClass('clickable');
    const i = puzzle.$missing.i;
    const j = puzzle.$missing.j;

    tryToMakeClickable(i + 1, j,
      i * puzzle.tileHeight, j * puzzle.tileWidth,
      puzzle.tileWidth, puzzle.tileHeight * 2, $('#channel0'));
    tryToMakeClickable(i - 1, j,
      (i - 1) * puzzle.tileHeight, j * puzzle.tileWidth,
      puzzle.tileWidth, puzzle.tileHeight * 2, $('#channel1'));
    tryToMakeClickable(i, j + 1,
      i * puzzle.tileHeight, j * puzzle.tileWidth,
      puzzle.tileWidth * 2, puzzle.tileHeight, $('#channel2'));
    tryToMakeClickable(i, j - 1,
      i * puzzle.tileHeight, (j - 1) * puzzle.tileWidth,
      puzzle.tileWidth * 2, puzzle.tileHeight, $('#channel3'));
    $('.droptarget').css('top', puzzle.$missing.i * puzzle.tileHeight);
    $('.droptarget').css('left', puzzle.$missing.j * puzzle.tileWidth);
    $('.droptarget').css('width', puzzle.tileWidth);
    $('.droptarget').css('height', puzzle.tileHeight);
    $('.droptarget').droppable({
      drop: (event, ui) => {
        ui.draggable.position( { my: 'center', at: 'center', of: event.target } );
        ui.draggable.draggable( 'option', 'revert', false );
        swapWithMissingTile(ui.draggable[0]);
        moves += 1;
        if (puzzle.isSolved()) {
          $('#puzzleDiv').prepend(puzzle.$missing);
          window.Materialize.toast(`Solved in ${moves} moves!`, 4000);
          puzzle.$missing.i = -1;
          puzzle.$missing.j = -1;
        }
        makeClickable();
      }
    });
  };

  $('#puzzleDiv').on('click', 'canvas.clickable', (event) => {
    swapWithMissingTile(event.target);

    moves += 1;
    if (puzzle.isSolved()) {
      $('#puzzleDiv').prepend(puzzle.$missing);
      window.Materialize.toast(`Solved in ${moves} moves!`, 4000);
      puzzle.$missing.i = -1;
      puzzle.$missing.j = -1;
    }
    makeClickable();
  });

  const makePuzzle = function(img, mm) {
    const drawOutline = function(ctx, ww, hh) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ww, 0);
      ctx.lineTo(ww, hh);
      ctx.lineTo(0, hh);
      ctx.closePath();
      ctx.stroke();
    };

    const createCanvas = function(i, j) {
      const $canvas = $('<canvas>');

      $canvas.i = i;
      $canvas.j = j;
      $canvas.attr('id', `i${i}j${j}`);

      return $canvas;
    };

    const initTiles = () => {
      puzzle.size = mm;
      moves = 0;
      puzzle.$tiles = [];
      const width = img.width;
      const height = img.height;

      puzzle.tileWidth = Math.floor(width / puzzle.size);
      puzzle.tileHeight = Math.floor(height / puzzle.size);
      $('#puzzleView').css('width', width + 20);
      $('#puzzleView').css('height', height + 20);
      $('#puzzleDiv').empty();
      $('#puzzleDiv').css('width', width);
      $('#puzzleDiv').css('height', height);

      // Stuff for drag&drop (someday):
      $('#puzzleDiv').append($('<div id="channel0" class="channel0">'));
      $('#puzzleDiv').append($('<div id="channel1" class="channel1">'));
      $('#puzzleDiv').append($('<div id="channel2" class="channel2">'));
      $('#puzzleDiv').append($('<div id="channel3" class="channel3">'));
      $('#puzzleDiv').append($('<div class="droptarget">'));
    };

    const renderTiles = () => {
      for (let i = 0; i < puzzle.size; ++i) {
        const $row = [];

        for (let j = 0; j < puzzle.size; ++j) {
          const $canvas = createCanvas(i, j);

          $canvas.attr('width', puzzle.tileWidth);
          $canvas.attr('height', puzzle.tileHeight);

          const ctx = $canvas[0].getContext('2d');

          ctx.drawImage(img,
            puzzle.tileWidth * j, puzzle.tileHeight * i,
            puzzle.tileWidth, puzzle.tileHeight,
            0, 0,
            puzzle.tileWidth, puzzle.tileHeight);
          drawOutline(ctx, puzzle.tileWidth, puzzle.tileHeight);
          $row.push($canvas);
        }
        puzzle.$tiles.push($row);
      }
      puzzle.$missing = puzzle.$tiles[Math.floor(Math.random() * puzzle.size)
        ][Math.floor(Math.random() * puzzle.size)];
    };

    const shuffleTiles = () => {
      let swapi;
      let swapj;

      // (Increase # iterations for more thorough randomizing.)
      for (let i = 0; i < 7; ++i) {
        do {
          swapi = puzzle.$missing.i;
          swapj = puzzle.$missing.j;
          if (Math.random() < 0.5) {
            swapi += Math.random() < 0.5 ? -1 : 1;
          }
          else {
            swapj += Math.random() < 0.5 ? -1 : 1;
          }
        } while (swapi < 0 || swapi >= puzzle.size ||
                 swapj < 0 || swapj >= puzzle.size);

        let mi = puzzle.$missing.i;
        let mj = puzzle.$missing.j;
        const $temp = puzzle.$tiles[swapi][swapj];
        puzzle.$tiles[swapi][swapj] = puzzle.$tiles[mi][mj];
        puzzle.$tiles[swapi][swapj].i = swapi;
        puzzle.$tiles[swapi][swapj].j = swapj;
        puzzle.$tiles[mi][mj] = $temp;
        puzzle.$tiles[mi][mj].i = mi;
        puzzle.$tiles[mi][mj].j = mj;

        puzzle.$missing = puzzle.$tiles[swapi][swapj];
      }
    };

    const appendTiles = () => {
      for (let i = 0; i < mm; ++i) {
        for (let j = 0; j < mm; ++j) {
          puzzle.$tiles[i][j].css('top', puzzle.tileHeight * i);
          puzzle.$tiles[i][j].css('left', puzzle.tileWidth * j);
          if (i !== puzzle.$missing.i || j !== puzzle.$missing.j) {
            $('#puzzleDiv').append(puzzle.$tiles[i][j]);
          }
        }
      }
    };

    initTiles();
    renderTiles();
    shuffleTiles();
    appendTiles();
    makeClickable();
  };

  window.createPuzzle = function(url) {
    const img = new window.Image();

    img.addEventListener('load', () => {
      makePuzzle(img, 3);
    });
    img.setAttribute('src', url);
  };
})();
