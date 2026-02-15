// Navigation scroll effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
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

// Intersection Observer for scroll animations
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

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Set minimum date for booking (today)
const today = new Date().toISOString().split('T')[0];
document.getElementById('checkIn').setAttribute('min', today);
document.getElementById('checkOut').setAttribute('min', today);

// Update checkout min date when checkin changes
document.getElementById('checkIn').addEventListener('change', (e) => {
    const checkInDate = e.target.value;
    document.getElementById('checkOut').setAttribute('min', checkInDate);

    // Reset checkout if it's before checkin
    const checkOutDate = document.getElementById('checkOut').value;
    if (checkOutDate && checkOutDate <= checkInDate) {
        document.getElementById('checkOut').value = '';
    }
});

// Load unavailable dates
let unavailableDates = [];

async function loadUnavailableDates() {
    try {
        const response = await fetch('/api/unavailable-dates');
        const data = await response.json();
        unavailableDates = data;
        updateDateValidation();
    } catch (error) {
        console.error('Error loading unavailable dates:', error);
    }
}

function isDateUnavailable(date) {
    const checkDate = new Date(date);

    for (const period of unavailableDates) {
        const start = new Date(period.start);
        const end = new Date(period.end);

        if (checkDate >= start && checkDate < end) {
            return true;
        }
    }

    return false;
}

function updateDateValidation() {
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');

    // Add data attributes for unavailable dates (for future calendar styling)
    checkInInput.setAttribute('data-unavailable', JSON.stringify(unavailableDates));
    checkOutInput.setAttribute('data-unavailable', JSON.stringify(unavailableDates));
}

// Booking form submission
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const alertContainer = document.getElementById('alertContainer');

    // Get form data
    const formData = {
        guest_name: document.getElementById('guestName').value.trim(),
        guest_email: document.getElementById('guestEmail').value.trim(),
        guest_phone: document.getElementById('guestPhone').value.trim(),
        check_in: document.getElementById('checkIn').value,
        check_out: document.getElementById('checkOut').value,
        guests: parseInt(document.getElementById('guests').value),
        message: document.getElementById('message').value.trim()
    };

    // Validate dates
    if (new Date(formData.check_in) >= new Date(formData.check_out)) {
        showAlert('error', 'Check-out date must be after check-in date.');
        return;
    }

    // Check if dates are available
    if (isDateRangeUnavailable(formData.check_in, formData.check_out)) {
        showAlert('error', 'Selected dates are not available. Please choose different dates.');
        return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Submitting...';

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('success', 'Booking request submitted successfully! We\'ll review your request and get back to you soon.');
            document.getElementById('bookingForm').reset();

            // Reload unavailable dates
            await loadUnavailableDates();
        } else {
            showAlert('error', result.error || 'Failed to submit booking request. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('error', 'An error occurred. Please try again later.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Booking Request';
    }
});

function isDateRangeUnavailable(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    for (const period of unavailableDates) {
        const periodStart = new Date(period.start);
        const periodEnd = new Date(period.end);

        // Check if dates overlap
        if (start < periodEnd && end > periodStart) {
            return true;
        }
    }

    return false;
}

function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Scroll to alert
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-remove success messages after 10 seconds
    if (type === 'success') {
        setTimeout(() => {
            alert.remove();
        }, 10000);
    }
}

// Load unavailable dates on page load
loadUnavailableDates();
