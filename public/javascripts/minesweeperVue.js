let rows = [cells(0), cells(10), cells(20), cells(30), cells(40), cells(50), cells(60), cells(70), cells(80), cells(90)];

function cells(start) {
    let minesweeperCells = [];

    if (start == 0) {
        for (let cell = start; cell < initialSize; cell++) {
            minesweeperCells.push({cell: cell, scalar: "scalar" + toScalar(cell)});
        }
    } else {
        for (let cell = start; cell < (initialSize + start); cell++) {
            minesweeperCells.push({cell: cell, scalar: "scalar" + toScalar(cell)});
        }
    }

    return minesweeperCells;
}

$(document).ready(function () {
    let minesweeperGame = new Vue({
        el: '#minesweeper-game'
    })
});

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

function toScalar(cell) {
    return row(cell) * initialSize + col(cell);
}

Vue.component('minesweeper-field', {
    template: `
        <div class="game">
            <div v-for="row in rows">
                <div v-for="cell in row" class="cell" v-bind:id="cell.scalar"></div>
            </div>
        </div>
    `,

    data: function () {
        return {
            rows: rows
        }
    },
});
