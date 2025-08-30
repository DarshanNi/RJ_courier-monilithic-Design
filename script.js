// RJCouriers JavaScript Functionality

// Global variables
let bookings = [];
let isAdmin = false;
let bookingCounter = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSampleData();
    updateBookingsList();
    updatePaymentBookings();
    updateAdminStats();
    updateRecentActivity();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Booking form submission
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmission);
    
    // Real-time cost calculation
    document.getElementById('weight').addEventListener('input', updateEstimatedCost);
    document.getElementById('deliveryType').addEventListener('change', updateEstimatedCost);
    
    // Payment booking selection
    document.getElementById('paymentBookingSelect').addEventListener('change', handlePaymentBookingSelection);
    
    // Payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show selected section
    document.getElementById(sectionName + 'Section').style.display = 'block';
    
    // Update content with fade effect
    const content = document.getElementById('content');
    content.classList.remove('fade-in');
    setTimeout(() => content.classList.add('fade-in'), 10);
}

function toggleUserMode() {
    isAdmin = !isAdmin;
    const userInfo = document.getElementById('userInfo');
    const userModeBtn = document.getElementById('userModeBtn');
    const adminBtn = document.getElementById('adminBtn');
    const reportsBtn = document.getElementById('reportsBtn');
    
    if (isAdmin) {
        userInfo.textContent = 'Welcome, Admin';
        userModeBtn.textContent = 'Switch to User';
        adminBtn.style.display = 'flex';
        reportsBtn.style.display = 'flex';
    } else {
        userInfo.textContent = 'Welcome, Guest';
        userModeBtn.textContent = 'Switch to Admin';
        adminBtn.style.display = 'none';
        reportsBtn.style.display = 'none';
    }
}

// Booking functions
function handleBookingSubmission(e) {
    e.preventDefault();
    
    const booking = {
        id: 'RJ' + String(bookingCounter).padStart(3, '0'),
        senderName: document.getElementById('senderName').value,
        senderPhone: document.getElementById('senderPhone').value,
        senderAddress: document.getElementById('senderAddress').value,
        receiverName: document.getElementById('receiverName').value,
        receiverPhone: document.getElementById('receiverPhone').value,
        receiverAddress: document.getElementById('receiverAddress').value,
        packageType: document.getElementById('packageType').value,
        weight: parseFloat(document.getElementById('weight').value),
        deliveryType: document.getElementById('deliveryType').value,
        description: document.getElementById('packageDescription').value,
        status: 'pending',
        cost: calculateCost(),
        bookingDate: new Date().toLocaleDateString(),
        paymentStatus: 'unpaid'
    };
    
    bookings.push(booking);
    bookingCounter++;
    
    showSuccessMessage(`Booking successful! Your tracking number is: ${booking.id}`);
    document.getElementById('bookingForm').reset();
    document.getElementById('estimatedCost').textContent = '$0.00';
    
    updateAllSections();
}

// Cost calculation
function calculateCost() {
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const deliveryType = document.getElementById('deliveryType').value;
    
    let baseCost = weight * 5; // $5 per kg
    
    switch(deliveryType) {
        case 'express': 
            baseCost *= 1.5; 
            break;
        case 'overnight': 
            baseCost *= 2; 
            break;
        default: 
            break;
    }
    
    return Math.max(baseCost, 10); // Minimum $10
}

function updateEstimatedCost() {
    const cost = calculateCost();
    document.getElementById('estimatedCost').textContent = '$' + cost.toFixed(2);
}

// Bookings list functions
function updateBookingsList() {
    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = '';
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p class="text-gray-500 text-center py-8">No bookings found.</p>';
        return;
    }
    
    bookings.forEach(booking => {
        const bookingCard = createBookingCard(booking);
        bookingsList.appendChild(bookingCard);
    });
}

function createBookingCard(booking) {
    const div = document.createElement('div');
    div.className = 'booking-card bg-white border border-gray-200 rounded-lg p-6 slide-in';
    div.dataset.status = booking.status;
    
    const statusColors = {
        'pending': 'status-pending',
        'in-transit': 'status-in-transit',
        'delivered': 'status-delivered'
    };
    
    div.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold">${booking.id}</h3>
                <p class="text-gray-600">${booking.senderName} → ${booking.receiverName}</p>
            </div>
            <span class="status-badge ${statusColors[booking.status]}">
                ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
        </div>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div>
                <p><strong>Package:</strong> ${booking.packageType}</p>
                <p><strong>Weight:</strong> ${booking.weight}kg</p>
                <p><strong>Delivery:</strong> ${booking.deliveryType}</p>
            </div>
            <div>
                <p><strong>Cost:</strong> $${booking.cost.toFixed(2)}</p>
                <p><strong>Payment:</strong> ${booking.paymentStatus}</p>
                <p><strong>Date:</strong> ${booking.bookingDate}</p>
            </div>
        </div>
    `;
    
    return div;
}

function filterBookings(status) {
    const bookingCards = document.querySelectorAll('#bookingsList > div');
    bookingCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Payment functions
function updatePaymentBookings() {
    const select = document.getElementById('paymentBookingSelect');
    select.innerHTML = '<option value="">Select a booking</option>';
    
    bookings.filter(b => b.paymentStatus === 'unpaid').forEach(booking => {
        const option = document.createElement('option');
        option.value = booking.id;
        option.textContent = `${booking.id} - $${booking.cost.toFixed(2)}`;
        select.appendChild(option);
    });
}

function handlePaymentBookingSelection() {
    const bookingId = this.value;
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
        document.getElementById('paymentDetails').style.display = 'block';
        document.getElementById('paymentInfo').innerHTML = `
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Amount:</strong> $${booking.cost.toFixed(2)}</p>
            <p><strong>From:</strong> ${booking.senderName}</p>
            <p><strong>To:</strong> ${booking.receiverName}</p>
        `;
    } else {
        document.getElementById('paymentDetails').style.display = 'none';
    }
}

function handlePaymentMethodChange() {
    const paymentForm = document.getElementById('paymentForm');
    const paymentFormContent = document.getElementById('paymentFormContent');
    const payButton = document.getElementById('payButton');
    
    paymentForm.style.display = 'block';
    payButton.style.display = 'block';
    
    switch(this.value) {
        case 'credit':
            paymentFormContent.innerHTML = createCreditCardForm();
            break;
        case 'paypal':
            paymentFormContent.innerHTML = createPayPalForm();
            break;
        case 'cash':
            paymentFormContent.innerHTML = createCashForm();
            break;
        case 'bank':
            paymentFormContent.innerHTML = createBankTransferForm();
            break;
    }
}

function createCreditCardForm() {
    return `
        <div class="space-y-4">
            <input type="text" placeholder="Card Number" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <div class="grid grid-cols-2 gap-4">
                <input type="text" placeholder="MM/YY" class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <input type="text" placeholder="CVV" class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <input type="text" placeholder="Cardholder Name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
    `;
}

function createPayPalForm() {
    return `
        <div class="text-center p-8">
            <div class="bg-blue-600 text-white p-4 rounded-lg inline-block mb-4">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                </svg>
            </div>
            <p>You will be redirected to PayPal to complete your payment.</p>
        </div>
    `;
}

function createCashForm() {
    return `
        <div class="text-center p-8">
            <div class="bg-green-600 text-white p-4 rounded-lg inline-block mb-4">💵</div>
            <p>Payment will be collected upon delivery.</p>
            <p class="text-sm text-gray-600 mt-2">Please have exact change ready.</p>
        </div>
    `;
}

function createBankTransferForm() {
    return `
        <div class="space-y-4">
            <div class="bg-gray-100 p-4 rounded-lg">
                <h4 class="font-semibold mb-2">Bank Details:</h4>
                <p><strong>Account:</strong> RJCouriers Ltd</p>
                <p><strong>Account No:</strong> 1234567890</p>
                <p><strong>Routing:</strong> 987654321</p>
            </div>
            <input type="text" placeholder="Your Reference Number" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
    `;
}

function processPayment() {
    const bookingId = document.getElementById('paymentBookingSelect').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (!bookingId || !paymentMethod) {
        showErrorMessage('Please select a booking and payment method.');
        return;
    }
    
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'in-transit';
        
        showSuccessMessage(`Payment successful! Your package ${bookingId} is now in transit.`);
        
        resetPaymentForm();
        updateAllSections();
    }
}

function resetPaymentForm() {
    document.getElementById('paymentBookingSelect').value = '';
    document.getElementById('paymentDetails').style.display = 'none';
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('payButton').style.display = 'none';
    document.querySelectorAll('input[name="paymentMethod"]').forEach(r => r.checked = false);
}

// Tracking functions
function trackPackage() {
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    const booking = bookings.find(b => b.id === trackingNumber);
    
    if (!booking) {
        showErrorMessage('Tracking number not found. Please check and try again.');
        return;
    }
    
    displayTrackingResult(booking);
}

function displayTrackingResult(booking) {
    document.getElementById('trackingResult').style.display = 'block';
    
    document.getElementById('trackingInfo').innerHTML = `
        <h3 class="text-xl font-semibold mb-2">Package ${booking.id}</h3>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div>
                <p><strong>From:</strong> ${booking.senderName}</p>
                <p><strong>To:</strong> ${booking.receiverName}</p>
                <p><strong>Package Type:</strong> ${booking.packageType}</p>
            </div>
            <div>
                <p><strong>Weight:</strong> ${booking.weight}kg</p>
                <p><strong>Delivery Type:</strong> ${booking.deliveryType}</p>
                <p><strong>Status:</strong> <span class="font-semibold text-blue-600">${booking.status}</span></p>
            </div>
        </div>
    `;
    
    const steps = getTrackingSteps(booking);
    const trackingSteps = document.getElementById('trackingSteps');
    trackingSteps.innerHTML = '';
    
    steps.forEach((step, index) => {
        const stepDiv = createTrackingStep(step, index);
        trackingSteps.appendChild(stepDiv);
    });
}

function createTrackingStep(step, index) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'relative flex items-center';
    
    const isCompleted = step.completed;
    const isCurrent = step.current;
    
    stepDiv.innerHTML = `
        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-500 text-white' : 
            isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
        }">
            ${isCompleted ? '✓' : index + 1}
        </div>
        <div class="ml-4">
            <h4 class="font-semibold ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}">${step.title}</h4>
            <p class="text-sm text-gray-600">${step.description}</p>
            ${step.timestamp ? `<p class="text-xs text-gray-500">${step.timestamp}</p>` : ''}
        </div>
    `;
    
    return stepDiv;
}

function getTrackingSteps(booking) {
    return [
        { 
            title: 'Booking Confirmed', 
            description: 'Your package booking has been confirmed', 
            completed: true, 
            timestamp: booking.bookingDate 
        },
        { 
            title: 'Payment Processed', 
            description: 'Payment has been received and processed', 
            completed: booking.paymentStatus === 'paid', 
            timestamp: booking.paymentStatus === 'paid' ? booking.bookingDate : null 
        },
        { 
            title: 'Package Picked Up', 
            description: 'Package has been collected from sender', 
            completed: booking.status !== 'pending', 
            current: booking.status === 'in-transit' 
        },
        { 
            title: 'In Transit', 
            description: 'Package is on its way to destination', 
            completed: booking.status === 'delivered', 
            current: booking.status === 'in-transit' 
        },
        { 
            title: 'Delivered', 
            description: 'Package has been delivered successfully', 
            completed: booking.status === 'delivered', 
            current: false 
        }
    ];
}

// Admin functions
function updateAdminStats() {
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('deliveredCount').textContent = bookings.filter(b => b.status === 'delivered').length;
    document.getElementById('inTransitCount').textContent = bookings.filter(b => b.status === 'in-transit').length;
    
    updateAdminBookingsList();
}

function updateAdminBookingsList() {
    const adminList = document.getElementById('adminBookingsList');
    adminList.innerHTML = '';
    
    if (bookings.length === 0) {
        adminList.innerHTML = '<p class="text-gray-500 text-center py-8">No bookings found.</p>';
        return;
    }
    
    bookings.forEach(booking => {
        const div = createAdminBookingItem(booking);
        adminList.appendChild(div);
    });
}

function createAdminBookingItem(booking) {
    const div = document.createElement('div');
    div.className = 'border-b border-gray-200 py-4 last:border-b-0';
    
    div.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <h4 class="font-semibold">${booking.id}</h4>
                <p class="text-sm text-gray-600">${booking.senderName} → ${booking.receiverName}</p>
                <p class="text-sm text-gray-500">${booking.packageType} • ${booking.weight}kg • $${booking.cost.toFixed(2)}</p>
            </div>
            <div class="flex items-center space-x-2">
                <select onchange="updateBookingStatus('${booking.id}', this.value)" class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-transit" ${booking.status === 'in-transit' ? 'selected' : ''}>In Transit</option>
                    <option value="delivered" ${booking.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </div>
        </div>
    `;
    
    return div;
}

function updateBookingStatus(bookingId, newStatus) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        updateAllSections();
        showSuccessMessage(`Booking ${bookingId} status updated to ${newStatus}`);
    }
}

// Reports functions
function updateRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    const activities = [
        { time: '2 minutes ago', action: 'Package RJ003 delivered successfully', type: 'success' },
        { time: '15 minutes ago', action: 'New booking RJ004 created', type: 'info' },
        { time: '1 hour ago', action: 'Payment received for RJ002', type: 'success' },
        { time: '2 hours ago', action: 'Package RJ001 picked up', type: 'info' },
        { time: '3 hours ago', action: 'New user registration', type: 'info' }
    ];
    
    recentActivity.innerHTML = '';
    activities.forEach(activity => {
        const div = createActivityItem(activity);
        recentActivity.appendChild(div);
    });
}

function createActivityItem(activity) {
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-3 p-3 bg-gray-50 rounded-lg';
    
    div.innerHTML = `
        <div class="flex-shrink-0">
            <div class="w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}"></div>
        </div>
        <div class="flex-1">
            <p class="text-sm font-medium">${activity.action}</p>
            <p class="text-xs text-gray-500">${activity.time}</p>
        </div>
    `;
    
    return div;
}

// Utility functions
function updateAllSections() {
    updateBookingsList();
    updatePaymentBookings();
    updateAdminStats();
}

function showSuccessMessage(message) {
    alert(message); // In production, replace with a proper toast notification
}

function showErrorMessage(message) {
    alert(message); // In production, replace with a proper error notification
}

// Load sample data
function loadSampleData() {
    const sampleBookings = [
        {
            id: 'RJ001',
            senderName: 'John Smith',
            senderPhone: '+1234567890',
            senderAddress: '123 Main St, New York, NY',
            receiverName: 'Jane Doe',
            receiverPhone: '+1987654321',
            receiverAddress: '456 Oak Ave, Los Angeles, CA',
            packageType: 'document',
            weight: 0.5,
            deliveryType: 'express',
            description: 'Important legal documents',
            status: 'delivered',
            cost: 25.00,
            bookingDate: '2024-01-15',
            paymentStatus: 'paid'
        },
        {
            id: 'RJ002',
            senderName: 'Alice Johnson',
            senderPhone: '+1122334455',
            senderAddress: '789 Pine St, Chicago, IL',
            receiverName: 'Bob Wilson',
            receiverPhone: '+1555666777',
            receiverAddress: '321 Elm St, Miami, FL',
            packageType: 'parcel',
            weight: 2.3,
            deliveryType: 'standard',
            description: 'Birthday gift',
            status: 'in-transit',
            cost: 35.50,
            bookingDate: '2024-01-16',
            paymentStatus: 'paid'
        },
        {
            id: 'RJ003',
            senderName: 'Mike Brown',
            senderPhone: '+1999888777',
            senderAddress: '555 Cedar Rd, Seattle, WA',
            receiverName: 'Sarah Davis',
            receiverPhone: '+1444333222',
            receiverAddress: '777 Maple Dr, Boston, MA',
            packageType: 'electronics',
            weight: 1.8,
            deliveryType: 'overnight',
            description: 'Laptop computer',
            status: 'pending',
            cost: 75.00,
            bookingDate: '2024-01-17',
            paymentStatus: 'unpaid'
        }
    ];
    
    bookings = sampleBookings;
    bookingCounter = 4;
}

// Export functions for global access (if needed)
window.showSection = showSection;
window.toggleUserMode = toggleUserMode;
window.filterBookings = filterBookings;
window.trackPackage = trackPackage;
window.processPayment = processPayment;
window.updateBookingStatus = updateBookingStatus;