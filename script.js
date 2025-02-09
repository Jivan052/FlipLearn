const selectMode = document.getElementById('select-mode')

const flipSound = new Audio("flip.ogg");



document.addEventListener('DOMContentLoaded', () => {
    // State
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || []; //Extract Flashcards from locale storage.When receiving data from a web server, the data is always a string.Parse the data with JSON.parse(), and the data becomes a JavaScript object.
    let filteredFlashcards = [...flashcards];
    let currentIndex = 0;
    let cardsReviewed = 0;

    // DOM Elements
    const form = document.getElementById('flashcard-form');
    const cardContainer = document.querySelector('.card-inner');
    const questionDisplay = document.querySelector('.question');
    const answerDisplay = document.querySelector('.answer');
    const categoryTag = document.querySelector('.category-tag');
    const flipBtn = document.getElementById('flip-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const cardCount = document.getElementById('card-count');
    const filterCategory = document.getElementById('filter-category');
    const progressFill = document.querySelector('.progress-fill');
    const cardsReviewedElement = document.getElementById('cards-reviewed');
    const totalCardsElement = document.getElementById('total-cards');
    const selectMode = document.getElementById('select__mode');
    const guessInput = document.querySelector('.select__mode__input');
    const showAnswerBtn = document.getElementById('show__ans__btn');


    window.onload = function() {
        toggleQuizMode(); // it hide answer input box and show answer btn initially
    };


    //Function to toggle mode UI
    function toggleQuizMode(){
        if(selectMode.value === 'quiz'){
            guessInput.style.display = 'block' // show input field
            flipBtn.style.display = 'none' // Hide flip button in quiz mode
            showAnswerBtn.style.display = 'block' // show answer button
            answerDisplay.style.display = 'none' // Hide answer in quiz mode
        }
        else{
            guessInput.style.display = 'none' // Hide input field
            flipBtn.style.display = 'block' // show flip button in normal mode
            showAnswerBtn.style.display = 'none' // Hide "Show Answer" button in normal mode
            answerDisplay.style.display = 'block' // Show answer in normal mode
        }

        updateUI() // Refresh UI when mode changes
    };

    selectMode.addEventListener('change', ()=>{
        toggleQuizMode();
    });

    // Add new flashcard
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('category').value;
        const question = document.getElementById('question').value;
        const answer = document.getElementById('answer').value;

        const newCard = { category, question, answer };
        flashcards.push(newCard);
        saveToLocalStorage();
        applyFilterCategory() // update UI new card
        form.reset();

        showNotification('Card added successfully!');
    });

    // Navigation handlers
    prevBtn.addEventListener('click', () => {
        cardContainer.classList.remove('flipped');
        if (currentIndex > 0) {
            currentIndex--;
            updateUI();
        }
    });

    nextBtn.addEventListener('click', () => {
        cardContainer.classList.remove('flipped');
        if (currentIndex < flashcards.length - 1) {
            currentIndex++;
            updateUI();
            cardsReviewed++;
            updateProgress();
        }
    });

    // Flip card
    flipBtn.addEventListener('click', () => {
        cardContainer.classList.toggle('flipped');
        flipSound.currentTime = 0; // Reset sound to start for multiple flips
        flipSound.play();
    });


    // Flip card in quiz mode when answer is correct
    document.addEventListener('keypress', (e) => {
        if(e.key === 'Enter'){
            checkAnswer();
        }
    });


    function checkAnswer(){
        if(guessInput.value.trim().toLowerCase() === filteredFlashcards[currentIndex].answer.toLowerCase()){
            cardContainer.classList.add('flipped');
            answerDisplay.style.display = 'block';
            flipSound.currentTime = 0;
            flipSound.play();
            guessInput.value = ''  // clear input after correct answer
            
            setTimeout(() => {
                cardContainer.classList.remove('flipped');
                answerDisplay.style.display = 'none';
            }, 2000)

            setTimeout(() => {
                nextBtn.click();
            }, 3000);
            
        }
    };


    // Show answer in quiz mode
    showAnswerBtn.addEventListener('click', () => {
        answerDisplay.style.display = 'block';
        cardContainer.classList.add('flipped');
        flipSound.currentTime = 0;
        flipSound.play();

        setTimeout(() =>{
            cardContainer.classList.remove('flipped');
            answerDisplay.style.display = 'none';
        }, 1000)
    });

    // Delete card
    deleteBtn.addEventListener('click', () => {
        if (flashcards.length > 0) {
            flashcards.splice(currentIndex, 1);
            if (currentIndex >= flashcards.length) {
                currentIndex = Math.max(0, flashcards.length - 1);
            }
            saveToLocalStorage();
            applyFilterCategory() // Refresh UI after deletion
            showNotification('Card deleted!');
        }
    });

    // Apply Filter by category
    function applyFilterCategory(){
        const selectedCategory = filterCategory.value;

        filteredFlashcards = selectedCategory === 'all' ? 
        [...flashcards] : flashcards.filter((cards) => cards.category === selectedCategory);

        currentIndex = 0;
        updateUI();
    }

    

    // Update UI
    function updateUI() {
        if (filteredFlashcards.length === 0) {
            questionDisplay.textContent = 'No cards available';
            answerDisplay.textContent = 'Add some cards to begin';
            categoryTag.textContent = 'Empty';
            cardCount.textContent = '0/0';
        } else {
            const currentCard = filteredFlashcards[currentIndex];
            questionDisplay.textContent = currentCard.question;
            answerDisplay.textContent = currentCard.answer;
            categoryTag.textContent = currentCard.category;
            cardCount.textContent = `${currentIndex + 1}/${filteredFlashcards.length}`;
        }

        // Listen for category filter changes
        filterCategory.addEventListener('change', () => {
            applyFilterCategory();
        })

        // Update stats
        totalCardsElement.textContent = filteredFlashcards.length;
        updateProgress();
    }

    // Update progress
    function updateProgress() {
        cardsReviewedElement.textContent = cardsReviewed;
        const progress = (cardsReviewed / filteredFlashcards.length) * 100;
        progressFill.style.width = `${progress}%`;
    }

    // Save to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('flashcards', JSON.stringify(flashcards));
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
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
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            prevBtn.click();
            break;
        case 'ArrowRight':
            nextBtn.click();
            break;

        // Removed spacebar handling to allow typing spaces in text inputs
        // case ' ':  
        //     e.preventDefault();
        //     flipBtn.click();
        //     break;
        case 'Delete':
            if (confirm('Delete this card?')) {
                deleteBtn.click();
            }
            break;
    }
});
// Add to existing script.js
const studyTimer = {
    startTime: null,
    interval: null,
    element: document.getElementById('studyTimer'),
    
    start() {
        this.startTime = Date.now();
        this.interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.element.textContent = `Study time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    },
    
    stop() {
        clearInterval(this.interval);
    }
};

// Difficulty rating
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        const cardId = flashcards[currentIndex].id;
        flashcards[currentIndex].difficulty = rating;
        updateStarRating(rating);
        saveToLocalStorage();
    });
});

function updateStarRating(rating) {
    document.querySelectorAll('.star').forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        star.classList.toggle('active', starRating <= rating);
    });
}

// Tags management
document.getElementById('tags').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        flashcards[currentIndex].tags = tags;
        updateTags();
        saveToLocalStorage();
        e.target.value = '';
    }
});

function updateTags() {
    const tagsContainer = document.getElementById('cardTags');
    const tags = flashcards[currentIndex].tags || [];
    tagsContainer.innerHTML = tags.map(tag => `
        <span class="tag">${tag}</span>
    `).join('');
}

// Export/Import functionality
document.getElementById('exportBtn').addEventListener('click', () => {
    const data = JSON.stringify(flashcards);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.json';
    a.click();
});

document.getElementById('importBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
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
document.addEventListener('keydown', (e) => {
    if (e.key === '?') {
        document.querySelector('.shortcuts-help').classList.toggle('visible');
    } else if (e.key >= '1' && e.key <= '3') {
        const rating = parseInt(e.key);
        updateStarRating(rating);
    }
});




// Initialize features
studyTimer.start();
updateTags();
