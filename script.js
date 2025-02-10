const selectMode = document.getElementById("select-mode");

const flipSound = new Audio("flip.ogg");

emailjs.init("e2OCOVFgr4yXPNREB");

document.addEventListener("DOMContentLoaded", () => {
  // State
  let flashcards = JSON.parse(localStorage.getItem("flashcards")) || []; //Extract Flashcards from locale storage.When receiving data from a web server, the data is always a string.Parse the data with JSON.parse(), and the data becomes a JavaScript object.
  let filteredFlashcards = [...flashcards];
  let currentIndex = 0;
  let cardsReviewed = 0;

  const defaultTheme = {
    background: "#1a3a3b",
    text: "#ffffff",
  };

  // DOM Elements
  const form = document.getElementById("flashcard-form");
  const cardContainer = document.querySelector(".card-inner");
  const questionDisplay = document.querySelector(".question");
  const answerDisplay = document.querySelector(".answer");
  const categoryTag = document.querySelector(".category-tag");
  const flipBtn = document.getElementById("flip-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const cardCount = document.getElementById("card-count");
  const filterCategory = document.getElementById("filter-category");
  const progressFill = document.querySelector(".progress-fill");
  const cardsReviewedElement = document.getElementById("cards-reviewed");
  const totalCardsElement = document.getElementById("total-cards");
  const selectMode = document.getElementById("select__mode");
  const guessInput = document.querySelector(".select__mode__input");
  const showAnswerBtn = document.getElementById("show__ans__btn");

  // Session progress tracking
  let sessionCardsCompleted = 1;

  function updateSessionProgress() {
    const progressFill = document.querySelector(".session-progress-fill");
    const progressPercentage = document.getElementById("progress-percentage");
    const cardsCompletedElement = document.getElementById("cards-completed");
    const totalCardsElement = document.getElementById("total-cards-session");

    const progress = (sessionCardsCompleted / filteredFlashcards.length) * 100;

    progressFill.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
    cardsCompletedElement.textContent = `${sessionCardsCompleted} cards reviewed`;
    totalCardsElement.textContent = `${filteredFlashcards.length} total cards`;
  }

  function resetSessionProgress() {
    sessionCardsCompleted = 1;
    updateSessionProgress();
  }

  // Call reset when page loads
  resetSessionProgress();

  window.onload = function () {
    toggleQuizMode(); // it hide answer input box and show answer btn initially
  };

  const colorPicker = document.createElement("div");
  colorPicker.className = "color-theme-picker";
  colorPicker.innerHTML = `
            <label for="card-bg-color">Card Background:</label>
            <input type="color" id="card-bg-color" value="#1a3a3b">
            <label for="card-text-color">Card Text:</label>
            <input type="color" id="card-text-color" value="#ffffff">
        `;

  // Shuffle Button
  const shuffleBtn = document.createElement("button");
  shuffleBtn.innerHTML = '<i class="fas fa-random"></i> Shuffle';
  shuffleBtn.classList.add("nav-btn");
  document.querySelector(".navigation").appendChild(shuffleBtn);

  // Function to shuffle an array using Fisher-Yates algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleBtn.addEventListener("click", () => {
    if (flashcards.length > 0) {
      shuffleArray(flashcards);
      currentIndex = 0;
      updateUI();
      showNotification("Cards shuffled successfully!");
    }
  });

  // Text-to-Speech Functionality with Enhanced Voice Quality
  function speakText(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.9; // Adjust speech rate for better clarity
    speech.pitch = 1.1; // Slightly adjust pitch for a more natural tone
    speech.volume = 1; // Ensure full volume
    window.speechSynthesis.speak(speech);
  }

  // Add pronunciation buttons
  const speakQuestionBtn = document.createElement("button");
  speakQuestionBtn.innerHTML =
    '<i class="fas fa-volume-up"></i> Speak Question';
  speakQuestionBtn.classList.add("nav-btn");
  speakQuestionBtn.addEventListener("click", () => {
    speakText(questionDisplay.textContent);
  });

  const speakAnswerBtn = document.createElement("button");
  speakAnswerBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speak Answer';
  speakAnswerBtn.classList.add("nav-btn");
  speakAnswerBtn.addEventListener("click", () => {
    speakText(answerDisplay.textContent);
  });

  document.querySelector(".navigation").appendChild(speakQuestionBtn);
  document.querySelector(".navigation").appendChild(speakAnswerBtn);

  // Insert color picker before the Add Card button
  const addCardBtn = form.querySelector(".btn-add");
  form.insertBefore(colorPicker, addCardBtn);

  // Add feedback button to the sidebar
  const statsSection = document.querySelector(".stats");
  const feedbackBtn = document.createElement("button");
  feedbackBtn.className = "btn-add";

  // adding styles
  feedbackBtn.style.display = "block";
  feedbackBtn.style.margin = "auto";
  feedbackBtn.style.marginTop = "10px";
  feedbackBtn.style.width = "50%";
  feedbackBtn.style.textAlign = "center";
  feedbackBtn.style.backgroundColor = "#1a3a3b";
  feedbackBtn.style.color = "#ffffff";
  feedbackBtn.style.padding = "10px";
  feedbackBtn.style.borderRadius = "10px";
  feedbackBtn.style.cursor = "pointer";
  feedbackBtn.style.border = "none";
  feedbackBtn.style.outline = "none";
  feedbackBtn.style.fontWeight = "bold";
  feedbackBtn.style.fontSize = "16px";
  feedbackBtn.style.transition = "all 0.3s";

  feedbackBtn.innerHTML = '<i class="fas fa-comment"></i> Give Feedback';
  statsSection.appendChild(feedbackBtn);

  //Function to toggle mode UI
  function toggleQuizMode() {
    if (selectMode.value === "quiz") {
      guessInput.style.display = "block"; // show input field
      flipBtn.style.display = "none"; // Hide flip button in quiz mode
      showAnswerBtn.style.display = "block"; // show answer button
      answerDisplay.style.display = "none"; // Hide answer in quiz mode
    } else {
      guessInput.style.display = "none"; // Hide input field
      flipBtn.style.display = "block"; // show flip button in normal mode
      showAnswerBtn.style.display = "none"; // Hide "Show Answer" button in normal mode
      answerDisplay.style.display = "block"; // Show answer in normal mode
    }

    updateUI(); // Refresh UI when mode changes
  }

  selectMode.addEventListener("change", () => {
    toggleQuizMode();
  });

  // Add new flashcard
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const category = document.getElementById("category").value;
    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer").value;
    const bgColor = document.getElementById("card-bg-color").value;
    const textColor = document.getElementById("card-text-color").value;

    const newCard = {
      category,
      question,
      answer,
      theme: {
        background: bgColor,
        text: textColor,
      },
    };
    flashcards.push(newCard);
    saveToLocalStorage();
    applyFilterCategory(); // update UI new card
    updateUI();
    form.reset();

    // Reset color pickers to default
    document.getElementById("card-bg-color").value = defaultTheme.background;
    document.getElementById("card-text-color").value = defaultTheme.text;

    showNotification("Card added successfully!");
  });

  // Initialize EmailJS (if you haven't added this to your HTML)
  emailjs.init("e2OCOVFgr4yXPNREB");

  document.addEventListener("DOMContentLoaded", () => {
    // State
    let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
    let currentIndex = 0;
    let cardsReviewed = 0;

    const defaultTheme = {
      background: "#1a3a3b",
      text: "#ffffff",
    };

    // DOM Elements
    const form = document.getElementById("flashcard-form");
    const cardContainer = document.querySelector(".card-inner");
    const questionDisplay = document.querySelector(".question");
    const answerDisplay = document.querySelector(".answer");
    const categoryTag = document.querySelector(".category-tag");
    const flipBtn = document.getElementById("flip-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const deleteBtn = document.getElementById("delete-btn");
    const cardCount = document.getElementById("card-count");
    const filterCategory = document.getElementById("filter-category");
    const progressFill = document.querySelector(".progress-fill");
    const cardsReviewedElement = document.getElementById("cards-reviewed");
    const totalCardsElement = document.getElementById("total-cards");

    // Shuffle Button
    const shuffleBtn = document.createElement("button");
    shuffleBtn.innerHTML = '<i class="fas fa-random"></i> Shuffle';
    shuffleBtn.classList.add("nav-btn");
    document.querySelector(".navigation").appendChild(shuffleBtn);

    // Function to shuffle an array using Fisher-Yates algorithm
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    shuffleBtn.addEventListener("click", () => {
      if (flashcards.length > 0) {
        shuffleArray(flashcards);
        currentIndex = 0;
        updateUI();
        showNotification("Cards shuffled successfully!");
      }
    });

    // Function to update UI
    function updateUI() {
      if (flashcards.length === 0) {
        questionDisplay.textContent = "No cards available";
        answerDisplay.textContent = "Add some cards to begin";
        categoryTag.textContent = "Empty";
        cardCount.textContent = "0/0";
      } else {
        const currentCard = flashcards[currentIndex];
        questionDisplay.textContent = currentCard.question;
        answerDisplay.textContent = currentCard.answer;
        categoryTag.textContent = currentCard.category;
        cardCount.textContent = `${currentIndex + 1}/${flashcards.length}`;
      }


    }



    // Shuffle Notification function
    function showNotification(message) {
      const notification = document.createElement("div");
      notification.className = "notification";
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 2000);
    }

    updateUI();
  });

  // Navigation handlers
  prevBtn.addEventListener("click", () => {
    cardContainer.classList.remove("flipped");
    if (currentIndex > 0) {
      currentIndex--;
      updateUI();
    }
  });

  nextBtn.addEventListener("click", () => {
    cardContainer.classList.remove("flipped");
    if (currentIndex < flashcards.length - 1) {
      currentIndex++;
      updateUI();
      // Update session progress when moving to next card
      sessionCardsCompleted = Math.min(
        sessionCardsCompleted + 1,
        filteredFlashcards.length
      );
      updateSessionProgress();
    }
  });

  // Flip card
  flipBtn.addEventListener("click", () => {
    cardContainer.classList.toggle("flipped");
    flipSound.currentTime = 0; // Reset sound to start for multiple flips
    flipSound.play();
  });

  // Flip card in quiz mode when answer is correct
  document.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });

  function checkAnswer() {
    if (
      guessInput.value.trim().toLowerCase() ===
      filteredFlashcards[currentIndex].answer.toLowerCase()
    ) {
      cardContainer.classList.add("flipped");
      answerDisplay.style.display = "block";
      flipSound.currentTime = 0;
      flipSound.play();
      guessInput.value = ""; // clear input after correct answer

      setTimeout(() => {
        cardContainer.classList.remove("flipped");
        answerDisplay.style.display = "none";
      }, 2000);

      setTimeout(() => {
        nextBtn.click();
      }, 3000);
    }
  }

  // Show answer in quiz mode
  showAnswerBtn.addEventListener("click", () => {
    answerDisplay.style.display = "block";
    cardContainer.classList.add("flipped");
    flipSound.currentTime = 0;
    flipSound.play();

    setTimeout(() => {
      cardContainer.classList.remove("flipped");
      answerDisplay.style.display = "none";
    }, 1000);
  });

  // Delete card
  deleteBtn.addEventListener("click", () => {
    if (flashcards.length > 0) {
      flashcards.splice(currentIndex, 1);
      if (currentIndex >= flashcards.length) {
        currentIndex = Math.max(0, flashcards.length - 1);
      }
      saveToLocalStorage();
      applyFilterCategory(); // Refresh UI after deletion
      showNotification("Card deleted!");
    }
  });

  // Apply Filter by category
  function applyFilterCategory() {
    const selectedCategory = filterCategory.value;

    filteredFlashcards =
      selectedCategory === "all"
        ? [...flashcards]
        : flashcards.filter((cards) => cards.category === selectedCategory);

    currentIndex = 0;
    updateUI();
  }

  // Listen for category filter changes
  filterCategory.addEventListener("change", () => {
    applyFilterCategory();
    resetSessionProgress(); // Reset progress when changing categories
  });

  // Update UI
  function updateUI() {
    if (filteredFlashcards.length === 0) {
      questionDisplay.textContent = "No cards available";
      answerDisplay.textContent = "Add some cards to begin";
      categoryTag.textContent = "Empty";
      cardCount.textContent = "0/0";

      // Set default theme
      setCardTheme(defaultTheme);
    } else {
      const currentCard = filteredFlashcards[currentIndex];
      questionDisplay.textContent = currentCard.question;
      answerDisplay.textContent = currentCard.answer;
      categoryTag.textContent = currentCard.category;
      cardCount.textContent = `${currentIndex + 1}/${filteredFlashcards.length
        }`;

      // Apply card's theme or default theme
      setCardTheme(currentCard.theme || defaultTheme);
    }

    totalCardsElement.textContent = flashcards.length;
    updateProgress();
    // Listen for category filter changes
    filterCategory.addEventListener("change", () => {
      applyFilterCategory();
    });

    // Update stats
    totalCardsElement.textContent = filteredFlashcards.length;
    updateProgress();
    showRandomFact();

  }

  // Random facts array
  const facts = [
    "Snakes can predict earthquakes.",
    "Lego mini-figures have the largest population on Earth!",
    "Astronauts grow taller in space!",
    "We spend a year on the toilet in our lifetime.",
    "There’s a 50% chance that two people will share a birthday in a group of 23 people.",
    "There are more stars in the universe than grains of sand on Earth.",
    "Sea Lions are the only animals who can clap to a beat!",
    "Glass balls bounce higher than rubber balls.",
  ];

  // Function to show a random fact
  function showRandomFact() {
    let fact = facts[Math.floor(Math.random() * facts.length)];
    document.getElementById("randomFact").textContent = fact;
  }
  updateUI();

  function setCardTheme(theme) {
    const cardFront = document.querySelector(".card-front");
    const cardBack = document.querySelector(".card-back");

    // Apply theme to front
    cardFront.style.background = theme.background;
    cardFront.style.color = theme.text;

    // Apply theme to back
    cardBack.style.background = theme.background;
    cardBack.style.color = theme.text;

    // Ensure category tag remains readable
    const categoryTag = document.querySelector(".category-tag");
    if (categoryTag) {
      categoryTag.style.color = "#ffffff";
    }
  }
  function isContrastValid(bgColor, textColor) {
    // Convert hex to RGB
    const hex2rgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    // Calculate relative luminance
    const luminance = (r, g, b) => {
      const rs = r / 255;
      const gs = g / 255;
      const bs = b / 255;
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const [bgR, bgG, bgB] = hex2rgb(bgColor);
    const [textR, textG, textB] = hex2rgb(textColor);

    const bgLum = luminance(bgR, bgG, bgB);
    const textLum = luminance(textR, textG, textB);

    const contrast =
      (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);

    return contrast >= 4.5; // WCAG AA standard for normal text
  }

  // Add contrast validation to color inputs
  document
    .getElementById("card-bg-color")
    .addEventListener("change", validateContrast);
  document
    .getElementById("card-text-color")
    .addEventListener("change", validateContrast);

  function validateContrast() {
    const bgColor = document.getElementById("card-bg-color").value;
    const textColor = document.getElementById("card-text-color").value;

    if (!isContrastValid(bgColor, textColor)) {
      showNotification(
        "Warning: Selected colors may have poor contrast. Consider adjusting for better readability.",
        true
      );
    }
  }

  // Update progress
  function updateProgress() {
    cardsReviewedElement.textContent = cardsReviewed;
    const progress = (cardsReviewed / filteredFlashcards.length) * 100;
    progressFill.style.width = `${progress}%`;
  }

  // Save to localStorage
  function saveToLocalStorage() {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }

  // Feedback Modal Functionality
  const modal = document.getElementById("feedback-modal");
  const closeBtn = document.querySelector(".close-btn");
  const feedbackForm = document.getElementById("feedback-form");

  feedbackBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Feedback Form Submission
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = feedbackForm.querySelector(".btn-submit");
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    const type = document.getElementById("feedback-type").value;
    const subject = document.getElementById("feedback-subject").value;
    const message = document.getElementById("feedback-message").value;
    const email = document.getElementById("feedback-email").value;

    // Prepare template parameters
    const templateParams = {
      feedback_type: type,
      subject: subject,
      message: message,
      user_email: email,
    };

    try {
      // Send email using EmailJS
      await emailjs.send(
        "service_qu5w5lj", // Add your EmailJS service ID
        "template_9httnqo", // Add your EmailJS template ID
        templateParams
      );

      showNotification("Feedback sent successfully!");
      feedbackForm.reset();
      modal.style.display = "none";
    } catch (error) {
      showNotification("Error sending feedback. Please try again.", true);
      console.error("EmailJS Error:", error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send Feedback";
    }
  });

  // Enhanced notification function
  function showNotification(message, isError = false) {
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => notification.remove());

    const notification = document.createElement("div");
    notification.className = `notification ${isError ? "notification-error" : ""
      }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Initialize
  updateUI();
});
// Add to script.js
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      prevBtn.click();
      break;
    case "ArrowRight":
      nextBtn.click();
      break;

    // Removed spacebar handling to allow typing spaces in text inputs
    // case ' ':
    //     e.preventDefault();
    //     flipBtn.click();
    //     break;
    case "Delete":
      if (confirm("Delete this card?")) {
        deleteBtn.click();
      }
      break;
  }
});
// Add to existing script.js
const studyTimer = {
  startTime: null,
  interval: null,
  element: document.getElementById("studyTimer"),

  start() {
    this.startTime = Date.now();
    this.interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      this.element.textContent = `Study time: ${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
  },

  stop() {
    clearInterval(this.interval);
  },
};

// Difficulty rating
document.querySelectorAll(".star").forEach((star) => {
  star.addEventListener("click", () => {
    const rating = parseInt(star.dataset.rating);
    const cardId = flashcards[currentIndex].id;
    flashcards[currentIndex].difficulty = rating;
    updateStarRating(rating);
    saveToLocalStorage();
  });
});

function updateStarRating(rating) {
  document.querySelectorAll(".star").forEach((star) => {
    const starRating = parseInt(star.dataset.rating);
    star.classList.toggle("active", starRating <= rating);
  });
}

// Tags management
document.getElementById("tags").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    flashcards[currentIndex].tags = tags;
    updateTags();
    saveToLocalStorage();
    e.target.value = "";
  }
});

function updateTags() {
  const tagsContainer = document.getElementById("cardTags");
  const tags = flashcards[currentIndex].tags || [];
  tagsContainer.innerHTML = tags
    .map(
      (tag) => `
        <span class="tag">${tag}</span>
    `
    )
    .join("");
}

// Export/Import functionality
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = JSON.stringify(flashcards);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards.json";
  a.click();
});

document.getElementById("importBtn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      flashcards = JSON.parse(event.target.result);
      saveToLocalStorage();
      applyFilterCategory();
    };
    reader.readAsText(file);
  };
  input.click();
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "?") {
    document.querySelector(".shortcuts-help").classList.toggle("visible");
  } else if (e.key >= "1" && e.key <= "3") {
    const rating = parseInt(e.key);
    updateStarRating(rating);
  }
});

// Initialize features
studyTimer.start();
updateTags();
