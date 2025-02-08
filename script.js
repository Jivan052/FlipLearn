// Initialize EmailJS (if you haven't added this to your HTML)
emailjs.init("e2OCOVFgr4yXPNREB");

document.addEventListener('DOMContentLoaded', () => {
    // State
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
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

    // Add feedback button to the sidebar
    const statsSection = document.querySelector('.stats');
    const feedbackBtn = document.createElement('button');
    feedbackBtn.className = 'btn-add';
    feedbackBtn.innerHTML = '<i class="fas fa-comment"></i> Give Feedback';
    statsSection.appendChild(feedbackBtn);

    // Add new flashcard
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('category').value;
        const question = document.getElementById('question').value;
        const answer = document.getElementById('answer').value;

        const newCard = { category, question, answer };
        flashcards.push(newCard);
        saveToLocalStorage();
        updateUI();
        form.reset();

        showNotification('Card added successfully!');
    });

    // Navigation handlers
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateUI();
        }
    });

    nextBtn.addEventListener('click', () => {
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
    });

    // Delete card
    deleteBtn.addEventListener('click', () => {
        if (flashcards.length > 0) {
            flashcards.splice(currentIndex, 1);
            if (currentIndex >= flashcards.length) {
                currentIndex = Math.max(0, flashcards.length - 1);
            }
            saveToLocalStorage();
            updateUI();
            showNotification('Card deleted!');
        }
    });

    // Filter by category
    filterCategory.addEventListener('change', () => {
        currentIndex = 0;
        updateUI();
    });

    // Update UI
    function updateUI() {
        if (flashcards.length === 0) {
            questionDisplay.textContent = 'No cards available';
            answerDisplay.textContent = 'Add some cards to begin';
            categoryTag.textContent = 'Empty';
            cardCount.textContent = '0/0';
        } else {
            const currentCard = flashcards[currentIndex];
            questionDisplay.textContent = currentCard.question;
            answerDisplay.textContent = currentCard.answer;
            categoryTag.textContent = currentCard.category;
            cardCount.textContent = `${currentIndex + 1}/${flashcards.length}`;
        }

        // Update stats
        totalCardsElement.textContent = flashcards.length;
        updateProgress();
    }

    // Update progress
    function updateProgress() {
        cardsReviewedElement.textContent = cardsReviewed;
        const progress = (cardsReviewed / flashcards.length) * 100;
        progressFill.style.width = `${progress}%`;
    }

    // Save to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('flashcards', JSON.stringify(flashcards));
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                prevBtn.click();
                break;
            case 'ArrowRight':
                nextBtn.click();
                break;
            case ' ':  // Spacebar
                e.preventDefault();
                flipBtn.click();
                break;
            case 'Delete':
                if (confirm('Delete this card?')) {
                    deleteBtn.click();
                }
                break;
        }
    });

    // Feedback Modal Functionality
    const modal = document.getElementById('feedback-modal');
    const closeBtn = document.querySelector('.close-btn');
    const feedbackForm = document.getElementById('feedback-form');

    feedbackBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Feedback Form Submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = feedbackForm.querySelector('.btn-submit');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        const type = document.getElementById('feedback-type').value;
        const subject = document.getElementById('feedback-subject').value;
        const message = document.getElementById('feedback-message').value;
        const email = document.getElementById('feedback-email').value;

        // Prepare template parameters
        const templateParams = {
            feedback_type: type,
            subject: subject,
            message: message,
            user_email: email
        };

        try {
            // Send email using EmailJS
            await emailjs.send(
                'service_qu5w5lj', // Add your EmailJS service ID
                'template_9httnqo', // Add your EmailJS template ID
                templateParams
            );

            showNotification('Feedback sent successfully!');
            feedbackForm.reset();
            modal.style.display = 'none';
        } catch (error) {
            showNotification('Error sending feedback. Please try again.', true);
            console.error('EmailJS Error:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Feedback';
        }
    });

    // Enhanced notification function
    function showNotification(message, isError = false) {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'notification-error' : ''}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize the UI
    updateUI();
});