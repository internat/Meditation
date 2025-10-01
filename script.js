// Global Variables
let timerInterval;
let currentDuration = 300; // 5 minutes default
let timeRemaining = currentDuration;
let isTimerRunning = false;
let breathingInterval;
let isBreathingActive = false;
let currentBreathingPattern = '4-7-8';

// Sound objects for ambient sounds
const sounds = {
    rain: null,
    forest: null,
    ocean: null,
    birds: null,
    fire: null,
    wind: null
};

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const timerMinutes = document.getElementById('timer-minutes');
const timerSeconds = document.getElementById('timer-seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const durationBtns = document.querySelectorAll('.duration-btn');
const progressRing = document.querySelector('.progress-ring-circle');
const breathingCircle = document.querySelector('.breathing-circle');
const breathingToggle = document.getElementById('breathing-toggle');
const breathingInstruction = document.getElementById('breathing-instruction');
const patternBtns = document.querySelectorAll('.pattern-btn');
const soundCards = document.querySelectorAll('.sound-card');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTimer();
    initializeBreathing();
    initializeSounds();
    initializeScrollAnimation();
});

// Navigation Functions
function initializeNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Timer Functions
function initializeTimer() {
    updateTimerDisplay();
    
    // Duration button handlers
    durationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isTimerRunning) return;
            
            durationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentDuration = parseInt(btn.dataset.duration);
            timeRemaining = currentDuration;
            updateTimerDisplay();
            resetProgressRing();
        });
    });

    // Control button handlers
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Initialize progress ring
    const circumference = 2 * Math.PI * 90;
    progressRing.style.strokeDasharray = circumference;
    progressRing.style.strokeDashoffset = circumference;
}

function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    progressRing.classList.add('active');
    
    const circumference = 2 * Math.PI * 90;
    const totalTime = currentDuration;
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // Update progress ring
        const progress = (totalTime - timeRemaining) / totalTime;
        const offset = circumference - (progress * circumference);
        progressRing.style.strokeDashoffset = offset;
        
        if (timeRemaining <= 0) {
            completeTimer();
        }
    }, 1000);
    
    // Update button text
    startBtn.innerHTML = '<i class="fas fa-play"></i> Running...';
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
}

function resetTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    timeRemaining = currentDuration;
    updateTimerDisplay();
    resetProgressRing();
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
}

function completeTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    // Play completion sound (bell chime)
    playCompletionSound();
    
    // Show completion message
    showNotification('Meditation session complete! 🧘‍♀️');
    
    // Reset UI
    resetTimer();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    timerMinutes.textContent = minutes.toString().padStart(2, '0');
    timerSeconds.textContent = seconds.toString().padStart(2, '0');
}

function resetProgressRing() {
    const circumference = 2 * Math.PI * 90;
    progressRing.style.strokeDashoffset = circumference;
    progressRing.classList.remove('active');
}

// Breathing Exercise Functions
function initializeBreathing() {
    breathingToggle.addEventListener('click', toggleBreathing);
    
    patternBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isBreathingActive) return;
            
            patternBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBreathingPattern = btn.dataset.pattern;
        });
    });
}

function toggleBreathing() {
    if (isBreathingActive) {
        stopBreathing();
    } else {
        startBreathing();
    }
}

function startBreathing() {
    isBreathingActive = true;
    breathingToggle.innerHTML = '<i class="fas fa-stop"></i> Stop Breathing';
    
    const patterns = {
        '4-7-8': { inhale: 4, hold: 7, exhale: 8 },
        '4-4-4': { inhale: 4, hold: 4, exhale: 4 },
        'simple': { inhale: 4, hold: 0, exhale: 4 }
    };
    
    const pattern = patterns[currentBreathingPattern];
    breathingCycle(pattern);
}

function stopBreathing() {
    isBreathingActive = false;
    clearTimeout(breathingInterval);
    breathingToggle.innerHTML = '<i class="fas fa-play"></i> Start Breathing';
    breathingInstruction.textContent = 'Click "Start Breathing" to begin your practice';
    breathingCircle.className = 'breathing-circle';
}

function breathingCycle(pattern) {
    if (!isBreathingActive) return;
    
    // Inhale phase
    breathingCircle.className = 'breathing-circle inhale';
    breathingInstruction.textContent = `Breathe in for ${pattern.inhale} seconds`;
    
    breathingInterval = setTimeout(() => {
        if (!isBreathingActive) return;
        
        if (pattern.hold > 0) {
            // Hold phase
            breathingCircle.className = 'breathing-circle hold';
            breathingInstruction.textContent = `Hold for ${pattern.hold} seconds`;
            
            breathingInterval = setTimeout(() => {
                if (!isBreathingActive) return;
                
                // Exhale phase
                breathingCircle.className = 'breathing-circle exhale';
                breathingInstruction.textContent = `Breathe out for ${pattern.exhale} seconds`;
                
                breathingInterval = setTimeout(() => {
                    breathingCycle(pattern); // Repeat cycle
                }, pattern.exhale * 1000);
            }, pattern.hold * 1000);
        } else {
            // Direct to exhale (simple breathing)
            breathingCircle.className = 'breathing-circle exhale';
            breathingInstruction.textContent = `Breathe out for ${pattern.exhale} seconds`;
            
            breathingInterval = setTimeout(() => {
                breathingCycle(pattern); // Repeat cycle
            }, pattern.exhale * 1000);
        }
    }, pattern.inhale * 1000);
}

// Sound Functions
function initializeSounds() {
    soundCards.forEach(card => {
        const soundType = card.dataset.sound;
        const soundBtn = card.querySelector('.sound-btn');
        const volumeSlider = card.querySelector('.volume-slider');
        
        // Create audio objects with placeholder URLs
        // In a real implementation, you would use actual audio files
        sounds[soundType] = createSoundLoop(soundType);
        
        soundBtn.addEventListener('click', () => toggleSound(soundType, soundBtn));
        volumeSlider.addEventListener('input', (e) => setSoundVolume(soundType, e.target.value));
    });
}

function createSoundLoop(soundType) {
    // Create placeholder audio context for demonstration
    // In production, you would load actual audio files
    return {
        playing: false,
        volume: 0.5,
        play: function() {
            this.playing = true;
            console.log(`Playing ${soundType} sound`);
        },
        pause: function() {
            this.playing = false;
            console.log(`Pausing ${soundType} sound`);
        },
        setVolume: function(volume) {
            this.volume = volume;
            console.log(`Setting ${soundType} volume to ${volume}`);
        }
    };
}

function toggleSound(soundType, btn) {
    const sound = sounds[soundType];
    
    if (sound.playing) {
        sound.pause();
        btn.innerHTML = '<i class="fas fa-play"></i>';
        btn.classList.remove('playing');
    } else {
        sound.play();
        btn.innerHTML = '<i class="fas fa-pause"></i>';
        btn.classList.add('playing');
    }
}

function setSoundVolume(soundType, volume) {
    const sound = sounds[soundType];
    sound.setVolume(volume / 100);
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function playCompletionSound() {
    // Create a simple bell sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
}

function showNotification(message) {
    // Create and show a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Scroll Animation
function initializeScrollAnimation() {
    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space bar to start/pause timer
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        if (document.activeElement.closest('#meditation')) {
            if (isTimerRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }
    }
    
    // Escape to reset timer
    if (e.code === 'Escape') {
        if (isTimerRunning) {
            resetTimer();
        }
        if (isBreathingActive) {
            stopBreathing();
        }
    }
});

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.control-btn') || e.target.closest('.sound-btn')) {
        e.preventDefault();
    }
});

// Handle visibility change (pause when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isTimerRunning) {
        // Timer continues running in background
        console.log('Timer running in background');
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        startTimer,
        pauseTimer,
        resetTimer,
        startBreathing,
        stopBreathing,
        toggleSound
    };
}