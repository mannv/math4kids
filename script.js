document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const startScreen = document.getElementById('startScreen');
  const gameScreen = document.getElementById('gameScreen');
  const resultScreen = document.getElementById('resultScreen');
  const customRangeForm = document.getElementById('customRangeForm');
  const settingsScreen = document.getElementById('settingsScreen');

  const level1Button = document.getElementById('level1Button');
  const level2Button = document.getElementById('level2Button');
  const level3Button = document.getElementById('level3Button');
  const levelCustomButton = document.getElementById('levelCustomButton');
  const startCustomButton = document.getElementById('startCustomButton');
  const backButton = document.getElementById('backButton');
  const minValueInput = document.getElementById('minValue');
  const maxValueInput = document.getElementById('maxValue');

  // Settings elements
  const settingsButton = document.getElementById('settingsButton');
  const timePerQuestionInput = document.getElementById('timePerQuestion');
  const soundEnabledCheckbox = document.getElementById('soundEnabled');
  const saveSettingsButton = document.getElementById('saveSettingsButton');
  const backToMenuButton = document.getElementById('backToMenuButton');
  const timeDisplayText = document.getElementById('timeDisplayText');
  const timePresetButtons = document.querySelectorAll('.time-preset-btn');

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
  let totalTime = 60; // Will be loaded from settings
  let currentDifficulty = 1; // Default: 1 digit
  let selectedAnswer = null;
  let customMinValue = 0;
  let customMaxValue = 100;
  let soundEnabled = true; // Will be loaded from settings
  
  let difficultyLabels = {
    1: "1 chữ số (0-9)",
    2: "2 chữ số (0-99)",
    3: "3 chữ số (0-999)",
    4: `Tùy chỉnh (${customMinValue}-${customMaxValue})`
  };

  // Settings management
  const SETTINGS_KEY = 'math4kids_settings';
  const defaultSettings = {
    timePerQuestion: 60,
    soundEnabled: true
  };

  // Load settings from localStorage
  function loadSettings() {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      totalTime = settings.timePerQuestion || defaultSettings.timePerQuestion;
      soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : defaultSettings.soundEnabled;
    } else {
      totalTime = defaultSettings.timePerQuestion;
      soundEnabled = defaultSettings.soundEnabled;
    }
    
    // Update UI
    timePerQuestionInput.value = totalTime;
    soundEnabledCheckbox.checked = soundEnabled;
    timeDisplayText.textContent = totalTime;
    updateTimePresetButtons();
  }

  // Save settings to localStorage
  function saveSettings() {
    const settings = {
      timePerQuestion: parseInt(timePerQuestionInput.value),
      soundEnabled: soundEnabledCheckbox.checked
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    // Update game variables
    totalTime = settings.timePerQuestion;
    soundEnabled = settings.soundEnabled;
    timeDisplayText.textContent = totalTime;
    
    showNotification('Cài đặt đã được lưu!', 'success');
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : '#ff69b4'};
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      font-weight: 600;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Update time preset buttons
  function updateTimePresetButtons() {
    const currentTime = parseInt(timePerQuestionInput.value);
    timePresetButtons.forEach(btn => {
      const btnTime = parseInt(btn.dataset.time);
      btn.classList.toggle('active', btnTime === currentTime);
    });
  }

  // Timer circle constants
  const CIRCUMFERENCE = 2 * Math.PI * 45; // 2πr where r=45

  // Event listeners
  level1Button.addEventListener('click', () => startGame(1));
  level2Button.addEventListener('click', () => startGame(2));
  level3Button.addEventListener('click', () => startGame(3));
  levelCustomButton.addEventListener('click', showCustomRangeForm);
  startCustomButton.addEventListener('click', startCustomGame);
  backButton.addEventListener('click', hideCustomRangeForm);

  // Settings event listeners
  settingsButton.addEventListener('click', showSettings);
  saveSettingsButton.addEventListener('click', () => {
    saveSettings();
    showStartScreen();
  });
  backToMenuButton.addEventListener('click', showStartScreen);
  
  timePerQuestionInput.addEventListener('input', updateTimePresetButtons);
  
  timePresetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      timePerQuestionInput.value = btn.dataset.time;
      updateTimePresetButtons();
    });
  });

  submitButton.addEventListener('click', checkAnswer);
  nextButton.addEventListener('click', nextProblem);
  playAgainButton.addEventListener('click', () => startGame(currentDifficulty));
  homeButton.addEventListener('click', goHome);
  exitButton.addEventListener('click', confirmExit);

  // Functions
  function showCustomRangeForm() {
    startScreen.classList.add('hidden');
    customRangeForm.classList.remove('hidden');
  }

  function hideCustomRangeForm() {
    customRangeForm.classList.add('hidden');
    startScreen.classList.remove('hidden');
  }

  // Settings functions
  function showSettings() {
    startScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
    loadSettings(); // Refresh settings display
  }

  function showStartScreen() {
    settingsScreen.classList.add('hidden');
    customRangeForm.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    // Show settings button when back to start screen
    settingsButton.style.display = 'block';
  }

  function startCustomGame() {
    customMinValue = parseInt(minValueInput.value) || 0;
    customMaxValue = parseInt(maxValueInput.value) || 100;
    
    // Validate input
    if (customMinValue >= customMaxValue) {
      alert('Giá trị nhỏ nhất phải nhỏ hơn giá trị lớn nhất!');
      return;
    }
    
    if (customMaxValue > 9999) {
      alert('Giá trị lớn nhất không được vượt quá 9999!');
      return;
    }
    
    // Ẩn form tùy chỉnh
    customRangeForm.classList.add('hidden');
    
    // Update difficulty label
    difficultyLabels[4] = `Tùy chỉnh (${customMinValue}-${customMaxValue})`;
    
    // Start game with custom difficulty (4)
    startGame(4);
  }

  function startGame(difficulty) {
    // Set difficulty level
    currentDifficulty = difficulty;
    
    // Hide settings button when game starts
    settingsButton.style.display = 'none';

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
    if (soundEnabled) {
      tickSound.play().catch(e => console.log("Audio play failed:", e));
    }
  }

  function playCorrectSound() {
    if (soundEnabled) {
      correctSound.play().catch(e => console.log("Audio play failed:", e));
    }
  }

  function playWrongSound() {
    if (soundEnabled) {
      wrongSound.play().catch(e => console.log("Audio play failed:", e));
    }
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
    playWrongSound();
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
      playCorrectSound();

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
      playWrongSound();

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
    
    // Show settings button when back to home
    settingsButton.style.display = 'block';
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
    const usedProblems = new Set(); // Để theo dõi các phép tính đã sử dụng

    // Set min and max values based on difficulty
    let minValue, maxValue;
    switch (difficulty) {
      case 1: // 1 digit (0-9)
        minValue = 0;
        maxValue = 9;
        break;
      case 2: // 2 digits (0-99)
        minValue = 0;
        maxValue = 99;
        break;
      case 3: // 3 digits (0-999)
        minValue = 0;
        maxValue = 999;
        break;
      case 4: // Custom range
        minValue = customMinValue;
        maxValue = customMaxValue;
        break;
      default:
        minValue = 0;
        maxValue = 999;
        break;
    }

    // Generate exactly 5 addition and 5 subtraction problems
    const additionCount = Math.floor(count / 2);
    const subtractionCount = count - additionCount;

    // Helper function to generate a random number in range, avoiding 0 unless specifically allowed
    function getRandomNumber(min, max, allowZero = false) {
      if (!allowZero && min === 0) {
        min = 1;
      }
      if (max < min) {
        return min;
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Helper function to check if we should include zero (0.5% chance)
    function shouldIncludeZero() {
      return Math.random() < 0.005;
    }

    // Helper function to create problem key for duplicate checking
    function createProblemKey(a, operation, b) {
      return `${a}${operation}${b}`;
    }

    // Helper function to check if problem is duplicate
    function isDuplicate(a, operation, b) {
      const key = createProblemKey(a, operation, b);
      return usedProblems.has(key);
    }

    // Helper function to add problem to used set
    function addToUsed(a, operation, b) {
      const key = createProblemKey(a, operation, b);
      usedProblems.add(key);
    }

    // Generate addition problems
    let additionAttempts = 0;
    const maxAttempts = 1000; // Prevent infinite loop
    
    for (let i = 0; i < additionCount; i++) {
      let a, b;
      let validProblem = false;
      
      while (!validProblem && additionAttempts < maxAttempts) {
        additionAttempts++;
        
        if (shouldIncludeZero()) {
          // Include zero in this problem
          if (Math.random() < 0.5) {
            a = 0;
            b = getRandomNumber(minValue, maxValue, true);
          } else {
            a = getRandomNumber(minValue, maxValue, true);
            b = 0;
          }
        } else {
          // Normal addition without zero
          a = getRandomNumber(minValue, maxValue, false);
          const maxB = Math.min(maxValue - a, maxValue);
          const minB = Math.max(1, minValue);
          
          if (maxB >= minB) {
            b = getRandomNumber(minB, maxB, false);
          } else {
            // Fallback: generate smaller numbers
            a = getRandomNumber(minValue, Math.floor(maxValue / 2), false);
            b = getRandomNumber(1, maxValue - a, false);
          }
        }

        // Check if this problem is unique
        if (!isDuplicate(a, '+', b)) {
          validProblem = true;
          addToUsed(a, '+', b);
          
          problems.push({
            id: i + 1,
            operation: '+',
            a: a,
            b: b,
            answer: a + b
          });
        }
      }
      
      // If we couldn't find a unique problem after many attempts, force one
      if (!validProblem) {
        console.warn(`Could not generate unique addition problem ${i + 1}, using fallback`);
        // Generate a simple unique problem
        let fallbackA = i + 1;
        let fallbackB = 1;
        while (isDuplicate(fallbackA, '+', fallbackB)) {
          fallbackB++;
          if (fallbackA + fallbackB > maxValue) {
            fallbackA = Math.max(1, fallbackA - 1);
            fallbackB = 1;
          }
        }
        
        addToUsed(fallbackA, '+', fallbackB);
        problems.push({
          id: i + 1,
          operation: '+',
          a: fallbackA,
          b: fallbackB,
          answer: fallbackA + fallbackB
        });
      }
    }

    // Generate subtraction problems
    let subtractionAttempts = 0;
    
    for (let i = 0; i < subtractionCount; i++) {
      let a, b;
      let validProblem = false;
      
      while (!validProblem && subtractionAttempts < maxAttempts) {
        subtractionAttempts++;
        
        if (shouldIncludeZero()) {
          // Include zero in this problem
          if (Math.random() < 0.5) {
            // Result is 0 (a - a = 0)
            a = getRandomNumber(Math.max(1, minValue), maxValue, false);
            b = a;
          } else {
            // Subtract 0 (a - 0 = a)
            a = getRandomNumber(minValue, maxValue, true);
            b = 0;
          }
        } else {
          // Normal subtraction without zero
          a = getRandomNumber(Math.max(1, minValue), maxValue, false);
          const maxB = a - 1; // Ensure result > 0
          const minB = Math.max(1, minValue);
          
          if (maxB >= minB) {
            b = getRandomNumber(minB, maxB, false);
          } else {
            // Fallback: ensure positive result
            b = getRandomNumber(1, Math.max(1, a - 1), false);
          }
        }

        // Check if this problem is unique
        if (!isDuplicate(a, '-', b)) {
          validProblem = true;
          addToUsed(a, '-', b);
          
          problems.push({
            id: additionCount + i + 1,
            operation: '-',
            a: a,
            b: b,
            answer: a - b
          });
        }
      }
      
      // If we couldn't find a unique problem after many attempts, force one
      if (!validProblem) {
        console.warn(`Could not generate unique subtraction problem ${i + 1}, using fallback`);
        // Generate a simple unique problem
        let fallbackA = Math.max(2, i + 2);
        let fallbackB = 1;
        while (isDuplicate(fallbackA, '-', fallbackB) || fallbackA - fallbackB <= 0) {
          fallbackB++;
          if (fallbackB >= fallbackA) {
            fallbackA++;
            fallbackB = 1;
          }
          if (fallbackA > maxValue) {
            fallbackA = maxValue;
            fallbackB = maxValue - 1;
            break;
          }
        }
        
        addToUsed(fallbackA, '-', fallbackB);
        problems.push({
          id: additionCount + i + 1,
          operation: '-',
          a: fallbackA,
          b: fallbackB,
          answer: fallbackA - fallbackB
        });
      }
    }

    // Shuffle the problems to mix addition and subtraction
    for (let i = problems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [problems[i], problems[j]] = [problems[j], problems[i]];
    }

    // Re-assign IDs after shuffling
    problems.forEach((problem, index) => {
      problem.id = index + 1;
    });

    // Debug log to verify uniqueness
    console.log(`Generated ${problems.length} unique problems (${additionAttempts + subtractionAttempts} total attempts)`);
    
    return problems;
  }

  // Initialize settings on page load
  loadSettings();
});
