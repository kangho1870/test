function validateScores() {
    var game1 = parseInt(document.getElementsByName('Game1')[0].value) || 0;
    var game2 = parseInt(document.getElementsByName('Game2')[0].value) || 0;
    var game3 = parseInt(document.getElementsByName('Game3')[0].value) || 0;
    
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
