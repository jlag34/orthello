/*
    Othello! 
    
    Rules: http://www.wikihow.com/Play-Othello
    Example play-through: https://www.youtube.com/watch?v=2wAbQM98s78
    
    Here we have a working implementation of the game Othello. Clicking on the board will assign that cell to the current player, re-render the board, and update whose turn it is. 

    There is, however, one very important thing missing: THE RULES! 
    
    Currently the Game.doTurn() method is naieve and simply assigns the cell clicked to the current player and re-draws the board, even if the player clicks on another player's piece (see the TODO below).
    
    YOUR TASK: Implement the rules for flipping enemy pieces based on the newly placed piece as per the rules outlined in the link above. 
    
    IMPORTANT: For simpilicty, you can ignore the rule about having to place a piece in a cell that results in a flip, as well as the rules about passing turns and ending early. The game ends when all squares are full. 
    
    Remember that there are 8 directions that need to be checked for flips with every move, and each direciton is flipped in isolation; there is no ripple effect (i.e. flips made while scanning NORTH do not affect any potential flips while scanning NORTH EAST). Attempt to avoid a "copy-paste" solution for each of the 8 directions - there's a more elegant solution than that. 
    
    The code can be extended, refactored, or manipulated in any way to achieve the above goal. As always, code should be consise, clean, and efficient. 
    
    EXTRA CREDIT: 
    - Display a current score count for each player
    - Implement piece placement validation and game end conditions as described in the rules. 
    - Between turns, display *on the board* how many pieces would be flipped if the current player placed a piece in that square
*/

(function (window) {
  var PLAYER_RED = 1,
    PLAYER_BLUE = -1,
    PLAYER_NONE = 0,
    MAX_ROWS = 8,
    MAX_COLS = 8,
    numDirections = 8,
    red = 0,
    blue = 0;

  var Util = {
    cellIdForRowAndCol: function (r, c) {
      return "r" + r + "_c" + c;
    },
    rowAndColForCellId: function (cellId) {
      var coords = cellId.split('_');
      coords[0] = parseInt(coords[0].substr(1, coords[0].length));
      coords[1] = parseInt(coords[1].substr(1, coords[1].length));
      return coords;
    },
    cellContentsForPlayer: function (player) {
      if (player === PLAYER_RED) {
        red += 1;
        return '<div class="piece red"></div>';
      } else if (player === PLAYER_BLUE) {
        blue += 1;
        return '<div class="piece blue"></div>';
      }
      return '';
    }
  }

  var Game = {
    init: function () {
      var t_row, r, c, cellInitialized;
      this.board = [];

      //setup initial board state 
      //    - all empty, except middle 4 sqares which are alternating colors
      //        ( i.e. [3,3] = red, [3,4] = blue, [4,3] = red, [4,4] = blue ) 
      for (r = 0; r < MAX_ROWS; r += 1) {
        t_row = []
        for (c = 0; c < MAX_COLS; c += 1) {
          cellInitialized = false;
          if (r === 3) {
            if (c === 3) {
              t_row.push(PLAYER_RED);
              cellInitialized = true;
            } else if (c === 4) {
              t_row.push(PLAYER_BLUE);
              cellInitialized = true;
            }
          } else if (r === 4) {
            if (c === 3) {
              t_row.push(PLAYER_BLUE);
              cellInitialized = true;
            } else if (c === 4) {
              t_row.push(PLAYER_RED);
              cellInitialized = true;
            }
          }
          if (!cellInitialized) {
            t_row.push(PLAYER_NONE);
          }
        }
        this.board.push(t_row);
      }

      //setup click handlers
      $('.cell').on('click', this.cellClicked.bind(this));

      //red goes first
      this.currentPlayer = PLAYER_RED;

      return this;
    },
    drawBoard: function () {
      var t_row, t_col, r, c, cellId,
        currPlayer = this.currentPlayer === PLAYER_RED ? 'red' : 'blue';

      //draw all pieces on the board
      for (r = 0; r < MAX_ROWS; r += 1) {
        t_row = this.board[r];
        for (c = 0; c < MAX_COLS; c += 1) {
          cellId = '#' + Util.cellIdForRowAndCol(r, c);
          $(cellId).empty()
            .html(Util.cellContentsForPlayer(this.board[r][c]));
        }
      }

      //show current player
      $('#currentPlayer')
        .removeClass('blue').removeClass('red')
        .addClass(currPlayer)
        .text(currPlayer.toUpperCase());

      //Print score
      $('.redPoints').addClass('red').text(red);
      $('.bluePoints').addClass('blue').text(blue);

      //Reset scores back to 0 after printed
      red = 0; blue = 0;


      return this;
    },
    cellClicked: function (e) {
      var cellId = e.currentTarget.id,
        coords = Util.rowAndColForCellId(cellId);

      this.doTurn(coords[0], coords[1]);
    },

    /******************** TODO: Fix Me! ********************/

    axialCount: function (dir, row, column) {
      var listAdd = [];
      var stop = false;
      while (!stop) {
        
        //make sure that row doesn't go out of bounds
        if(row+dir[0] > 7 || row+dir[0] < 0) {
          console.log('in here')
          return;
        }
        
        
        if (this.board[row + dir[0]][column + dir[1]] === this.currentPlayer * -1) {
          listAdd.push([row += dir[0], column += dir[1]])
        } else if (this.board[row += dir[0]][column += dir[1]] === this.currentPlayer) {
          stop = true;
          return listAdd;
        } else {
          return;
        }

      }
    },

    doTurn: function (row, column) {
      //Implement the correct rules
      //All directions 
      var directions = {
        'UP': [0, 1],
        'UP_RIGHT': [1, 1],
        'RIGHT': [1, 0],
        'DOWN_RIGHT': [1, -1],
        'DOWN': [0, -1],
        'DOWN_LEFT': [-1, -1],
        'LEFT': [-1, 0],
        'UP_LEFT': [-1, 1]
      };
      
      //flips = array of all pieces needed to be flipped
      //newFlip = flips being added to total
      var flips = [], newFlip;

      //for each direction, pass to axialCount
      for (var key in directions) {
        newFlip = this.axialCount(directions[key], row, column);
        
        //if array and has length add to total flips
        if (Array.isArray(newFlip) && newFlip.length > 0) {
          flips = flips.concat(newFlip);
        }
      }
      //If/else prevents again bad piece placement
      if (flips.length > 0) {
        for (var i = 0; i < flips.length; i++) {
          this.board[flips[i][0]][flips[i][1]] = this.currentPlayer;
        }
        if (!this.board[row][column]) {
          this.board[row][column] = this.currentPlayer;
          this.currentPlayer *= -1;
          this.drawBoard();
        } else {
          return;
        }
      }
    }

    /*******************************************************/


  }

  window.Othello = Game;
})(window)

Othello.init().drawBoard();