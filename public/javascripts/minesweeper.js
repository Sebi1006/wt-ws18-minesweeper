let initialSize = 10;

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

function updateGrid(grid) {
    for (let scalar = 0; scalar < grid.size * grid.size; scalar++) {
        if (grid.cellchecked[scalar] == true) {
            $("#scalar" + scalar).addClass("darkbackground");
            $("#scalar" + scalar).off("click");

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

function setCell(scalar) {
    setCellOnServer(row(scalar), col(scalar));
    setTimeout(function () {
        loadJson();
    }, 100);
}

function setFlag(scalar) {
    setFlagOnServer(row(scalar), col(scalar));
    setTimeout(function () {
        loadJson();
    }, 100);
}

function unsetFlag(scalar) {
    unsetFlagOnServer(row(scalar), col(scalar));
    setTimeout(function () {
        loadJson();
    }, 100);
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
            setCell(scalar);
        });

        $("#scalar" + scalar).mousedown(function (e) {
            if (e.which == 3) {
                if (grid.cellflag[scalar] == true) {
                    unsetFlag(scalar);
                    $("#scalar" + scalar).removeClass("flag");
                } else {
                    setFlag(scalar);
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
    let websocket = new WebSocket("ws://localhost:9000/websocket");

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

$(document).ready(function () {
    initialLoadJson();
    connectWebSocket();
});
