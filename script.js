const grid = document.querySelectorAll('.minesweeper_grid')[0]
const smily = document.querySelector('.minesweeper_score-center button')
const timerDigits = document.querySelectorAll('.minesweeper_score-time .minesweeper_score-digit')
const pointDigits = document.querySelectorAll('.minesweeper_score-mines .minesweeper_score-digit')
const winWindow = document.querySelector('.window.window-winner')
const replayButton = document.querySelector('.window.window-winner button')
const subToolbarMenus = document.querySelectorAll('.window_sub-toolbar_menu > .window_sub-toolbar_list')
const subToolbarBtns = document.querySelectorAll('.window_sub-toolbar_menu > button')
const GameBtns = document.querySelectorAll('.window_sub-toolbar_list button')

const gameSettings = {
  minesNumber: 10,
  difficulty: 8,
  topCells: null,
  bottomCells: null
}
let mines = []
let checkedCells = []
let gameOver = false
let cellCounter = 0
let timer = 0
let score = 10
let timerInterval = null

// Init
GameInitialize()

document.body.addEventListener('click', () => {
  subToolbarMenus.forEach(menu => {
    menu.classList.remove('active')
  })
  subToolbarBtns.forEach(btn => {
    btn.classList.remove('active')
  })
})

smily.addEventListener('click', () => {
  GameReset()
})

replayButton.addEventListener('click', () => {
  GameReset()
})

subToolbarBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const list = btn.nextElementSibling
    list.classList.add('active')
    btn.classList.add('active')
  })
})

GameBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const action = btn.getAttribute('action')
    
    switch (action) {
      case 'new':
        GameReset()
        break
      case 'difficulty':
        const newDifficulty = parseInt(btn.getAttribute('difficulty'))
        const newMinesNumber = parseInt(btn.getAttribute('mines'))
        GameBtns.forEach(button => {
          button.classList.remove('active')
        })
        btn.classList.add('active')
        gameSettings.difficulty = newDifficulty
        gameSettings.minesNumber = newMinesNumber
        GameInitialize()
        GameReset()
        break
    }
  })
})
      
// Methods
function GameInitialize() {
  cellCounter = 0
  GameUpdateScore(gameSettings.minesNumber)
  GameRandomizeMines()
  
  gameSettings.topCells = new Array(gameSettings.difficulty).fill(0).map((item, index) => {
    return (index * gameSettings.difficulty) + 1
  })
  gameSettings.bottomCells = new Array(gameSettings.difficulty).fill(0).map((item, index) => {
    return (index + 1) * gameSettings.difficulty
  })
  
  new Array(gameSettings.difficulty).fill(0).forEach(col => {
    const girdCol = document.createElement('div')
    girdCol.classList.add('minesweeper_grid-col')
    grid.appendChild(girdCol)
  })

  const columns = document.querySelectorAll('.minesweeper_grid-col')
  let cellNumber = 0
  
  columns.forEach(col => {
    new Array(gameSettings.difficulty).fill(0).forEach(row => {
      cellNumber++
      const gridRow = document.createElement('div')
      gridRow.classList.add('minesweeper_grid-row')
      gridRow.setAttribute('cell-matrix', cellNumber)
      col.appendChild(gridRow)
    })
  })
  
  const cells = document.querySelectorAll('.minesweeper_grid-row')
  cells.forEach(cell => {
    cell.addEventListener('mousedown', (event) => {
      if (!gameOver && cell.classList.length === 1) {
        smily.classList.add('spooked')
      }
    })

    document.addEventListener('mouseup', (event) => {
      smily.classList.remove('spooked')
    })
  
    cell.addEventListener('click', (event) => {
      event.preventDefault()
      if (!gameOver && cell.classList.length === 1) {
        cellCounter++
        if (cellCounter === 1) {
          GameStartTimer()
        }
        const square = parseInt(cell.getAttribute('cell-matrix'))
        if (mines.includes(square)) {
          GameOver()
          mines = mines.filter(item => item !== square)
          cell.classList.add('minesweeper_grid-row--mine-og')
          cell.innerText = ''
          GameShowOtherMines()
          return
        } else {
          GetAdjecentMines(square)
        }
        let uniqueCells = [...new Set(checkedCells)]
        if (uniqueCells.length === (gameSettings.difficulty * gameSettings.difficulty) && !gameOver && !score) {
          GameWin()
        }
      }
      return false
    })
    cell.addEventListener('contextmenu', (event) => {
      event.preventDefault()
      cellCounter++
      if (!gameOver && cell.classList.length === 1) {
        score--
        GameUpdateScore()
        cell.classList.add('minesweeper_grid-row--flag')
        cell.innerText = ''
      } else if (!gameOver && cell.classList.length > 1) {
        score++
        GameUpdateScore()
        cell.classList.remove('minesweeper_grid-row--flag')
        cell.innerText = ''
      }

      if (cellCounter === 1) {
        GameStartTimer()
      }
      return false
    })
  })
}

function GetAdjecentMines (indexNumber) {
  let cellsToCheck = []
  
  checkedCells.push(indexNumber)
  if (gameSettings.topCells.includes(indexNumber)) {
    cellsToCheck = [indexNumber - 8, indexNumber -7, indexNumber + 1, indexNumber + 8, indexNumber + 9]
  } else if (gameSettings.bottomCells.includes(indexNumber)) {
    cellsToCheck = [indexNumber - 9, indexNumber -8, indexNumber - 1, indexNumber + 7, indexNumber + 8]
  } else {
    cellsToCheck = [indexNumber - 9, indexNumber -8, indexNumber -7, indexNumber - 1, indexNumber + 1, indexNumber + 7, indexNumber + 8, indexNumber + 9]
  }
  
  cellsToCheck = cellsToCheck.filter(item => item > 0 && item <= (gameSettings.difficulty * gameSettings.difficulty))
  let foundMines = 0
  cellsToCheck.forEach(cellToCheck => {
    if (mines.includes(cellToCheck)) {
      foundMines++
    }
  })
  if (foundMines > 0) {
    const cell = document.querySelector(`.minesweeper_grid-row[cell-matrix="${indexNumber}"]`)
    if (!cell.classList.contains('minesweeper_grid-row--flag')) {
      cell.setAttribute('cell', foundMines)
      cell.classList.add('minesweeper_grid-row--pressed')
      cell.innerText = foundMines
    }
  } else {
    cellsToCheck = cellsToCheck.filter(item => !checkedCells.includes(item))
    const cell = document.querySelector(`.minesweeper_grid-row[cell-matrix="${indexNumber}"]`)
    cell.classList.add('minesweeper_grid-row--pressed')
    cellsToCheck.forEach(cellToCheck => {
      GetAdjecentMines(cellToCheck)
    })
  }
}

function GameRandomizeMines () {
  mines = []
  while (mines.length < gameSettings.minesNumber) {
    var r = Math.floor(Math.random() * (gameSettings.difficulty * gameSettings.difficulty)) + 1
    if (mines.indexOf(r) === -1) mines.push(r)
  }
  checkedCells = [...mines]
}

function GameShowOtherMines () {
  mines.forEach(mine => {
    let mineCell = document.querySelector(`.minesweeper_grid-row[cell-matrix="${mine}"]`)
    mineCell.classList.add('minesweeper_grid-row--mine')
    mineCell.innerText = ''
  })
}

function GameStartTimer() {
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (timer < 999) {
      timer++
      const digits = timer.toString().length
      const time = digits === 1 ? `00${timer.toString()}` : digits === 2 ? `0${timer.toString()}` : timer.toString()
      const digit1 = time.charAt(0)
      const digit2 = time.charAt(1)
      const digit3 = time.charAt(2)

      // Last digit
      const previousClass1 = timerDigits[2].classList[1]
      if (previousClass1) {
        timerDigits[2].classList.replace(previousClass1, `minesweeper_score-digit--${[digit3]}`)
      } else {
        timerDigits[2].classList.add(`minesweeper_score-digit--${digit3}`)
      }
      
      // Middle digit
      const previousClass2 = timerDigits[1].classList[1]
      if (previousClass2) {
        timerDigits[1].classList.replace(previousClass2, `minesweeper_score-digit--${digit2}`)
      } else {
        timerDigits[1].classList.add(`minesweeper_score-digit--${digit2}`)
      }
      
      // First digit
      const previousClass3 = timerDigits[0].classList[1]
      if (previousClass3) {
        timerDigits[0].classList.replace(previousClass3, `minesweeper_score-digit--${digit1}`)
      } else {
        timerDigits[0].classList.add(`minesweeper_score-digit--${digit1}`)
      }
    }
  }, 1000)
}

function GameResetTimer() {
  clearInterval(timerInterval)
  timer = 0
  timerDigits.forEach(digit => {
    digit.className = 'minesweeper_score-digit'
  })
}

function GameOver () {
  gameOver = true
  clearInterval(timerInterval)
  smily.classList.add('dead')
  const flags = document.querySelectorAll(`.minesweeper_grid-row--flag`)
  flags.forEach(flag => {
    const number = parseInt(flag.getAttribute('cell-matrix'))
    if (!mines.includes(number)) {
      flag.classList.add('minesweeper_grid-row--flag-wrong')
      flag.innerText = ''
    }
  })
}

function GameUpdateScore() {
  const digits = score.toString().length
  const scoreDigits = digits === 1 ? `00${score}` : digits === 2 ? `0${score}` : score.toString()
  let digit1 = scoreDigits.charAt(0)
  let digit2 = scoreDigits.charAt(1)
  const digit3 = scoreDigits.charAt(2)
  
  if (score < 0) {
    digit1 = 'minus'
  }
    
  // Last digit
  const previousClass1 = pointDigits[2].classList[1]
  if (previousClass1) {
    pointDigits[2].classList.replace(previousClass1, `minesweeper_score-digit--${[digit3]}`)
  } else {
    pointDigits[2].classList.add(`minesweeper_score-digit--${digit3}`)
  }

  // Middle digit
  const previousClass2 = pointDigits[1].classList[1]
  if (previousClass2) {
    pointDigits[1].classList.replace(previousClass2, `minesweeper_score-digit--${digit2}`)
  } else {
    pointDigits[1].classList.add(`minesweeper_score-digit--${digit2}`)
  }

  // First digit
  const previousClass3 = pointDigits[0].classList[1]
  if (previousClass3) {
    pointDigits[0].classList.replace(previousClass3, `minesweeper_score-digit--${digit1}`)
  } else {
    pointDigits[0].classList.add(`minesweeper_score-digit--${digit1}`)
  }
}

function GameReset() {
  grid.innerHTML = ''
  winWindow.classList.remove('visible')
  smily.classList.remove('dead')
  smily.classList.remove('cool')
  cellCounter = 0
  score = gameSettings.minesNumber
  checkedCells = []
  gameOver = false
  GameUpdateScore()
  GameResetTimer()
  GameInitialize()
}

function GameWin () {
  clearInterval(timerInterval)
  smily.classList.add('cool')
  winWindow.classList.add('visible')
  document.querySelector('.window-winner_timer').innerText = timer
}

// Drag and drop
dragElement(document.querySelector(".window"))

function dragElement(elmnt) {
  let pos1 = 0
  let pos2 = 0
  let pos3 = 0
  let pos4 = 0
  if (document.querySelector('.window_toolbar')) {
    // if present, the header is where you move the DIV from:
    document.querySelector('.window_toolbar').onmousedown = dragMouseDown
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown
  }

  function dragMouseDown(e) {
    e = e || window.event
    e.preventDefault()
    // get the mouse cursor position at startup:
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag
  }

  function elementDrag(e) {
    e = e || window.event
    e.preventDefault()
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
  }
}