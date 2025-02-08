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

  // Prevent Spacebar from Flipping Card when Typing
  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    if (
      e.key === " " &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA")
    ) {
      e.stopPropagation();
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

  // const speakAnswerBtn = document.createElement("button");
  // speakAnswerBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speak Answer';
  // speakAnswerBtn.classList.add("nav-btn");
  // speakAnswerBtn.addEventListener("click", () => {
  //   speakText(answerDisplay.textContent);
  // });

  document.querySelector(".navigation").appendChild(speakQuestionBtn);
  document.querySelector(".navigation").appendChild(speakAnswerBtn);

  // Insert color picker before the Add Card button
  const addCardBtn = form.querySelector(".btn-add");
  form.insertBefore(colorPicker, addCardBtn);

  // Add feedback button to the sidebar
  const statsSection = document.querySelector(".stats");
  const feedbackBtn = document.createElement("button");
  feedbackBtn.className = "btn-add";
  feedbackBtn.innerHTML = '<i class="fas fa-comment"></i> Give Feedback';
  statsSection.appendChild(feedbackBtn);

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
    if (currentIndex > 0) {
      currentIndex--;
      updateUI();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < flashcards.length - 1) {
      currentIndex++;
      updateUI();
      cardsReviewed++;
      updateProgress();
    }
  });

  // Flip card
  flipBtn.addEventListener("click", () => {
    cardContainer.classList.toggle("flipped");
  });

  // Delete card
  deleteBtn.addEventListener("click", () => {
    if (flashcards.length > 0) {
      flashcards.splice(currentIndex, 1);
      if (currentIndex >= flashcards.length) {
        currentIndex = Math.max(0, flashcards.length - 1);
      }
      saveToLocalStorage();
      updateUI();
      showNotification("Card deleted!");
    }
  });

  // Filter by category
  filterCategory.addEventListener("change", () => {
    currentIndex = 0;
    updateUI();
  });

  // Update UI
  function updateUI() {
    if (flashcards.length === 0) {
      questionDisplay.textContent = "No cards available";
      answerDisplay.textContent = "Add some cards to begin";
      categoryTag.textContent = "Empty";
      cardCount.textContent = "0/0";

      // Set default theme
      setCardTheme(defaultTheme);
    } else {
      const currentCard = flashcards[currentIndex];
      questionDisplay.textContent = currentCard.question;
      answerDisplay.textContent = currentCard.answer;
      categoryTag.textContent = currentCard.category;
      cardCount.textContent = `${currentIndex + 1}/${flashcards.length}`;

      // Apply card's theme or default theme
      setCardTheme(currentCard.theme || defaultTheme);
    }

    totalCardsElement.textContent = flashcards.length;
    updateProgress();
  }

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
    const progress = (cardsReviewed / flashcards.length) * 100;
    progressFill.style.width = `${progress}%`;
  }

  // Save to localStorage
  function saveToLocalStorage() {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        prevBtn.click();
        break;
      case "ArrowRight":
        nextBtn.click();
        break;
      case " ": // Spacebar
        e.preventDefault();
        flipBtn.click();
        break;
      case "Delete":
        if (confirm("Delete this card?")) {
          deleteBtn.click();
        }
        break;
    }
  });

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
    notification.className = `notification ${
      isError ? "notification-error" : ""
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Initialize the UI
  updateUI();
});
