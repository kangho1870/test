const gameButtons = document.querySelectorAll('.game-btn');

gameButtons.forEach((button, index) => {
  button.addEventListener('click', e => {
    e.preventDefault();
    const tableName = button.getAttribute('data-table-name');
    const joinForm = button.closest(`#joinForm-${index}`);

    if (joinForm) {
      const joinGameInput = joinForm.querySelector('input[name="joinGame"]');
      const memNameInput = joinForm.querySelector('input[name="memName"]');
      const memAvgInput = joinForm.querySelector('input[name="memAvg"]');
      const memGenderInput = joinForm.querySelector('input[name="memGender"]');
      const memIdInput = joinForm.querySelector('input[name="memId"]');
      
      
      joinGameInput.value = tableName;
      memNameInput.value = memNameInput.value;
      memAvgInput.value = memAvgInput.value;
      memGenderInput.value = memGenderInput.value;
      memIdInput.value = memIdInput.value;

      joinForm.submit();
    } else {
      console.error(`joinForm-${index}을 찾을 수 없습니다.`);
    }
  });
});

const eventGameButton = document.querySelectorAll('.eventGame')

const inputElement = document.querySelector('.gameName');

inputElement.addEventListener('input', (event) => {
  const value = event.target.value;
  event.target.value = value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g, '');
});

function joinType() {
  
} 