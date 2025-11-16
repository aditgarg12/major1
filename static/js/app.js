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
    
    // Don't start status updates until demo is opened
}

function setupEventListeners() {
    const tryDemoBtn = document.getElementById('tryDemoBtn');
    const backBtn = document.getElementById('backBtn');
    const startBtn = document.getElementById('startBtn');
    const testBtn = document.getElementById('testBtn');
    const setWordBtn = document.getElementById('setWordBtn');
    const wordInput = document.getElementById('wordInput');

    if (tryDemoBtn) {
        tryDemoBtn.addEventListener('click', handleTryDemo);
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
    
    // Prevent default on feature links
    const featureLinks = document.querySelectorAll('.feature-link');
    featureLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });
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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
    }
    if (faceWarningTimeout) {
        clearTimeout(faceWarningTimeout);
    }
});
