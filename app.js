/**
 * Messenger Frontend Application
 * Implements polling mechanism to fetch new messages every 2 seconds
 */

(function() {
    'use strict';

    // Configuration
    const API_BASE_URL = '/api/v1/messeges';
    const POLLING_INTERVAL = 2000; // 2 seconds

    // State
    let lastMessageId = 0;
    let existingMessageIds = new Set();
    let isInitialLoad = true;

    // DOM Elements
    const messagesList = document.getElementById('messagesList');
    const statusIndicator = document.getElementById('statusIndicator');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    /**
     * Send message via AJAX POST request
     */
    async function sendMessage() {
        const text = messageInput.value.trim();
        
        if (!text) {
            return;
        }
        
        // Disable button while sending
        sendButton.disabled = true;
        
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text, type_user: 'sender' })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Clear input field
                messageInput.value = '';
                // Fetch latest messages to show the new one
                fetchMessages();
            } else {
                console.error('Failed to send message:', result.error);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            sendButton.disabled = false;
        }
    }

    /**
     * Handle Enter key press in message input
     */
    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }

    /**
     * Format date to readable time string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted time
     */
    function formatTime(dateString) {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * Create message element
     * @param {Object} message - Message object from API
     * @returns {HTMLElement} Message DOM element
     */
    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        // Determine message class based on type_user
        const messageType = message.type_user === 'admin' ? 'incoming' : 'outgoing';
        messageDiv.className = `message ${messageType}`;
        messageDiv.dataset.id = message.id;

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = message.text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = formatTime(message.created_at);

        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timeSpan);

        return messageDiv;
    }

    /**
     * Add new messages to the DOM
     * Only adds messages that don't already exist
     * @param {Array} messages - Array of message objects
     */
    function addMessages(messages) {
        let hasNewMessages = false;

        messages.forEach(message => {
            if (!existingMessageIds.has(message.id)) {
                const messageElement = createMessageElement(message);
                messagesList.appendChild(messageElement);
                existingMessageIds.add(message.id);
                
                if (message.id > lastMessageId) {
                    lastMessageId = message.id;
                }
                
                hasNewMessages = true;
            }
        });

        // Scroll to bottom only if there are new messages or on initial load
        if (hasNewMessages || isInitialLoad) {
            scrollToBottom();
        }

        // Show empty state if no messages
        if (messages.length === 0 && isInitialLoad) {
            showEmptyState();
        }

        isInitialLoad = false;
    }

    /**
     * Show empty state message
     */
    function showEmptyState() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.textContent = 'No messages yet';
        messagesList.appendChild(emptyDiv);
    }

    /**
     * Scroll messages container to bottom
     */
    function scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Update status indicator
     * @param {string} status - 'connected' or 'error'
     */
    function updateStatus(status) {
        statusIndicator.className = 'status-indicator ' + status;
        statusIndicator.textContent = status === 'connected' ? 'Connected' : 'Error';
    }

    /**
     * Fetch messages from API
     */
    async function fetchMessages() {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                updateStatus('connected');
                addMessages(result.data);
            } else {
                console.error('Invalid response format:', result);
                updateStatus('error');
            }

        } catch (error) {
            console.error('Failed to fetch messages:', error);
            updateStatus('error');
        }
    }

    /**
     * Initialize the messenger application
     */
    function init() {
        // Initial fetch
        fetchMessages();

        // Set up polling interval
        setInterval(fetchMessages, POLLING_INTERVAL);
        
        // Add event listeners for message input and send button
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', handleKeyPress);

        console.log('Messenger initialized. Polling every', POLLING_INTERVAL, 'ms');
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
