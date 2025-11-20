// VisuoLingo Frontend JavaScript

let statusUpdateInterval;
let isRecording = false;
let lastFaceDetectedState = null;
let faceWarningTimeout = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Hide loading overlay after a short delay
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }, 1500);

    // Setup event listeners
    setupEventListeners();
    setupScrollAnimations();
    setupStickyNavbar();
    setupParallaxEffects();
    initializeTheme();
    setupTiltEffects();
    setupScrollProgress();
    setupCounters();
    setupCarousel();
    setupMagneticButtons();
    setupButtonRipple();
    setupVisualShellParallax();
    
    // Don't start status updates until demo is opened
}

function setupEventListeners() {
    const tryDemoBtn = document.getElementById('tryDemoBtn');
    const navDemoBtn = document.getElementById('navDemoBtn');
    const backBtn = document.getElementById('backBtn');
    const startBtn = document.getElementById('startBtn');
    const testBtn = document.getElementById('testBtn');
    const setWordBtn = document.getElementById('setWordBtn');
    const wordInput = document.getElementById('wordInput');
    const statsBtn = document.getElementById('statsBtn');
    const themeToggle = document.getElementById('themeToggle');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');

    if (tryDemoBtn) {
        tryDemoBtn.addEventListener('click', handleTryDemo);
    }

    if (navDemoBtn) {
        navDemoBtn.addEventListener('click', handleTryDemo);
    }

    if (backBtn) {
        backBtn.addEventListener('click', handleBackToLanding);
    }

    if (startBtn) {
        startBtn.addEventListener('click', handleStartRecording);
    }

    if (testBtn) {
        testBtn.addEventListener('click', handleTestModel);
    }

    if (setWordBtn) {
        setWordBtn.addEventListener('click', handleSetWord);
    }

    if (wordInput) {
        wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSetWord();
            }
        });
    }

    if (statsBtn) {
        statsBtn.addEventListener('click', handleOpenStatsModal);
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (carouselPrev) {
        carouselPrev.addEventListener('click', () => rotateCarousel(-1));
    }
    if (carouselNext) {
        carouselNext.addEventListener('click', () => rotateCarousel(1));
    }
    
    // Prevent default on feature links
    const featureLinks = document.querySelectorAll('.feature-link');
    featureLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    // Setup navbar smooth scrolling
    setupNavbarLinks();

    // Setup stats modal
    setupStatsModal();
}

function initializeTheme() {
    const saved = localStorage.getItem('theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = saved || (prefersLight ? 'light' : 'dark');
    setTheme(theme);
}

function setTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
    } else {
        root.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        const icon = toggle.querySelector('.nav-cta-icon');
        const text = toggle.querySelector('.nav-cta-text');
        if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌗';
        if (text) text.textContent = theme === 'light' ? 'Light' : 'Theme';
    }
}

function toggleTheme() {
    const current = localStorage.getItem('theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
    showNotification(`Switched to ${next} theme`, 'success');
}

function setupTiltEffects() {
    const cards = document.querySelectorAll('.tilt-card, .feature-card');
    cards.forEach(card => {
        let rect;
        card.addEventListener('mouseenter', () => {
            rect = card.getBoundingClientRect();
        });
        card.addEventListener('mousemove', e => {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rx = ((y / rect.height) - 0.5) * -10;
            const ry = ((x / rect.width) - 0.5) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            const shine = card.querySelector('.tilt-shine');
            if (shine) {
                shine.style.setProperty('--mx', `${x}px`);
                shine.style.setProperty('--my', `${y}px`);
            } else {
                card.style.setProperty('--mx', `${x}px`);
                card.style.setProperty('--my', `${y}px`);
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

function setupMagneticButtons() {
    const buttons = document.querySelectorAll('.nav-cta, .cta-button');
    buttons.forEach(btn => {
        let rect;
        const target = btn.querySelector('.nav-cta-icon') || btn.querySelector('.arrow');
        btn.addEventListener('mouseenter', () => { rect = btn.getBoundingClientRect(); });
        btn.addEventListener('mousemove', e => {
            if (!rect || !target) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const dx = ((x / rect.width) - 0.5) * 8;
            const dy = ((y / rect.height) - 0.5) * 6;
            target.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            if (target) target.style.transform = '';
        });
    });
}

function setupButtonRipple() {
    const buttons = document.querySelectorAll('.cta-button');
    buttons.forEach(btn => {
        let rect;
        btn.addEventListener('mouseenter', () => { rect = btn.getBoundingClientRect(); });
        btn.addEventListener('mousemove', e => {
            if (!rect) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--rx', `${x}px`);
            btn.style.setProperty('--ry', `${y}px`);
        });
        btn.addEventListener('click', () => {
            btn.classList.add('ripple');
            setTimeout(() => btn.classList.remove('ripple'), 250);
        });
    });
}

function setupScrollProgress() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    const update = () => {
        const h = document.documentElement;
        const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
        bar.style.width = `${Math.max(0, Math.min(1, scrolled)) * 100}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}

function setupCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    const animate = el => {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();
        const step = now => {
            const p = Math.min(1, (now - startTime) / duration);
            const v = start + (target - start) * p;
            el.textContent = `${Number.isInteger(target) ? Math.round(v) : v.toFixed(2)}${suffix}`;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                animate(el);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.6 });
    counters.forEach(c => obs.observe(c));
}

let carouselState = { angle: 0, step: 0, radius: 360, items: [], track: null, interval: null };

function setupCarousel() {
    const track = document.querySelector('#labCarousel .carousel-track');
    if (!track) return;
    const items = Array.from(track.querySelectorAll('.carousel-item'));
    if (!items.length) return;
    const n = items.length;
    const step = 360 / n;
    const radius = 420;
    items.forEach((item, i) => {
        const ang = i * step;
        item.style.transform = `translate(-50%, -50%) rotateY(${ang}deg) translateZ(${radius}px)`;
    });
    carouselState = { angle: 0, step, radius, items, track, interval: null };
    const start = () => {
        stopCarousel();
        carouselState.interval = setInterval(() => rotateCarousel(1), 3000);
    };
    const stop = () => stopCarousel();
    start();
    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);
}

function rotateCarousel(dir) {
    if (!carouselState.track) return;
    carouselState.angle += dir * carouselState.step;
    carouselState.track.style.transform = `translateZ(-200px) rotateY(${carouselState.angle}deg)`;
}

function stopCarousel() {
    if (carouselState.interval) {
        clearInterval(carouselState.interval);
        carouselState.interval = null;
    }
}

function handleTryDemo() {
    // Hide all landing page sections
    const sections = document.querySelectorAll('section, .navbar');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
        appContainer.style.display = 'block';
        appContainer.style.animation = 'fadeIn 0.5s ease';
        
        // Start status updates when demo opens
        startStatusUpdates();
    }
}

function handleBackToLanding() {
    // Stop status updates
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
        statusUpdateInterval = null;
    }
    
    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // Show all landing page sections
    const sections = document.querySelectorAll('section, .navbar');
    sections.forEach(section => {
        section.style.display = '';
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleStartRecording() {
    if (isRecording) return;

    try {
        const response = await fetch('/api/start_recording', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.success) {
            isRecording = true;
            updateStartButton(true);
            showNotification('Recording started!', 'success');
        } else {
            showNotification(data.message || 'Failed to start recording', 'error');
        }
    } catch (error) {
        console.error('Error starting recording:', error);
        showNotification('Error starting recording', 'error');
    }
}

async function handleTestModel() {
    showNotification('Testing model...', 'info');
    
    // Set a test word
    const testWord = 'hello';
    await fetch('/api/set_word', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word: testWord })
    });

    // Start recording
    await handleStartRecording();
    
    showNotification('Test started! Say "' + testWord + '"', 'info');
}

async function handleSetWord() {
    const wordInput = document.getElementById('wordInput');
    const word = wordInput.value.trim();

    try {
        const response = await fetch('/api/set_word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ word: word })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification(word ? `Word set to: "${word}"` : 'Word cleared', 'success');
        }
    } catch (error) {
        console.error('Error setting word:', error);
        showNotification('Error setting word', 'error');
    }
}

function startStatusUpdates() {
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
    }
    
    statusUpdateInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            updateUI(status);
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    }, 200); // Update every 200ms for smooth animations
}

function updateUI(status) {
    // Update face detection status (only show warning when face is lost)
    updateFaceStatus(status.face_detected);
    
    // Update recording indicator
    updateRecordingIndicator(status.recording);
    
    // Update progress bar
    updateProgressBar(status.recording, status.progress);
    
    // Update predictions
    updatePredictions(status.predicted_word, status.confidence, status.actual_word, status.match);
    
    // Update status indicator
    updateStatusIndicator(status.face_detected, status.recording);
    
    // Update start button state
    if (!status.recording && !status.processing) {
        isRecording = false;
        updateStartButton(false);
    }
}

function updateFaceStatus(faceDetected) {
    const faceStatus = document.getElementById('faceStatus');
    if (!faceStatus) return;

    // Only show warning when face is NOT detected (not constantly when detected)
    if (!faceDetected) {
        // Face lost - show warning
        if (lastFaceDetectedState !== false) {
            faceStatus.classList.add('visible', 'warning');
            faceStatus.innerHTML = `
                <div class="status-icon">⚠️</div>
                <span class="status-message">Face not detected. Please position your face in the camera.</span>
            `;
            lastFaceDetectedState = false;
            
            // Clear any existing timeout
            if (faceWarningTimeout) {
                clearTimeout(faceWarningTimeout);
            }
        }
    } else {
        // Face detected - hide warning after a brief moment
        if (lastFaceDetectedState !== true) {
            lastFaceDetectedState = true;
            
            // Hide warning after 1 second
            if (faceWarningTimeout) {
                clearTimeout(faceWarningTimeout);
            }
            
            faceWarningTimeout = setTimeout(() => {
                faceStatus.classList.remove('visible', 'warning');
            }, 1000);
        }
    }
}

function updateRecordingIndicator(recording) {
    const indicator = document.getElementById('recordingIndicator');
    if (!indicator) return;

    if (recording) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
}

function updateProgressBar(recording, progress) {
    const container = document.getElementById('progressContainer');
    const bar = document.getElementById('progressBar');
    
    if (!container || !bar) return;

    if (recording) {
        container.classList.add('active');
        bar.style.width = progress + '%';
    } else {
        container.classList.remove('active');
        bar.style.width = '0%';
    }
}

function updatePredictions(predictedWord, confidence, actualWord, match) {
    const predictedWordEl = document.getElementById('predictedWord');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceText = document.getElementById('confidenceText');
    const predictionCard = document.querySelector('.prediction-card');
    const matchIndicator = document.getElementById('matchIndicator');
    const actualWordText = document.getElementById('actualWordText');

    // Update predicted word
    if (predictedWordEl) {
        if (predictedWord && confidence >= 80) {
            predictedWordEl.textContent = predictedWord.toUpperCase();
            predictedWordEl.classList.add('has-value');
        } else {
            predictedWordEl.textContent = '--';
            predictedWordEl.classList.remove('has-value');
        }
    }

    // Update confidence
    if (confidenceFill) {
        confidenceFill.style.width = confidence + '%';
    }
    
    if (confidenceText) {
        confidenceText.textContent = `Confidence: ${Math.round(confidence)}%`;
    }

    // Update prediction card
    if (predictionCard) {
        if (predictedWord && confidence >= 80) {
            predictionCard.classList.add('has-prediction');
        } else {
            predictionCard.classList.remove('has-prediction');
        }
    }

    // Update match indicator
    if (matchIndicator) {
        if (match && actualWord) {
            matchIndicator.classList.add('visible');
        } else {
            matchIndicator.classList.remove('visible');
        }
    }

    // Update actual word
    if (actualWordText) {
        if (actualWord) {
            actualWordText.textContent = actualWord.toUpperCase();
        } else {
            actualWordText.textContent = '--';
        }
    }
}

function updateStatusIndicator(faceDetected, recording) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (!statusDot || !statusText) return;

    if (recording) {
        statusDot.classList.add('active');
        statusText.textContent = 'Recording...';
    } else if (faceDetected) {
        statusDot.classList.add('active');
        statusText.textContent = 'Ready';
    } else {
        statusDot.classList.remove('active');
        statusText.textContent = 'Waiting for face...';
    }
}

function updateStartButton(recording) {
    const startBtn = document.getElementById('startBtn');
    if (!startBtn) return;

    if (recording) {
        startBtn.disabled = true;
        startBtn.innerHTML = `
            <span class="btn-icon">⏸</span>
            <span class="btn-text">Recording...</span>
        `;
    } else {
        startBtn.disabled = false;
        startBtn.innerHTML = `
            <span class="btn-icon">🎤</span>
            <span class="btn-text">Start Recording</span>
        `;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function setupNavbarLinks() {
    const navLinks = document.querySelectorAll('.nav-item[data-nav]');
    if (!navLinks.length) return;

    const sectionMap = Array.from(navLinks)
        .map(link => {
            const targetId = link.getAttribute('data-nav');
            const el = document.getElementById(targetId);
            return { link, id: targetId, el };
        })
        .filter(item => item.el);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-nav');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    if (!sectionMap.length) return;

    const highlightActive = () => {
        const scrollPosition = window.scrollY + 120;
        let currentId = sectionMap[0].id;

        sectionMap.forEach(({ id, el }) => {
            if (scrollPosition >= el.offsetTop) {
                currentId = id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-nav') === currentId);
        });
    };

    window.addEventListener('scroll', highlightActive, { passive: true });
    highlightActive();
}

function setupScrollAnimations() {
    const revealTargets = document.querySelectorAll('[data-scroll-reveal]');
    const featureCards = document.querySelectorAll('.feature-card');
    const keyFeatures = document.querySelectorAll('.key-feature');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const techCards = document.querySelectorAll('.tech-card');
    
    const allTargets = [...revealTargets, ...featureCards, ...keyFeatures, ...testimonialCards, ...techCards];
    
    if (!allTargets.length) return;

    if (!('IntersectionObserver' in window)) {
        allTargets.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    allTargets.forEach(target => observer.observe(target));
}

function setupStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const toggleState = () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', toggleState, { passive: true });
    toggleState();
}

function setupParallaxEffects() {
    const celestialLayer = document.querySelector('.celestial-layer');
    const aurora = document.querySelector('.hero-aurora');
    const orbs = document.querySelectorAll('.floating-orb');
    const heroSection = document.querySelector('.hero');

    if (!celestialLayer && !aurora && !orbs.length) return;

    const updateParallax = () => {
        const scrollY = window.scrollY;
        const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
        const heroProgress = Math.min(scrollY / heroHeight, 1);

        if (celestialLayer) {
            celestialLayer.style.transform = `translateY(${scrollY * 0.05}px)`;
        }

        if (aurora) {
            aurora.style.transform = `translate3d(0, ${heroProgress * 35}px, 0) scale(${1 + heroProgress * 0.05})`;
        }

        if (orbs.length) {
            orbs.forEach((orb, index) => {
                const shift = heroProgress * (index === 0 ? -40 : -60);
                orb.style.setProperty('--scroll-offset', `${shift}px`);
            });
        }
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
}

function setupVisualShellParallax() {
    const shell = document.querySelector('.visual-shell');
    if (!shell) return;
    let rect;
    const primary = shell.querySelector('.visual-card.primary');
    const secondary = shell.querySelector('.visual-card.secondary');
    shell.addEventListener('mouseenter', () => {
        rect = shell.getBoundingClientRect();
    });
    shell.addEventListener('mousemove', e => {
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rx = ((y / rect.height) - 0.5) * -4;
        const ry = ((x / rect.width) - 0.5) * 4;
        shell.style.setProperty('--mx', `${x}px`);
        shell.style.setProperty('--my', `${y}px`);
        if (primary) primary.style.transform = `translateZ(40px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        if (secondary) secondary.style.transform = `translateZ(20px) rotateX(${rx * 0.6}deg) rotateY(${ry * 0.6}deg)`;
    });
    shell.addEventListener('mouseleave', () => {
        if (primary) primary.style.transform = `translateZ(40px)`;
        if (secondary) secondary.style.transform = `translateZ(20px)`;
    });
}

let lossChart = null;
let accuracyChart = null;

function handleOpenStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Initialize charts after a short delay to ensure modal is visible
        setTimeout(() => {
            initializeCharts();
        }, 100);
    }
}

function initializeCharts() {
    // Destroy existing charts if they exist
    if (lossChart) {
        lossChart.destroy();
    }
    if (accuracyChart) {
        accuracyChart.destroy();
    }

    // Generate epoch data (0-17)
    const epochs = Array.from({ length: 18 }, (_, i) => i);
    
    // Loss data - starts at 1.2, decreases to 0.05
    const trainingLoss = epochs.map(epoch => {
        if (epoch <= 2.5) {
            return 1.2 - (epoch / 2.5) * 0.8; // Rapid decrease
        } else if (epoch <= 7.5) {
            return 0.4 - ((epoch - 2.5) / 5) * 0.3; // Gradual decrease
        } else {
            return 0.1 - ((epoch - 7.5) / 10) * 0.05; // Stabilize
        }
    });
    
    const validationLoss = epochs.map(epoch => {
        if (epoch <= 2.5) {
            return 1.05 - (epoch / 2.5) * 0.95; // Sharp decrease
        } else {
            return 0.1 - ((epoch - 2.5) / 15.5) * 0.05; // Flatten
        }
    });

    // Accuracy data - starts at 0.4, increases to 0.99
    const trainingAccuracy = epochs.map(epoch => {
        if (epoch <= 2.5) {
            return 0.4 + (epoch / 2.5) * 0.45; // Sharp increase
        } else if (epoch <= 5) {
            return 0.85 + ((epoch - 2.5) / 2.5) * 0.13; // Continue rising
        } else {
            return 0.98 + ((epoch - 5) / 13) * 0.01; // Stabilize
        }
    });
    
    const validationAccuracy = epochs.map(epoch => {
        if (epoch <= 1.5) {
            return 0.85 + (epoch / 1.5) * 0.14; // Very rapid increase
        } else {
            return 0.99 + ((epoch - 1.5) / 16.5) * 0.005; // Stable
        }
    });

    // Store full data for progressive animation
    window.chartData = {
        epochs,
        trainingLoss,
        validationLoss,
        trainingAccuracy,
        validationAccuracy
    };

    // Chart.js configuration
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        animation: {
            duration: 300,
            easing: 'linear'
        },
        plugins: {
            legend: {
                labels: {
                    color: '#a0a0a0',
                    font: {
                        family: 'Inter',
                        size: 12,
                        weight: 500
                    },
                    padding: 15,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(7, 11, 25, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#a0a0a0',
                borderColor: 'rgba(59, 130, 246, 0.5)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#666666',
                    font: {
                        family: 'Inter',
                        size: 11
                    }
                },
                title: {
                    display: true,
                    text: 'Epoch',
                    color: '#93c5fd',
                    font: {
                        family: 'Inter',
                        size: 12,
                        weight: 600
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#666666',
                    font: {
                        family: 'Inter',
                        size: 11
                    }
                }
            }
        }
    };

    // Loss Chart - Start with empty data
    const lossCtx = document.getElementById('lossChart');
    if (lossCtx) {
        lossChart = new Chart(lossCtx, {
            type: 'line',
            data: {
                labels: epochs,
                datasets: [
                    {
                        label: 'Training Loss',
                        data: Array(18).fill(null),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 8,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 3
                    },
                    {
                        label: 'Validation Loss',
                        data: Array(18).fill(null),
                        borderColor: 'rgb(251, 146, 60)',
                        backgroundColor: 'rgba(251, 146, 60, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 8,
                        pointBackgroundColor: 'rgb(251, 146, 60)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: 'rgb(251, 146, 60)',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 3
                    }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Loss',
                            color: '#93c5fd',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: 600
                            }
                        },
                        min: 0,
                        max: 1.2
                    }
                }
            }
        });
    }

    // Accuracy Chart - Start with empty data
    const accuracyCtx = document.getElementById('accuracyChart');
    if (accuracyCtx) {
        accuracyChart = new Chart(accuracyCtx, {
            type: 'line',
            data: {
                labels: epochs,
                datasets: [
                    {
                        label: 'Training Accuracy',
                        data: Array(18).fill(null),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 8,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 3
                    },
                    {
                        label: 'Validation Accuracy',
                        data: Array(18).fill(null),
                        borderColor: 'rgb(251, 146, 60)',
                        backgroundColor: 'rgba(251, 146, 60, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 8,
                        pointBackgroundColor: 'rgb(251, 146, 60)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: 'rgb(251, 146, 60)',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 3
                    }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Accuracy',
                            color: '#93c5fd',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: 600
                            }
                        },
                        min: 0.4,
                        max: 1.0
                    }
                }
            }
        });
    }

    // Animate charts progressively
    animateChartsProgressive();
}

function animateChartsProgressive() {
    if (!window.chartData) return;

    const { epochs, trainingLoss, validationLoss, trainingAccuracy, validationAccuracy } = window.chartData;
    let currentEpoch = 0;
    const totalEpochs = 18;
    const delayBetweenEpochs = 120; // milliseconds

    // Update epoch indicator
    const epochValueEl = document.getElementById('epochValue');
    const epochIndicatorEl = document.getElementById('epochIndicator');

    const animateEpoch = () => {
        if (currentEpoch >= totalEpochs) {
            // Animation complete - show final state
            if (epochValueEl) {
                epochValueEl.textContent = '17';
                epochValueEl.style.color = '#10b981';
            }
            if (epochIndicatorEl) {
                epochIndicatorEl.classList.add('complete');
            }
            return;
        }

        // Update epoch indicator
        if (epochValueEl) {
            epochValueEl.textContent = currentEpoch;
            epochValueEl.style.color = '#3b82f6';
            // Add pulse effect
            epochValueEl.style.transform = 'scale(1.2)';
            setTimeout(() => {
                if (epochValueEl) {
                    epochValueEl.style.transform = 'scale(1)';
                }
            }, 100);
        }

        // Update Loss Chart
        if (lossChart) {
            lossChart.data.datasets[0].data[currentEpoch] = trainingLoss[currentEpoch];
            lossChart.data.datasets[1].data[currentEpoch] = validationLoss[currentEpoch];
            lossChart.update('none'); // 'none' mode for instant update
        }

        // Update Accuracy Chart
        if (accuracyChart) {
            accuracyChart.data.datasets[0].data[currentEpoch] = trainingAccuracy[currentEpoch];
            accuracyChart.data.datasets[1].data[currentEpoch] = validationAccuracy[currentEpoch];
            accuracyChart.update('none'); // 'none' mode for instant update
        }

        currentEpoch++;
        
        // Continue animation
        if (currentEpoch < totalEpochs) {
            setTimeout(animateEpoch, delayBetweenEpochs);
        } else {
            // Final smooth animation to polish
            setTimeout(() => {
                if (lossChart) lossChart.update('active');
                if (accuracyChart) accuracyChart.update('active');
            }, delayBetweenEpochs);
        }
    };

    // Reset epoch indicator
    if (epochValueEl) {
        epochValueEl.textContent = '0';
        epochValueEl.style.color = '#6b7280';
    }
    if (epochIndicatorEl) {
        epochIndicatorEl.classList.remove('complete');
    }

    // Start animation after a short delay
    setTimeout(animateEpoch, 300);
}

function handleCloseStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Destroy charts to free memory
        if (lossChart) {
            lossChart.destroy();
            lossChart = null;
        }
        if (accuracyChart) {
            accuracyChart.destroy();
            accuracyChart = null;
        }
    }
}

function setupStatsModal() {
    const modal = document.getElementById('statsModal');
    const closeBtn = document.getElementById('statsModalClose');
    const backdrop = document.getElementById('statsModalBackdrop');

    if (closeBtn) {
        closeBtn.addEventListener('click', handleCloseStatsModal);
    }

    if (backdrop) {
        backdrop.addEventListener('click', handleCloseStatsModal);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            handleCloseStatsModal();
        }
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
    }
    if (faceWarningTimeout) {
        clearTimeout(faceWarningTimeout);
    }
});
