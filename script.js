document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const startScreen = document.getElementById('startScreen');
  const gameScreen = document.getElementById('gameScreen');
  const resultScreen = document.getElementById('resultScreen');

  const level1Button = document.getElementById('level1Button');
  const level2Button = document.getElementById('level2Button');
  const level3Button = document.getElementById('level3Button');

  const submitButton = document.getElementById('submitButton');
  const nextButton = document.getElementById('nextButton');
  const exitButton = document.getElementById('exitButton');
  const playAgainButton = document.getElementById('playAgainButton');
  const homeButton = document.getElementById('homeButton');

  const currentProblemElement = document.getElementById('currentProblem');
  const timeLeftElement = document.getElementById('timeLeft');
  const timerCircleProgress = document.querySelector('.timer-circle-progress');
  const timerContainer = document.querySelector('.timer-circle-container');
  const scoreElement = document.getElementById('score');
  const firstNumberElement = document.getElementById('firstNumber');
  const operationElement = document.getElementById('operation');
  const secondNumberElement = document.getElementById('secondNumber');
  const answerOptionsElement = document.getElementById('answerOptions');
  const feedbackElement = document.getElementById('feedback');
  const correctAnswersElement = document.getElementById('correctAnswers');
  const finalScoreElement = document.getElementById('finalScore');
  const resultMessageElement = document.getElementById('resultMessage');
  const difficultyLevelElement = document.getElementById('difficultyLevel');
  
  // Rabbit elements with 3 states
  const rabbitThinking = document.getElementById('rabbitThinking');
  const rabbitCorrect = document.getElementById('rabbitCorrect');
  const rabbitWrong = document.getElementById('rabbitWrong');

  // Audio elements
  const tickSound = document.getElementById('tickSound');
  const correctSound = document.getElementById('correctSound');
  const wrongSound = document.getElementById('wrongSound');

  // Game state
  let problems = [];
  let currentProblemIndex = 0;
  let score = 0;
  let correctAnswers = 0;
  let timer;
  let timeLeft = 60;
  const totalTime = 60; // Total time in seconds
  let currentDifficulty = 1; // Default: 1 digit
  let selectedAnswer = null;
  let difficultyLabels = {
    1: "1 chữ số (0-9)",
    2: "2 chữ số (0-99)",
    3: "3 chữ số (0-999)"
  };

  // Timer circle constants
  const CIRCUMFERENCE = 2 * Math.PI * 45; // 2πr where r=45

  // Event listeners
  level1Button.addEventListener('click', () => startGame(1));
  level2Button.addEventListener('click', () => startGame(2));
  level3Button.addEventListener('click', () => startGame(3));

  submitButton.addEventListener('click', checkAnswer);
  nextButton.addEventListener('click', nextProblem);
  playAgainButton.addEventListener('click', () => startGame(currentDifficulty));
  homeButton.addEventListener('click', goHome);
  exitButton.addEventListener('click', confirmExit);

  // Functions
  function startGame(difficulty) {
    // Set difficulty level
    currentDifficulty = difficulty;

    // Reset game state
    currentProblemIndex = 0;
    score = 0;
    correctAnswers = 0;

    // Generate problems based on difficulty
    problems = generateProblems(10, difficulty);

    // Show game screen
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // Display first problem
    displayProblem();
  }

  function displayProblem() {
    // Reset UI
    clearInterval(timer);
    timeLeft = totalTime;
    timeLeftElement.textContent = timeLeft;
    updateTimerCircle(timeLeft);
    timerContainer.classList.remove('timer-warning');

    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    submitButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    submitButton.disabled = true;

    // Update problem counter
    currentProblemElement.textContent = currentProblemIndex + 1;

    // Display problem
    const problem = problems[currentProblemIndex];
    firstNumberElement.textContent = problem.a;
    secondNumberElement.textContent = problem.b;
    operationElement.textContent = problem.operation;

    // Generate and display answer options
    generateAnswerOptions(problem);

    // Show thinking animal
    showThinkingAnimal();

    // Start timer and play tick sound
    startTimer();
    playTickSound();
  }

  // Generate multiple choice options
  function generateAnswerOptions(problem) {
    // Clear previous options
    answerOptionsElement.innerHTML = '';
    
    // Create array with correct answer
    const correctAnswer = problem.answer;
    const options = [correctAnswer];
    
    // Add 3 wrong answers that are close to the correct answer
    while (options.length < 4) {
      // Generate a random offset between -10 and +10, but not 0
      let offset = Math.floor(Math.random() * 21) - 10;
      if (offset === 0) offset = 1;
      
      const wrongAnswer = correctAnswer + offset;
      
      // Ensure the wrong answer is positive and not already in the options
      if (wrongAnswer >= 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle the options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    // Create buttons for each option
    shuffledOptions.forEach(option => {
      const optionButton = document.createElement('button');
      optionButton.className = 'answer-option';
      optionButton.textContent = option;
      optionButton.dataset.value = option;
      
      optionButton.addEventListener('click', () => {
        // Remove selected class from all options
        document.querySelectorAll('.answer-option').forEach(btn => {
          btn.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        optionButton.classList.add('selected');
        selectedAnswer = parseInt(option);
        
        // Enable submit button
        submitButton.disabled = false;
      });
      
      answerOptionsElement.appendChild(optionButton);
    });
    
    // Reset selected answer
    selectedAnswer = null;
  }

  // Function to show a thinking animal
  function showThinkingAnimal() {
    // Hide all animal states first
    hideAllAnimals();
    rabbitThinking.classList.remove('hidden');
  }
  
  // Function to hide all animal states
  function hideAllAnimals() {
    rabbitThinking.classList.add('hidden');
    rabbitCorrect.classList.add('hidden');
    rabbitWrong.classList.add('hidden');
  }

  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      timeLeftElement.textContent = timeLeft;
      updateTimerCircle(timeLeft);

      if (timeLeft <= 10 && !timerContainer.classList.contains('timer-warning')) {
        timerContainer.classList.add('timer-warning');
      }

      if (timeLeft <= 0) {
        clearInterval(timer);
        tickSound.pause();
        timeUp();
      }
    }, 1000);
  }

  function updateTimerCircle(timeLeft) {
    const progress = timeLeft / totalTime;
    const dashoffset = CIRCUMFERENCE * (1 - progress);
    timerCircleProgress.style.strokeDasharray = CIRCUMFERENCE;
    timerCircleProgress.style.strokeDashoffset = dashoffset;
  }

  function playTickSound() {
    tickSound.play().catch(e => console.log("Audio play failed:", e));
  }

  function playCorrectSound() {
    correctSound.play().catch(e => console.log("Audio play failed:", e));
  }

  function timeUp() {
    // Disable all answer options
    document.querySelectorAll('.answer-option').forEach(btn => {
      btn.disabled = true;
    });
    
    submitButton.classList.add('hidden');
    nextButton.classList.remove('hidden');

    // Show wrong rabbit
    hideAllAnimals();
    rabbitWrong.classList.remove('hidden');
    rabbitWrong.classList.add('sad');
    
    setTimeout(() => {
      rabbitWrong.classList.remove('sad');
    }, 1000);

    const problem = problems[currentProblemIndex];
    feedbackElement.textContent = `Hết giờ! Đáp án đúng là ${problem.answer}.`;
    feedbackElement.className = 'feedback incorrect';

    // Play wrong sound
    wrongSound.play().catch(e => console.log("Audio play failed:", e));
  }

  function stopTickSound() {
    tickSound.pause();
    tickSound.currentTime = 0;
  }

  function checkAnswer() {
    stopTickSound();
    const problem = problems[currentProblemIndex];

    // Stop timer and tick sound
    clearInterval(timer);
    tickSound.pause();
    tickSound.currentTime = 0;

    // Hide all animals first
    hideAllAnimals();

    // Disable all answer options
    document.querySelectorAll('.answer-option').forEach(btn => {
      btn.disabled = true;
    });

    // Hide submit button, show next button
    submitButton.classList.add('hidden');
    nextButton.classList.remove('hidden');

    // Check if answer is correct
    if (selectedAnswer === problem.answer) {
      // Correct answer
      const pointsEarned = Math.max(10, timeLeft);
      score += pointsEarned;
      correctAnswers++;

      feedbackElement.textContent = `Đúng rồi! +${pointsEarned} điểm`;
      feedbackElement.className = 'feedback correct bounce';

      // Show happy rabbit
      rabbitCorrect.classList.remove('hidden');
      rabbitCorrect.classList.add('celebrate');
      
      setTimeout(() => {
        rabbitCorrect.classList.remove('celebrate');
      }, 1000);

      // Play correct sound
      correctSound.play().catch(e => console.log("Audio play failed:", e));

      // Add animation
      playCorrectAnimation();
    } else {
      // Incorrect answer
      feedbackElement.textContent = `Sai rồi! Đáp án đúng là ${problem.answer}.`;
      feedbackElement.className = 'feedback incorrect';

      // Show sad rabbit
      rabbitWrong.classList.remove('hidden');
      rabbitWrong.classList.add('sad');
      
      setTimeout(() => {
        rabbitWrong.classList.remove('sad');
      }, 1000);

      // Play wrong sound
      wrongSound.play().catch(e => console.log("Audio play failed:", e));

      // Play incorrect animation
      playIncorrectAnimation();
    }

    // Update score
    scoreElement.textContent = score;
  }

  function nextProblem() {
    currentProblemIndex++;

    if (currentProblemIndex < problems.length) {
      displayProblem();
    } else {
      showResults();
    }
  }

  function showResults() {
    // Hide game screen, show result screen
    gameScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    // Update result information
    correctAnswersElement.textContent = correctAnswers;
    finalScoreElement.textContent = score;
    difficultyLevelElement.textContent = difficultyLabels[currentDifficulty];

    // Show appropriate message based on score
    if (correctAnswers >= 9) {
      resultMessageElement.textContent = 'Tuyệt vời! Bạn thật giỏi!';
    } else if (correctAnswers >= 7) {
      resultMessageElement.textContent = 'Rất tốt! Cố gắng hơn nữa nhé!';
    } else if (correctAnswers >= 5) {
      resultMessageElement.textContent = 'Khá tốt! Hãy luyện tập thêm!';
    } else {
      resultMessageElement.textContent = 'Cần cố gắng hơn nữa nhé!';
    }
  }

  function goHome() {
    // Return to start screen
    resultScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    stopTickSound();
  }

  function confirmExit() {
    if (confirm('Bạn có chắc muốn thoát không? Điểm của bạn sẽ không được lưu.')) {
      goHome();
      clearInterval(timer);
    }
  }

  function playCorrectAnimation() {
    // Animate stars
    const stars = document.querySelectorAll('.decoration');
    stars.forEach(star => {
      star.style.opacity = '1';
      star.classList.add('tada');
      setTimeout(() => {
        star.style.opacity = '0.7';
        star.classList.remove('tada');
      }, 1000);
    });

    // Create confetti effect
    for (let i = 0; i < 30; i++) {
      createConfetti();
    }

    // Animate the problem container
    const problemContainer = document.querySelector('.problem-container');
    problemContainer.classList.add('pulse');
    setTimeout(() => {
      problemContainer.classList.remove('pulse');
    }, 1500);
  }

  function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // Random position, color and size
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = Math.random() * 20 + 'vh';
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = confetti.style.width;

    // Add to body
    document.body.appendChild(confetti);

    // Remove after animation completes
    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }

  function getRandomColor() {
    const colors = ['#ff69b4', '#ffcc00', '#2ecc71', '#3498db', '#9b59b6', '#e74c3c'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function playIncorrectAnimation() {
    // Shake the problem container
    const problemContainer = document.querySelector('.problem-container');
    problemContainer.classList.add('shake');
    setTimeout(() => {
      problemContainer.classList.remove('shake');
    }, 800);
  }

  // Function to generate random math problems based on difficulty
  function generateProblems(count, difficulty) {
    const problems = [];

    // Set max value based on difficulty
    let maxValue;
    switch (difficulty) {
      case 1: // 1 digit (0-9)
        maxValue = 9;
        break;
      case 2: // 2 digits (0-99)
        maxValue = 99;
        break;
      case 3: // 3 digits (0-999)
      default:
        maxValue = 999;
        break;
    }

    for (let i = 0; i < count; i++) {
      // Randomly choose between addition and subtraction
      const operation = Math.random() < 0.5 ? 'addition' : 'subtraction';

      if (operation === 'addition') {
        // Generate addition problem where sum <= maxValue
        const a = Math.floor(Math.random() * (maxValue + 1));
        const b = Math.floor(Math.random() * (maxValue - a + 1)); // Ensure sum <= maxValue

        problems.push({
          id: i + 1,
          operation: '+',
          a: a,
          b: b,
          answer: a + b
        });
      } else {
        // Generate subtraction problem where both numbers <= maxValue and result is positive
        const a = Math.floor(Math.random() * (maxValue + 1));
        const b = Math.floor(Math.random() * (a + 1)); // Ensure b <= a for positive result

        problems.push({
          id: i + 1,
          operation: '-',
          a: a,
          b: b,
          answer: a - b
        });
      }
    }

    return problems;
  }
});
