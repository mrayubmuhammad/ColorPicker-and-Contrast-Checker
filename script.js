// DOM Elements
const fgColorInput = document.getElementById('fg-color');
const bgColorInput = document.getElementById('bg-color');
const fgHexInput = document.getElementById('fg-hex-input');
const bgHexInput = document.getElementById('bg-hex-input');
const fgPreview = document.getElementById('fg-preview');
const bgPreview = document.getElementById('bg-preview');
const fgHexDisplay = document.getElementById('fg-hex-display');
const bgHexDisplay = document.getElementById('bg-hex-display');
const swapBtn = document.getElementById('swap-colors');
const randomizeBtn = document.getElementById('randomize-colors');
const toastContainer = document.getElementById('toast-container');

const contrastRatioDisplay = document.getElementById('contrast-ratio');
const overallRatingDisplay = document.getElementById('overall-rating');
const previewBox = document.getElementById('preview-box');

const statusElements = {
    aaNormal: document.getElementById('aa-normal'),
    aaLarge: document.getElementById('aa-large'),
    aaaNormal: document.getElementById('aaa-normal'),
    aaaLarge: document.getElementById('aaa-large')
};

// State
let state = {
    fg: '#FFFFFF',
    bg: '#6366F1'
};

// Utilities
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getLuminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(fgHex, bgHex) {
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);

    if (!fg || !bg) return 0;

    const lum1 = getLuminance(fg.r, fg.g, fg.b);
    const lum2 = getLuminance(bg.r, bg.g, bg.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

function validateHex(hex) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}

function updateState(key, value) {
    if (validateHex(value)) {
        state[key] = value;
        updateUI();
    }
}

function getRating(ratio) {
    if (ratio >= 7) return { text: 'Excellent', color: '#10b981' }; // Green
    if (ratio >= 4.5) return { text: 'Good', color: '#3b82f6' };   // Blue
    if (ratio >= 3) return { text: 'Fair', color: '#f59e0b' };     // Orange
    return { text: 'Poor', color: '#ef4444' };                     // Red
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateStatus(element, pass) {
    element.textContent = pass ? 'Pass' : 'Fail';
    element.className = `status ${pass ? 'pass' : 'fail'}`;
}

function updateUI() {
    // Update Inputs if they don't match state (avoid cursor jumping if focused)
    if (document.activeElement !== fgHexInput) fgHexInput.value = state.fg;
    if (document.activeElement !== bgHexInput) bgHexInput.value = state.bg;

    fgColorInput.value = state.fg;
    bgColorInput.value = state.bg;

    // Update Visuals
    fgPreview.style.backgroundColor = state.fg;
    bgPreview.style.backgroundColor = state.bg;
    fgHexDisplay.textContent = state.fg.toUpperCase();
    bgHexDisplay.textContent = state.bg.toUpperCase();

    // Update Preview Box
    previewBox.style.color = state.fg;
    previewBox.style.backgroundColor = state.bg;
    previewBox.style.borderColor = state.fg + '20'; // Add slight border opacity

    // Calculate Contrast
    const ratio = getContrastRatio(state.fg, state.bg);
    const roundedRatio = Math.floor(ratio * 100) / 100; // Floor to 2 decimals
    contrastRatioDisplay.textContent = roundedRatio.toFixed(2);

    // Update Rating Badge
    const rating = getRating(ratio);
    overallRatingDisplay.textContent = rating.text;
    overallRatingDisplay.style.backgroundColor = rating.color + '20'; // 20% opacity
    overallRatingDisplay.style.color = rating.color;

    // Update Compliance
    updateStatus(statusElements.aaNormal, ratio >= 4.5);
    updateStatus(statusElements.aaLarge, ratio >= 3.0);
    updateStatus(statusElements.aaaNormal, ratio >= 7.0);
    updateStatus(statusElements.aaaLarge, ratio >= 4.5);
}

// Event Listeners
fgColorInput.addEventListener('input', (e) => updateState('fg', e.target.value));
bgColorInput.addEventListener('input', (e) => updateState('bg', e.target.value));

fgHexInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (validateHex(val)) updateState('fg', val);
});

bgHexInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (validateHex(val)) updateState('bg', val);
});

swapBtn.addEventListener('click', () => {
    const temp = state.fg;
    state.fg = state.bg;
    state.bg = temp;
    updateUI();
    showToast('Colors swapped!', 'info');
});

randomizeBtn.addEventListener('click', () => {
    state.fg = getRandomColor();
    state.bg = getRandomColor();
    updateUI();
    showToast('Colors randomized!', 'success');
});

// Initialize
updateUI();
