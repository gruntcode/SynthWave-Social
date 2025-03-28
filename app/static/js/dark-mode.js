/**
 * SynthWave Social - Dark Mode Toggle
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the dark mode toggle button
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Check for saved user preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply saved preference
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        updateToggleIcon(true);
    }
    
    // Toggle dark mode on click
    darkModeToggle.addEventListener('click', function() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateToggleIcon(isDarkMode);
        
        // Send preference to server if user is logged in
        const userId = this.dataset.userId;
        if (userId) {
            updateUserPreference(userId, isDarkMode);
        }
    });
    
    // Update the toggle icon based on dark mode state
    function updateToggleIcon(isDarkMode) {
        const icon = darkModeToggle.querySelector('i');
        if (isDarkMode) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            darkModeToggle.setAttribute('title', 'Switch to Light Mode');
            if (darkModeToggle.hasAttribute('data-bs-original-title')) {
                darkModeToggle.setAttribute('data-bs-original-title', 'Switch to Light Mode');
            }
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            darkModeToggle.setAttribute('title', 'Switch to Dark Mode');
            if (darkModeToggle.hasAttribute('data-bs-original-title')) {
                darkModeToggle.setAttribute('data-bs-original-title', 'Switch to Dark Mode');
            }
        }
    }
    
    // Update user preference on the server
    function updateUserPreference(userId, isDarkMode) {
        fetch('/api/update_preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                dark_mode: isDarkMode
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Preference updated:', data);
        })
        .catch(error => {
            console.error('Error updating preference:', error);
        });
    }
});
