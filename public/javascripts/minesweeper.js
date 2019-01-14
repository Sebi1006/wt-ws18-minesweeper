let initialSize = 10;
let clicks = 0;
let numberOfMines;
let flagCounter;
let textNode;
let flags;

function row(scalar) {
    if (scalar == 0) {
        return 0;
    } else {
        return Math.floor(scalar / initialSize);
    }
}

function col(scalar) {
    if (scalar == 0) {
        return 0;
    } else {
        return scalar % initialSize;
    }
}

function toScalar(row, col) {
    return row * initialSize + col;
}

class Grid {
    constructor(gridSize) {
        initialSize = gridSize;
        this.size = gridSize;
        this.cellvalue = [];
        this.cellchecked = [];
        this.cellflag = [];

        if (gridSize == 10) {
            numberOfMines = 10;
        } else if (gridSize == 16) {
            numberOfMines = 40;
        } else if (gridSize == 20) {
            numberOfMines = 80;
        }
    }

    fill(json) {
        for (let scalar = 0; scalar < this.size * this.size; scalar++) {
            this.cellvalue[scalar] = (json[toScalar(row(scalar), col(scalar))].cell.value);
            this.cellchecked[scalar] = (json[toScalar(row(scalar), col(scalar))].cell.checked);
            this.cellflag[scalar] = (json[toScalar(row(scalar), col(scalar))].cell.flag);
        }
    }
}

let grid = new Grid(initialSize);
let winCounter = 0;
let gameFinished = false;

function updateGrid(grid) {
    for (let scalar = 0; scalar < grid.size * grid.size; scalar++) {
        if (grid.cellchecked[scalar] == true) {
            $("#scalar" + scalar).addClass("background");
            $("#scalar" + scalar).off("click").off("mousedown");

            if (grid.cellvalue[scalar] == 1) {
                $("#scalar" + scalar).addClass("one");
            }

            if (grid.cellvalue[scalar] == 2) {
                $("#scalar" + scalar).addClass("two");
            }

            if (grid.cellvalue[scalar] == 3) {
                $("#scalar" + scalar).addClass("three");
            }

            if (grid.cellvalue[scalar] == 4) {
                $("#scalar" + scalar).addClass("four");
            }

            if (grid.cellvalue[scalar] == 5) {
                $("#scalar" + scalar).addClass("five");
            }

            if (grid.cellvalue[scalar] == 6) {
                $("#scalar" + scalar).addClass("six");
            }

            if (grid.cellvalue[scalar] == 7) {
                $("#scalar" + scalar).addClass("seven");
            }

            if (grid.cellvalue[scalar] == 8) {
                $("#scalar" + scalar).addClass("eight");
            }

            if (grid.cellvalue[scalar] == -1) {
                $("#scalar" + scalar).addClass("mine");
            }
        }

        if (grid.cellflag[scalar] == true) {
            $("#scalar" + scalar).addClass("flag");
        }
    }
}

function lose() {
    alert("Game Over!");

    gameFinished = true;

    for (let scalar = 0; scalar < grid.size * grid.size; scalar++) {
        $("#scalar" + scalar).off("click").off("mousedown");

        if (grid.cellflag[scalar] == true && grid.cellvalue[scalar] == -1) {
            $("#scalar" + scalar).removeClass("flag");
        }
    }
}

function win() {
    alert("You Win!");

    gameFinished = true;

    for (let scalar = 0; scalar < grid.size * grid.size; scalar++) {
        $("#scalar" + scalar).off("click").off("mousedown");

        if (grid.cellchecked[scalar] == false && grid.cellflag[scalar] == false) {
            $("#scalar" + scalar).addClass("background");

            if (grid.cellvalue[scalar] == 1) {
                $("#scalar" + scalar).addClass("one");
            }

            if (grid.cellvalue[scalar] == 2) {
                $("#scalar" + scalar).addClass("two");
            }

            if (grid.cellvalue[scalar] == 3) {
                $("#scalar" + scalar).addClass("three");
            }

            if (grid.cellvalue[scalar] == 4) {
                $("#scalar" + scalar).addClass("four");
            }

            if (grid.cellvalue[scalar] == 5) {
                $("#scalar" + scalar).addClass("five");
            }

            if (grid.cellvalue[scalar] == 6) {
                $("#scalar" + scalar).addClass("six");
            }

            if (grid.cellvalue[scalar] == 7) {
                $("#scalar" + scalar).addClass("seven");
            }

            if (grid.cellvalue[scalar] == 8) {
                $("#scalar" + scalar).addClass("eight");
            }
        }
    }
}

function setCell(scalar) {
    setCellOnServer(row(scalar), col(scalar));
    loadJson();

    if (grid.cellvalue[scalar] == -1) {
        lose();
    }
}

function setFlag(scalar) {
    setFlagOnServer(row(scalar), col(scalar));
    loadJson();

    if (grid.cellvalue[scalar] == -1) {
        winCounter++;

        if (winCounter == numberOfMines) {
            win();
        }
    }
}

function unsetFlag(scalar) {
    unsetFlagOnServer(row(scalar), col(scalar));
    loadJson();

    if (grid.cellvalue[scalar] == -1) {
        winCounter--;
    }
}

function setCellOnServer(row, col) {
    $.get("/set/" + row + "/" + col);
}

function setFlagOnServer(row, col) {
    $.get("/flag/" + row + "/" + col);
}

function unsetFlagOnServer(row, col) {
    $.get("/noflag/" + row + "/" + col);
}

function registerClickListener() {
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);

    for (let scalar = 0; scalar < grid.size * grid.size; scalar++) {
        $("#scalar" + scalar).click(function () {
            clicks++;
            startStopwatch();
            setCell(scalar);
        });

        $("#scalar" + scalar).mousedown(function (e) {
            if (e.which == 3) {
                if (grid.cellflag[scalar] == true) {
                    unsetFlag(scalar);
                    $("#scalar" + scalar).removeClass("flag");
                    ++flagCounter;
                    updateFlagCounter();
                } else {
                    if (flagCounter > 0) {
                        setFlag(scalar);
                        --flagCounter;
                        updateFlagCounter();
                    }
                }
            }
        });
    }
}

function initialLoadJson() {
    $.ajax({
        method: "GET",
        url: "/json",
        dataType: "json",

        success: function (result) {
            grid = new Grid(result.grid.height);
            grid.fill(result.grid.cells);
            updateGrid(grid);
            registerClickListener();
        }
    });
}

function loadJson() {
    $.ajax({
        method: "GET",
        url: "/json",
        dataType: "json",

        success: function (result) {
            grid = new Grid(result.grid.height);
            grid.fill(result.grid.cells);
            updateGrid(grid);
        }
    });
}

function connectWebSocket() {
    let websocket = new WebSocket("ws://wt-ws18-minesweeper.herokuapp.com/websocket");

    websocket.onopen = function () {
        console.log("Connected to Websocket");
    };

    websocket.onclose = function () {
        console.log("Connection with Websocket closed");
    };

    websocket.onerror = function (error) {
        console.log("Error in Websocket occured: " + error);
    };

    websocket.onmessage = function (e) {
        if (typeof e.data === "string") {
            let json = JSON.parse(e.data);
            let cells = json.grid.cells;
            grid.fill(cells);
            updateGrid(grid);
        }
    };
}

function initialStopwatch() {
    setTimeout(function () {
        textNode = document.createTextNode('0');
        document.getElementById('seconds').appendChild(textNode);
    }, 200);
}

function startStopwatch() {
    if (clicks == 1) {
        window.setInterval((function () {
            let start = Date.now();
            return function () {
                if (!gameFinished) {
                    textNode.data = Math.floor((Date.now() - start) / 1000);
                }
            };
        }()), 1000);
    }
}

function initialFlagCounter() {
    setTimeout(function () {
        flagCounter = numberOfMines;
        flags = document.createTextNode(numberOfMines);
        document.getElementById('flags').appendChild(flags);
    }, 200);
}

function updateFlagCounter() {
    flags.data = flagCounter;
}

$(document).ready(function () {
    initialLoadJson();
    connectWebSocket();
    initialStopwatch();
    initialFlagCounter();
});
