const gameCells = document.querySelectorAll('.game-cell');
const totalCells = document.querySelectorAll('.total');
const gamePMCells = document.querySelectorAll('.game_P_M-cell');
const userThisAvg = document.querySelectorAll('.userThisAvg')
const origin_game = document.querySelectorAll('.origin_game');
origin_game.forEach(cell => {
    cell.style.backgroundColor = 'rgb(226, 220, 220)';
})
gameCells.forEach(cell => {
const score = parseInt(cell.textContent);
    if(score === 300) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = '!';
        badge.style.color = 'gold';
        badge.style.fontWeight = 'bold';
        cell.style.color = 'green'; 
        cell.style.fontWeight = 'bold';
        
    }else if(score >= 200) {
        cell.style.color = 'red'; 
        cell.style.fontWeight = 'bold';
    }
    cell.style.backgroundColor = 'rgb(226, 220, 220)';
});

totalCells.forEach(cell => {
    const score = parseInt(cell.textContent);
    if(score >= 800) {
        cell.style.color = 'red'; 
        cell.style.fontWeight = 'bold';
    }
});
gamePMCells.forEach(cell => {
    const score = parseInt(cell.textContent);
    if (score >= 1) {
        cell.style.color = 'red'; 
        cell.textContent = `+${score}`
    }else if (score < 0) {
        cell.style.color = 'blue'; 
    }
})
userThisAvg.forEach(cell => {
    const score = cell.textContent;
    if (score < 0) {
        cell.style.color = 'blue'; 
        cell.style.fontWeight = 'bold';
        
    }else if (score >= 200) {
        cell.style.color = 'red'; 
        cell.style.fontWeight = 'bold';
        cell.textContent = `${score}`
    }
})
var loginName = document.getElementsByName('sessionName')[0].value
localStorage.setItem('userName', loginName)
if (localStorage.getItem('userName') == loginName) {
    const tableRows = document.querySelectorAll('tr');
    tableRows.forEach(row => {
        if (row.id === loginName) {
        row.style.border = '2px solid red';
        }
    });
}

function validateScores() {
    var game1 = parseInt(document.getElementsByName('Game1')[0].value) || 0;
    var game2 = parseInt(document.getElementsByName('Game2')[0].value) || 0;
    var game3 = parseInt(document.getElementsByName('Game3')[0].value) || 0;
    var game4 = parseInt(document.getElementsByName('Game4')[0].value) || 0;
    
    if (game1 === 0 && game2 === 0 && game3 === 0 && game4 === 0) {
        alert('점수를 입력하세요.');
        return false; // 폼 제출을 막음
    }
    
    return true; // 폼 제출을 허용
}
function show() {
    document.querySelector(".background").className = "background show";
}

function close() {
    document.querySelector(".background").className = "background";
}

document.querySelector("#show").addEventListener("click", show);
document.querySelector("#close").addEventListener("click", close);

function preventBack() {
    window.history.forward();
}

window.onload = function() {
    preventBack();
        window.onpageshow = function(event) {
            if (event.persisted) {
                preventBack();
            }
    };
};

document.getElementById("input-score").addEventListener("submit", function(event) {
    var game1Value = document.getElementsByName("Game1")[0].value;
    var game2Value = document.getElementsByName("Game2")[0].value;
    var game3Value = document.getElementsByName("Game3")[0].value;
    var game4Value = document.getElementsByName("Game4")[0].value;

if (isNaN(game1Value) || isNaN(game2Value) || isNaN(game3Value) || isNaN(game4Value)) {
    alert("숫자만 입력 가능합니다.");
    event.preventDefault();
} else if (game1Value > 300 || game2Value > 300 || game3Value > 300 || game4Value > 300) {
    alert("점수는 300점을 초과할 수 없습니다.");
    event.preventDefault();
}
});
window.onload = function() {
userScoreBtn.style.backgroundColor = "gray";
teamScoreBtn.style.backgroundColor = "transparent";
ceremonyBtn.style.backgroundColor = "transparent";
userTable.style.display = "block";
teamScoreTable.style.display = "none";
ceremonyTable.style.display = "none";
};
const userScoreBtn = document.getElementById("userScore");
const teamScoreBtn = document.getElementById("teamScore");
const ceremonyBtn = document.getElementById("Ceremony");
const userTable = document.querySelector(".user-table");
const teamScoreTable = document.querySelector(".teamScore");
const ceremonyTable = document.querySelector(".ceremony");

userScoreBtn.addEventListener("click", function() {
    userTable.style.display = "block";
    teamScoreTable.style.display = "none";
    ceremonyTable.style.display = "none";

    userScoreBtn.style.backgroundColor = "gray";
    teamScoreBtn.style.backgroundColor = "transparent";
    ceremonyBtn.style.backgroundColor = "transparent";
});

teamScoreBtn.addEventListener("click", function() {
    userTable.style.display = "none";
    teamScoreTable.style.display = "block";
    ceremonyTable.style.display = "none";

    userScoreBtn.style.backgroundColor = "transparent";
    teamScoreBtn.style.backgroundColor = "gray";
    ceremonyBtn.style.backgroundColor = "transparent";
});

ceremonyBtn.addEventListener("click", function() {
    userTable.style.display = "none";
    teamScoreTable.style.display = "none";
    ceremonyTable.style.display = 'block';

    userScoreBtn.style.backgroundColor = "transparent";
    teamScoreBtn.style.backgroundColor = "transparent";
    ceremonyBtn.style.backgroundColor = "gray";
});