
        document.addEventListener('DOMContentLoaded', function() {
           
            const stars = document.querySelectorAll('.star');
            const ratingText = document.querySelector('.rating-text');
            const feedbackInput = document.querySelector('.rating-feedback');
            const submitBtn = document.querySelector('.submit-btn');

            // Current rating
            let currentRating = 0;
            let isSubmitted = false;

            // Rating messages
            const ratingMessages = {
                1: "Poor - We're sorry to hear that",
                2: "Fair - We'll try to do better",
                3: "Good - Thanks for your feedback",
                4: "Very Good - We're glad you liked it",
                5: "Excellent - We're thrilled you love it!"
            };

            // Star rating interaction
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    if (isSubmitted) return;
                    
                    const value = parseInt(this.getAttribute('data-value'));
                    currentRating = value;
                    
                    // Update star display
                    stars.forEach((s, idx) => {
                        if (idx < value) {
                            s.classList.add('active');
                        } else {
                            s.classList.remove('active');
                        }
                    });
                    
                    // Update rating text
                    ratingText.textContent = ratingMessages[value];
                });
                
                // Hover effects
                star.addEventListener('mouseover', function() {
                    if (isSubmitted) return;
                    
                    const value = parseInt(this.getAttribute('data-value'));
                    
                    stars.forEach((s, idx) => {
                        if (idx < value) {
                            s.style.color = '#ffd700';
                        }
                    });
                });
                
                star.addEventListener('mouseout', function() {
                    if (isSubmitted) return;
                    
                    stars.forEach((s, idx) => {
                        if (idx >= currentRating) {
                            s.style.color = '#4a4a4a';
                        }
                    });
                });
            });

            // Submit rating
            submitBtn.addEventListener('click', function() {
                if (currentRating === 0) {
                    alert('Please select a rating before submitting.');
                    return;
                }
                
                if (isSubmitted) {
                    alert('You have already submitted your rating.');
                    return;
                }
                
                // In a real app, you would send this data to a server here
                const newRating = {
                    stars: currentRating,
                    comment: feedbackInput.value.trim()
                };
                console.log('Rating submitted:', newRating);
                
                // Update UI
                isSubmitted = true;
                submitBtn.textContent = 'Thanks for your rating!';
                submitBtn.style.backgroundColor = '#4CAF50';
            });
        });
    