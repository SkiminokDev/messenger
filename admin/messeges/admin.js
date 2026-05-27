/**
 * Admin Panel JavaScript
 * Handles message count display and history clearing
 */

(function() {
    'use strict';

    // Configuration
    const API_COUNT_URL = '/api/admin/messeges/count';
    const API_CLEAR_URL = '/api/admin/messeges/clear';

    // DOM Elements
    const messageCountEl = document.getElementById('messageCount');
    const clearBtn = document.getElementById('clearBtn');
    const statusMessage = document.getElementById('statusMessage');

    /**
     * Fetch and display message count
     */
    async function fetchMessageCount() {
        try {
            const response = await fetch(API_COUNT_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                messageCountEl.textContent = result.data.count;
            } else {
                messageCountEl.textContent = 'Error';
            }

        } catch (error) {
            console.error('Failed to fetch message count:', error);
            messageCountEl.textContent = 'Error';
        }
    }

    /**
     * Show status message
     * @param {string} message - Status message text
     * @param {string} type - 'success' or 'error'
     */
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.className = 'status-message';
            }, 3000);
        }
    }

    /**
     * Clear all messages
     */
    async function clearHistory() {
        if (!confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
            return;
        }

        // Disable button during request
        clearBtn.disabled = true;
        clearBtn.textContent = 'Clearing...';

        try {
            const response = await fetch(API_CLEAR_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                showStatus('History cleared successfully!', 'success');
                // Refresh the count
                fetchMessageCount();
            } else {
                showStatus('Failed to clear history: ' + (result.error || 'Unknown error'), 'error');
            }

        } catch (error) {
            console.error('Failed to clear history:', error);
            showStatus('Error: ' + error.message, 'error');
        } finally {
            // Re-enable button
            clearBtn.disabled = false;
            clearBtn.textContent = 'Clear History';
        }
    }

    /**
     * Initialize the admin panel
     */
    function init() {
        // Load initial count
        fetchMessageCount();

        // Attach event listener to clear button
        clearBtn.addEventListener('click', clearHistory);

        console.log('Admin panel initialized');
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
