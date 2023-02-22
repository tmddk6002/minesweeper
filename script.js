//Global variables.
var smileyId = document.getElementById("smiley");
var mineRemainder = document.getElementsByClassName("mineRemainder");
var minefield = document.querySelectorAll(".minefield");
var box = document.getElementsByClassName("box");
var revealedBoxes = document.getElementsByClassName("boxAfter");
var flaggedBoxes = document.getElementsByClassName("flagged");
var emptyArray = [];
var mineCount = 10;
var flagCount = 10;
var pass = false;
var gameOver = false;
var mineArray = [];
let mineLog = [];
var firstBox = true;
var fieldOfMines = [];
var test = 0;

//This initializes the right click function.
rightClickHandler();
leftClickHandler();

//This disables the right click context menu.
document.oncontextmenu = function() {
    return false;
}

//This checks if you are left clicking on a box, revealing the "afraid" face for the duration.
function isBox() {  
  for(i=0;i<box.length;i++) {
  box[i].onmousedown = function(e) { 
       if (e.which===1&&!firstBox&&(!this.classList.contains("flagged"))) {              
         document.getElementById("smiley").style.backgroundImage = 'url("https://image.ibb.co/fuu71J/Smiley02.png")';
        }
      }
    }
  }

//Pressing left mouse button will trigger the function to see if you are pressing on a box.
document.getElementById("minesweeper").onmousedown = function(event) {
    if (event.which===1||event.which===3) {
      isBox();
      }}

//This passes on the values of the box that is right clicked.
function rightClickHandler() {
  for(i=0;i<box.length;i++) {
    box[i].addEventListener("contextmenu", function() {
      rightClickBox(this);
    }) 
  }
}

function leftClickHandler() {
  for(i=0;i<box.length;i++) {
    box[i].addEventListener("click", function(e) {
      for(j=0;j<box.length;j++) {
        if (this===box[j]) {
          selectBox(j);
        }
      }
    })
  }
}

//This adds a class to the button that causes it to be hidden, also returns the default smiley.
function selectBox(x) {
  if (firstBox) {
    createMinefield(x);
    firstBox = false;
    countSeconds();
  }
  smileyId.style.backgroundImage = 'url("https://image.ibb.co/dzwy8y/smiley01.png")';
  if (!box[x].classList.contains("flagged")) {
    revealSelectedBox(x);
    smileyId.style.backgroundImage = 'url("https://image.ibb.co/dzwy8y/smiley01.png")';
    checkForMine(x);
    checkForEmpty(x);
  }
  if (revealedBoxes.length===71) {
    winGame();
  }
  }

//This is used to reveal the box that is interacted with.
function revealSelectedBox(y) {
  if (!box[y].classList.contains("flagged")&&!box[y].classList.contains("boxAfter")) {
    box[y].classList.add('boxAfter');
  }
}

//This looks for right clicks and assigns flags on first click, and a question mark on the second click.
function rightClickBox(x) {
  if (x.classList.contains("flagged")) {
    x.classList.remove("flagged");
    x.classList.add("question_mark");
  } else if (x.classList.contains("question_mark")) {
    x.classList.remove("question_mark");
  } else {
    x.classList.add("flagged");  
  }
  adjustMineCounter();
}

//This resets the board without refreshing the page.
function resetGame() {
  for (z=0;z<81;z++) {
    box[z].classList.remove('boxAfter');
    box[z].classList.remove('flagged')
    box[z].classList.remove('question_mark')    
    minefield[z].style.backgroundImage = "";
    minefield[z].style.backgroundColor = "#CCCCCC";
    minefield[z].classList.remove("empty_space");
    pass = false;
    gameOver = false;
    emptyArray = [];
    firstBox = true;
    adjustMineCounter();
    assignDigit(0, document.querySelector("#timer_digit_one"));
    assignDigit(0, document.querySelector("#timer_digit_two"));
    assignDigit(0, document.querySelector("#timer_digit_three"));
  }
}

//This systematically reveals each square individually.
function revealAll() {
  for (n=0;n<81;n++) {
    box[n].classList.add('boxAfter');
  }
}

//This sets the board to a losing state.
function loseGame() {
  if (firstBox) {
    resetGame();
    createMinefield(Math.floor(Math.random() * 81));
  }
  smileyId.style.backgroundImage = 'url("https://image.ibb.co/gyxiad/Smiley04.png")';
  gameOver = true;
  }

//This sets the board to a winning state
function winGame() {
  if (firstBox) {
    resetGame();
    createMinefield(Math.floor(Math.random() * 81));
  }
  smileyId.style.backgroundImage = 'url("https://image.ibb.co/bwFrTy/Smiley03.png")';
  gameOver = true;
 }

//This sets the smiley back to default, along with the mine counter.
function resetSmile() {
  smileyId.style.backgroundImage = 'url("https://image.ibb.co/dzwy8y/smiley01.png")';
}

// This decides which boxes will have mines, executed after the firstBox is decided, then creates the array
function createMinefield(y) {
  makeMineArray(y);
  createMineLog(mineArray, 9, 80);
  makeNumbers(mineLog)
  changeToMine();
  assignValues();
}

//This makes the array telling the algorithm where the mines are located
function makeMineArray(x) {
  mineArray = [];
  mineArray.push(x);
  for(i=0;i<10;i++) {
    var n = Math.floor(Math.random() * 81);
    if (mineArray.findIndex(function(e){return e===n})>=0) {
      i--
    } else if (mineArray.findIndex(function(e){return e===n})<0){
      mineArray.push(n);
    } 
    }
  mineArray.shift();
  mineArray.sort((a, b) => a - b);
}

//This is executed with selectBox() and will check if they have clicked a mine square.
function checkForMine(y) {
  for(i=0;i<mineArray.length;i++) {
    if (y===mineArray[i]) {
      loseGame(y);
      revealAll();
      minefield[y].style.backgroundImage = 'url("https://image.ibb.co/iJW4Qf/mineblew.png")';
      minefield[y].style.backgroundColor = 'red';
      gameOver = true;
    }
  }
}

function checkForEmpty(y) {
  if(minefield[y].classList.contains("empty_space")) {
    var a = emptyArray.length;
    var b = 0;
    emptyArray = [];
    pass = false;
    emptyArray.push(y);
    while (!pass) {
      a = emptyArray.length;
      emptyArray.forEach(function(e){
        findAllEmpty(e);
      })
      removeDuplicates();
      b = emptyArray.length;
      if (a===b) {
        pass = true;
      }
    }
    if (pass) {
      emptyArray.forEach(function(e){revealSurroundings(e);})
    }
  }
}

function findAllEmpty(y) {
  checkLeft(y);
  checkRight(y);
  if (y<9) {
    checkBelow(y);     
  } else if (y>71) {
    checkAbove(y);
  } else {
    checkAbove(y);
    checkBelow(y);
  }
}

function filterEmpty(z) {
  if(minefield[z].classList.contains("empty_space")) {
    emptyArray.push(z)
  }
  
}

function removeDuplicates() {
  emptyArray.sort((a, b) => a - b);
  for(i=0;i<emptyArray.length-1;i++) {
    if (emptyArray[i]===emptyArray[i+1]) {
      emptyArray.splice(i, 1);
      i=-1;
    }
  }
}

function checkAbove(z) {
  if (Number.isInteger(z/9)) {
    filterEmpty(z-8);
    filterEmpty(z-9);
  } else if (Number.isInteger((z+1)/9)) {
    filterEmpty(z-9);
    filterEmpty(z-10);
  } else {
    filterEmpty(z-9);
    filterEmpty(z-8);
    filterEmpty(z-10);
  }
}

function checkBelow(z) {
  filterEmpty(z+9);
  if (Number.isInteger(z/9)) {
    filterEmpty(z+10);
  } else if (Number.isInteger((z+1)/9)) {
    filterEmpty(z+8);
  } else {
    filterEmpty(z+8);
    filterEmpty(z+10);
  }
}

function checkLeft(z) {
  if (!Number.isInteger(z/9)) {
    filterEmpty(z-1);
  }
}

function checkRight(z) {
    if (!Number.isInteger((z+1)/9)) {
    filterEmpty(z+1);
  }
}

function createMineLog(chosenArray, rowLength, revealAmount) {
  mineLog = [];
  var a = [];
  var b = [];
  for(i=0;i<revealAmount+1;i++) {
    a.push(false);
  }
  for(i=0;i<chosenArray.length;i++) {
    for(j=0;j<a.length;j++) {
      if (chosenArray[i]===j) {
        a.splice(j, 1, true);
      }
    }
  }
  for(i=0;i<rowLength;i++) {
    b = [];
    for(j=0;j<rowLength;j++) {
      b.push(a[0])
      a.shift();
    }
    mineLog.push(b);
  }
}

function makeNumbers(m) {
  let c = []
  let a = []
  let v = 0
  let x = m[0].length
  let y = m.length
  for (i=0;i<y;i++) {
    for (j=0;j<x;j++) {
      c.push(0)
      }
      a.push(c)
    c=[]
  }
  for (i=0;i<y;i++) {
    for(j=0;j<x;j++) {
      for(k=i-1;k<i+2;k++) {
        for(l=j-1;l<j+2;l++) {
          if (k<0||l<0||k>y-1||l>x-1||(l===j&&k===i)) {
            v++
          } else if (m[k][l]) {
            a[i][j]++
          }
        }
      }   
    }
  }
  fieldOfMines = a;
}

function changeToMine() {
  for(i=0;i<mineArray.length;i++) {
    var w = mineArray[i]/9;
    var x = Math.floor(w);
    var y = Math.floor((w-x) * 10);
    fieldOfMines[x].splice(y, 1, "x");
  }
}

function assignValues() {
  for(i=0;i<minefield.length;i++) {
    var w = i/9;
    var x = Math.floor(w);
    var y = Math.floor((w-x) * 10);
    minefield[i].style.backgroundSize = "80%";
    minefield[i].style.backgroundRepeat = "no-repeat";
     minefield[i].style.backgroundPosition = "center";
    if (fieldOfMines[x][y]==="x") {
      minefield[i].style.backgroundImage = 'url("https://image.ibb.co/eLA9rL/minebomb.png")';
    } else if (fieldOfMines[x][y]===1) {
      minefield[i].style.backgroundImage = 'url("https://image.ibb.co/gBCB5f/mine1.png")';
    } else if (fieldOfMines[x][y]===2) {
      minefield[i].style.backgroundImage = 'url("https://image.ibb.co/m6xNBL/mine2.png")';
    } else if (fieldOfMines[x][y]===3) {
      minefield[i].style.backgroundImage = 'url("https://image.ibb.co/hWghBL/mine3.png")';
    } else if (fieldOfMines[x][y]===4) {
      minefield[i].style.backgroundImage = 'url("https://image.ibb.co/nHxdkf/mine4.png")';
    } else if (fieldOfMines[x][y]===0) {
      minefield[i].style.backgroundImage = '';
      minefield[i].classList.add("empty_space");
    }
  }
}

//This is executed with selectBox() and will check if they have clicked an empty square, prompting other squares to reveal around it.
function revealSurroundings(z) {
  revealSelectedBox(z);
  revealLeft(z);
  revealRight(z);
  if (z<9) {
    revealBelow(z);     
  } else if (z>71) {
    revealAbove(z);
  } else {
    revealAbove(z);
    revealBelow(z);
  }
}

function revealAbove(z) {
  if (Number.isInteger(z/9)) {
    revealSelectedBox(z-8);
    revealSelectedBox(z-9);
  } else if (Number.isInteger((z+1)/9)) {
    revealSelectedBox(z-9);
    revealSelectedBox(z-10);
  } else {
    revealSelectedBox(z-9);
    revealSelectedBox(z-8);
    revealSelectedBox(z-10);
  }
}

function revealBelow(z) {
  revealSelectedBox(z+9);
  if (Number.isInteger(z/9)) {
    revealSelectedBox(z+10);
  } else if (Number.isInteger((z+1)/9)) {
    revealSelectedBox(z+8);
  } else {
    revealSelectedBox(z+8);
    revealSelectedBox(z+10);
  }
}

function revealLeft(z) {
  if (!Number.isInteger(z/9)) {
    revealSelectedBox(z-1);
  }
}

function revealRight(z) {
    if (!Number.isInteger((z+1)/9)) {
    revealSelectedBox(z+1);
  }
  }

function returnFlag() {
  
}

function removeFlag() {
  
}

function adjustMineCounter() {
  var a = 0;
  var b = 0;
  var c = 0;
  var t = (flagCount - flaggedBoxes.length);
  if (t<0) {
    a = "-";
  } else {
    a = 0;
  }
  b = Math.floor(Math.abs(t) * 0.1);
  c = (Math.abs(t)-(b*10));
  assignDigit(a, document.querySelector("#mine_digit_one"));
  assignDigit(b, document.querySelector("#mine_digit_two"));
  assignDigit(c, document.querySelector("#mine_digit_three"));
}

function assignDigit(x, y) {
  if (x===0) {
    y.src = "https://image.ibb.co/hx43vq/DIGITZERO.png";
  } else if (x===1) {
    y.src = "https://image.ibb.co/f30XoA/DIGITONE.png";
  } else if (x===2) {
    y.src = "https://image.ibb.co/iK0nMV/DIGITTWO.png";
  } else if (x===3) {
    y.src = "https://image.ibb.co/dYjsoA/DIGITTHREE.png";
  } else if (x===4) {
    y.src = "https://image.ibb.co/dDRSMV/DIGITFOUR.png";
  } else if (x===5) {
    y.src = "https://image.ibb.co/mRiVaq/DIGITFIVE.png";
  } else if (x===6) {
    y.src = "https://image.ibb.co/joK3vq/DIGITSIX.png";
  } else if (x===7) {
    y.src = "https://image.ibb.co/kxzQ8A/DIGITSEVEN.png";
  } else if (x===8) {
    y.src = "https://image.ibb.co/b1VnMV/DIGITEIGHT.png";
  } else if (x===9) {
    y.src = "https://image.ibb.co/cCU3vq/DIGITNINE.png";
  } else if (x==="-") {
    y.src = "https://image.ibb.co/gtEQ8A/MINUS.png";
  } 
}

function countSeconds() {
  var t = 0;
  setInterval(function() { 
          if (!firstBox&&!gameOver) {
            var a = 0;
            var b = 0;
            var c = 0;
            t++
            a = Math.floor(t * 0.01);
            b = Math.floor(t * 0.1)-(a*10);
            c = (t-((b*10)+(a*100)));
            assignDigit(a, document.querySelector("#timer_digit_one"));
            assignDigit(b, document.querySelector("#timer_digit_two"));
            assignDigit(c, document.querySelector("#timer_digit_three"));
            if (t===999) {
              gameOver = true;
              clearInterval();
              t=0;
            }
        } else if (gameOver) {
            assignDigit(a, document.querySelector("#timer_digit_one"));
            assignDigit(b, document.querySelector("#timer_digit_two"));
            assignDigit(c, document.querySelector("#timer_digit_three"));
            clearInterval();
            t=0;
        } else  {
          clearInterval();
          t=0;
        }
  }, 1000);
}
                     
//Tools for diagnosing bugs:

// document.querySelector("#tipBox").addEventListener("click", function(){
//   document.querySelector("#tipBox").textContent = fieldOfMines;})

// document.querySelector("#tipBox").addEventListener("click", function(){
//   document.querySelector("#mine_digit_one").src = "https://image.ibb.co/iK0nMV/DIGITTWO.png";})

// document.querySelector("#tipBox").addEventListener("contextmenu", function(){
//   document.querySelector("#tipBox").textContent = localStorage.getItem('startDate');})

// document.querySelector("#tipBox").textContent = t + " my variable";

