let allBookingsData = [];
let blockedDatesData = [];

// Switch between tabs
function switchTab(tab) {
    // Update nav buttons
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// Load all data
async function loadData() {
    await Promise.all([
        loadBookings(),
        loadBlockedDates()
    ]);
    updateStats();
}

// Load bookings
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings');
        allBookingsData = await response.json();

        renderPendingBookings();
        renderApprovedBookings();
        renderAllBookings();
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Load blocked dates
async function loadBlockedDates() {
    try {
        const response = await fetch('/api/blocked-dates');
        blockedDatesData = await response.json();
        renderBlockedDates();
    } catch (error) {
        console.error('Error loading blocked dates:', error);
    }
}

// Update statistics
function updateStats() {
    const pendingBookings = allBookingsData.filter(b => b.status === 'pending');
    const approvedBookings = allBookingsData.filter(b => b.status === 'approved');

    document.getElementById('pendingCount').textContent = pendingBookings.length;
    document.getElementById('approvedCount').textContent = approvedBookings.length;
    document.getElementById('blockedCount').textContent = blockedDatesData.length;
}

// Render pending bookings
function renderPendingBookings() {
    const container = document.getElementById('pendingBookings');
    const pendingBookings = allBookingsData.filter(b => b.status === 'pending');

    if (pendingBookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Pending Requests</h3>
                <p>All caught up! No booking requests waiting for approval.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bookings-table">
            <table>
                <thead>
                    <tr>
                        <th>Guest</th>
                        <th>Contact</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Guests</th>
                        <th>Message</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${pendingBookings.map(booking => `
                        <tr>
                            <td><strong>${booking.guest_name}</strong></td>
                            <td>
                                ${booking.guest_email}<br>
                                ${booking.guest_phone || 'No phone'}
                            </td>
                            <td>${formatDate(booking.check_in)}</td>
                            <td>${formatDate(booking.check_out)}</td>
                            <td>${booking.guests}</td>
                            <td>${booking.message || 'No message'}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-approve" onclick="updateBookingStatus(${booking.id}, 'approved')">
                                        Approve
                                    </button>
                                    <button class="btn btn-deny" onclick="updateBookingStatus(${booking.id}, 'denied')">
                                        Deny
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render approved bookings
function renderApprovedBookings() {
    const container = document.getElementById('approvedBookings');
    const approvedBookings = allBookingsData.filter(b => b.status === 'approved');

    if (approvedBookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Approved Bookings</h3>
                <p>No confirmed bookings at the moment.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bookings-table">
            <table>
                <thead>
                    <tr>
                        <th>Guest</th>
                        <th>Contact</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Guests</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${approvedBookings.map(booking => `
                        <tr>
                            <td><strong>${booking.guest_name}</strong></td>
                            <td>
                                ${booking.guest_email}<br>
                                ${booking.guest_phone || 'No phone'}
                            </td>
                            <td>${formatDate(booking.check_in)}</td>
                            <td>${formatDate(booking.check_out)}</td>
                            <td>${booking.guests}</td>
                            <td>
                                <button class="btn btn-delete" onclick="deleteBooking(${booking.id})">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render all bookings
function renderAllBookings() {
    const container = document.getElementById('allBookings');

    if (allBookingsData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Bookings Yet</h3>
                <p>No booking requests have been received.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bookings-table">
            <table>
                <thead>
                    <tr>
                        <th>Guest</th>
                        <th>Contact</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allBookingsData.map(booking => `
                        <tr>
                            <td><strong>${booking.guest_name}</strong></td>
                            <td>
                                ${booking.guest_email}<br>
                                ${booking.guest_phone || 'No phone'}
                            </td>
                            <td>${formatDate(booking.check_in)}</td>
                            <td>${formatDate(booking.check_out)}</td>
                            <td>${booking.guests}</td>
                            <td>
                                <span class="status-badge ${booking.status}">${booking.status}</span>
                            </td>
                            <td>
                                <button class="btn btn-delete" onclick="deleteBooking(${booking.id})">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render blocked dates
function renderBlockedDates() {
    const container = document.getElementById('blockedDatesList');

    if (blockedDatesData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Blocked Dates</h3>
                <p>You haven't blocked any dates yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = blockedDatesData.map(blocked => `
        <div class="blocked-date-item">
            <div class="blocked-date-info">
                <strong>${formatDate(blocked.start_date)} - ${formatDate(blocked.end_date)}</strong>
                ${blocked.reason ? `<br><small>${blocked.reason}</small>` : ''}
            </div>
            <button class="btn btn-delete" onclick="deleteBlockedDate(${blocked.id})">
                Remove
            </button>
        </div>
    `).join('');
}

// Update booking status
async function updateBookingStatus(id, status) {
    if (!confirm(`Are you sure you want to ${status === 'approved' ? 'approve' : 'deny'} this booking?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            await loadData();
            alert(`Booking ${status} successfully!`);
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to update booking');
        }
    } catch (error) {
        console.error('Error updating booking:', error);
        alert('An error occurred');
    }
}

// Delete booking
async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/bookings/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadData();
            alert('Booking deleted successfully!');
        } else {
            alert('Failed to delete booking');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('An error occurred');
    }
}

// Block dates form submission
document.getElementById('blockDateForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const startDate = document.getElementById('blockStartDate').value;
    const endDate = document.getElementById('blockEndDate').value;
    const reason = document.getElementById('blockReason').value;

    if (new Date(startDate) >= new Date(endDate)) {
        showBlockAlert('error', 'End date must be after start date');
        return;
    }

    try {
        const response = await fetch('/api/blocked-dates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                start_date: startDate,
                end_date: endDate,
                reason
            })
        });

        if (response.ok) {
            showBlockAlert('success', 'Dates blocked successfully!');
            document.getElementById('blockDateForm').reset();
            await loadData();
        } else {
            const error = await response.json();
            showBlockAlert('error', error.error || 'Failed to block dates');
        }
    } catch (error) {
        console.error('Error blocking dates:', error);
        showBlockAlert('error', 'An error occurred');
    }
});

// Delete blocked date
async function deleteBlockedDate(id) {
    if (!confirm('Are you sure you want to remove this blocked period?')) {
        return;
    }

    try {
        const response = await fetch(`/api/blocked-dates/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadData();
            alert('Blocked period removed successfully!');
        } else {
            alert('Failed to remove blocked period');
        }
    } catch (error) {
        console.error('Error deleting blocked date:', error);
        alert('An error occurred');
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show alert in block form
function showBlockAlert(type, message) {
    const alertContainer = document.getElementById('blockAlertContainer');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    if (type === 'success') {
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Set minimum dates for block form
const today = new Date().toISOString().split('T')[0];
document.getElementById('blockStartDate').setAttribute('min', today);
document.getElementById('blockEndDate').setAttribute('min', today);

document.getElementById('blockStartDate').addEventListener('change', (e) => {
    document.getElementById('blockEndDate').setAttribute('min', e.target.value);
});

// Load data on page load
loadData();

// Auto-refresh every 60 seconds
setInterval(loadData, 60000);
