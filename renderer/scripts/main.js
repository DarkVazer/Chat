import { initializeChat } from './chatModule.js';

// Initialize DOM elements
const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');
const container = document.querySelector('.container');
const minimizeBtn = document.querySelector('#minimizeBtn');
const maximizeBtn = document.querySelector('#maximizeBtn');
const closeBtn = document.querySelector('#closeBtn');


let isSidebarOpen = false; // Sidebar is closed by default on first load

// Debugging: Check if buttons are found
console.log('minimizeBtn:', minimizeBtn);
console.log('maximizeBtn:', maximizeBtn);
console.log('closeBtn:', closeBtn);


// Apply initial sidebar state
container.style.marginLeft = '60px'; // Set initial container margin for closed sidebar

// Enable transition after initial load to avoid animation on startup
window.addEventListener('load', () => {
    sidebar.classList.add('transition-enabled');
});

// Toggle sidebar visibility
function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    sidebar.classList.toggle('open', isSidebarOpen);
    container.style.marginLeft = isSidebarOpen ? '125px' : '60px';
}




// Window control handlers
function handleMinimize() {
    console.log('Minimize button clicked');
    window.electronAPI.minimizeWindow();
}

function handleMaximize() {
    console.log('Maximize button clicked');
    window.electronAPI.maximizeWindow();
}

function handleClose() {
    console.log('Close button clicked');
    window.electronAPI.closeWindow();
}


// Attach event listeners
if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
} else {
    console.error('sidebarToggleBtn not found');
}

if (minimizeBtn) {
    minimizeBtn.addEventListener('click', handleMinimize);
} else {
    console.error('minimizeBtn not found');
}

if (maximizeBtn) {
    maximizeBtn.addEventListener('click', handleMaximize);
} else {
    console.error('maximizeBtn not found');
}

if (closeBtn) {
    closeBtn.addEventListener('click', handleClose);
} else {
    console.error('closeBtn not found');
}




// Initialize chat functionality
initializeChat();