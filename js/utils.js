/**
 * Enhanced utility functions for the Loan Tracker Widget
 */

import { CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES, ICONS } from './config.js';

/**
 * Currency formatting utilities
 */
export const CurrencyUtils = {
    /**
     * Format a number as currency
     */
    format(amount, options = {}) {
        const config = {
            style: 'currency',
            currency: CONFIG.CURRENCY,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options
        };
        
        try {
            return new Intl.NumberFormat(CONFIG.LOCALE, config).format(amount);
        } catch (error) {
            console.warn('Currency formatting failed, using fallback:', error);
            return `$${amount.toFixed(2)}`;
        }
    },

    /**
     * Parse currency string to number
     */
    parse(currencyString) {
        if (typeof currencyString === 'number') return currencyString;
        
        // Remove currency symbols and spaces
        const cleanString = currencyString
            .replace(/[$,\s]/g, '')
            .replace(/[^\d.-]/g, '');
        
        const amount = parseFloat(cleanString);
        return isNaN(amount) ? 0 : amount;
    },

    /**
     * Format with color coding
     */
    formatWithClass(amount, type = 'default') {
        const formatted = this.format(amount);
        const className = this.getAmountClass(amount, type);
        return `<span class="${className}">${formatted}</span>`;
    },

    /**
     * Get CSS class for amount based on type
     */
    getAmountClass(amount, type) {
        const baseClass = 'amount-cell';
        
        switch (type) {
            case 'loan':
                return `${baseClass} loan-amount`;
            case 'payment':
                return `${baseClass} payment-amount`;
            case 'interest':
                return `${baseClass} interest-amount`;
            case 'balance':
                return `${baseClass} balance-amount`;
            default:
                return baseClass;
        }
    }
};

/**
 * Date formatting utilities
 */
export const DateUtils = {
    /**
     * Format a date for display
     */
    format(date, options = {}) {
        const config = {
            ...CONFIG.DATE_FORMAT,
            ...options
        };
        
        try {
            return new Intl.DateTimeFormat(CONFIG.LOCALE, config).format(new Date(date));
        } catch (error) {
            console.warn('Date formatting failed, using fallback:', error);
            return new Date(date).toLocaleDateString();
        }
    },

    /**
     * Format date for input fields (YYYY-MM-DD)
     */
    formatForInput(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Get today's date formatted for input
     */
    today() {
        return this.formatForInput(new Date());
    },

    /**
     * Calculate days between two dates
     */
    daysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    },

    /**
     * Check if a date is valid
     */
    isValid(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d.getTime());
    },

    /**
     * Get relative time description
     */
    getRelativeTime(date) {
        const now = new Date();
        const target = new Date(date);
        const diffDays = this.daysBetween(target, now);
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }
};

/**
 * Interest calculation utilities
 */
export const InterestUtils = {
    /**
     * Calculate simple interest
     */
    calculateSimple(principal, rate, days) {
        if (principal <= 0 || days <= 0) return 0;
        const dailyRate = rate / 365;
        return principal * dailyRate * days;
    },

    /**
     * Calculate compound interest (daily compounding)
     */
    calculateCompound(principal, rate, days) {
        if (principal <= 0 || days <= 0) return 0;
        const dailyRate = rate / 365;
        return principal * (Math.pow(1 + dailyRate, days) - 1);
    },

    /**
     * Calculate interest with the configured method
     */
    calculate(principal, startDate, endDate, rate = CONFIG.INTEREST_RATE) {
        const days = DateUtils.daysBetween(startDate, endDate);
        return this.calculateSimple(principal, rate, days);
    },

    /**
     * Get effective annual rate from total interest and principal
     */
    getEffectiveRate(totalInterest, totalPrincipal, days) {
        if (totalPrincipal <= 0 || days <= 0) return 0;
        const annualizedInterest = (totalInterest / totalPrincipal) * (365 / days);
        return annualizedInterest * 100;
    }
};

/**
 * Local storage utilities with error handling
 */
export const StorageUtils = {
    /**
     * Save data to localStorage with error handling
     */
    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            NotificationUtils.showError(ERROR_MESSAGES.STORAGE_ERROR);
            return false;
        }
    },

    /**
     * Load data from localStorage with error handling
     */
    load(key, defaultValue = null) {
        try {
            const serialized = localStorage.getItem(key);
            if (serialized === null) return defaultValue;
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove data from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    },

    /**
     * Check if localStorage is available
     */
    isAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get storage usage information
     */
    getUsage() {
        if (!this.isAvailable()) return null;
        
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return {
                used: total,
                usedFormatted: this.formatBytes(total),
                // Most browsers have a 5MB limit
                limit: 5 * 1024 * 1024,
                limitFormatted: '5MB'
            };
        } catch (error) {
            return null;
        }
    },

    /**
     * Format bytes for display
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

/**
 * File utilities for import/export
 */
export const FileUtils = {
    /**
     * Download data as a file
     */
    download(data, filename, type = 'application/json') {
        try {
            const blob = new Blob([data], { type });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Failed to download file:', error);
            NotificationUtils.showError(ERROR_MESSAGES.EXPORT_ERROR);
            return false;
        }
    },

    /**
     * Read file as text
     */
    readAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    },

    /**
     * Generate filename with timestamp
     */
    generateFilename(prefix, extension = '.json') {
        const timestamp = new Date().toISOString().split('T')[0];
        return `${prefix}${timestamp}${extension}`;
    },

    /**
     * Validate file before processing
     */
    validate(file, options = {}) {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['.json'],
            allowedMimeTypes = ['application/json', 'text/plain']
        } = options;

        // Check file size
        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size: ${StorageUtils.formatBytes(maxSize)}`);
        }

        // Check file extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedTypes.some(type => fileName.endsWith(type));
        
        if (!hasValidExtension) {
            throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        // Check MIME type if available
        if (file.type && allowedMimeTypes.length > 0) {
            const hasValidMimeType = allowedMimeTypes.includes(file.type);
            if (!hasValidMimeType) {
                throw new Error(`Invalid file format. Expected: ${allowedMimeTypes.join(', ')}`);
            }
        }

        return true;
    }
};

/**
 * Notification utilities for user feedback
 */
export const NotificationUtils = {
    /**
     * Show a notification
     */
    show(message, type = 'info', duration = 5000) {
        const notification = this.create(message, type);
        document.body.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }

        return notification;
    },

    /**
     * Create notification element
     */
    create(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">
                    ${ICONS.CLOSE}
                </button>
            </div>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));

        return notification;
    },

    /**
     * Hide notification
     */
    hide(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    /**
     * Get icon for notification type
     */
    getIcon(type) {
        switch (type) {
            case 'success':
                return ICONS.SUCCESS;
            case 'error':
                return ICONS.ERROR;
            case 'warning':
                return ICONS.WARNING;
            default:
                return ICONS.INFO;
        }
    },

    /**
     * Show success notification
     */
    showSuccess(message, duration = 5000) {
        return this.show(message, 'success', duration);
    },

    /**
     * Show error notification
     */
    showError(message, duration = 8000) {
        return this.show(message, 'error', duration);
    },

    /**
     * Show warning notification
     */
    showWarning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    },

    /**
     * Show info notification
     */
    showInfo(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
};

/**
 * DOM utilities
 */
export const DOMUtils = {
    /**
     * Safely query selector with error handling
     */
    query(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.error('Invalid selector:', selector, error);
            return null;
        }
    },

    /**
     * Safely query all elements
     */
    queryAll(selector, context = document) {
        try {
            return Array.from(context.querySelectorAll(selector));
        } catch (error) {
            console.error('Invalid selector:', selector, error);
            return [];
        }
    },

    /**
     * Add event listener with error handling
     */
    addEventListener(element, event, handler, options = {}) {
        if (!element || typeof handler !== 'function') return;
        
        try {
            element.addEventListener(event, handler, options);
        } catch (error) {
            console.error('Failed to add event listener:', error);
        }
    },

    /**
     * Create element with attributes and content
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.keys(attributes[key]).forEach(dataKey => {
                    element.dataset[dataKey] = attributes[key][dataKey];
                });
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.appendChild(content);
            }
        }

        return element;
    },

    /**
     * Debounce function calls
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Animate element
     */
    animate(element, keyframes, options = {}) {
        if (!element || !element.animate) return;
        
        try {
            return element.animate(keyframes, {
                duration: CONFIG.ANIMATION_DURATION,
                easing: 'ease-out',
                ...options
            });
        } catch (error) {
            console.error('Animation failed:', error);
            return null;
        }
    }
};

/**
 * Accessibility utilities
 */
export const A11yUtils = {
    /**
     * Set focus with error handling
     */
    focus(element) {
        if (!element || typeof element.focus !== 'function') return;
        
        try {
            element.focus();
        } catch (error) {
            console.error('Failed to focus element:', error);
        }
    },

    /**
     * Announce message to screen readers
     */
    announce(message, priority = 'polite') {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = message;
        
        document.body.appendChild(announcer);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    },

    /**
     * Manage focus trap for modals
     */
    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });

        firstElement?.focus();
    }
};

/**
 * Performance utilities
 */
export const PerformanceUtils = {
    /**
     * Measure function execution time
     */
    measure(fn, name = 'function') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} execution time: ${end - start} milliseconds`);
        return result;
    },

    /**
     * Create a batch processor for large operations
     */
    createBatchProcessor(batchSize = 100) {
        return function (items, processor, onComplete) {
            let index = 0;
            
            function processBatch() {
                const batch = items.slice(index, index + batchSize);
                batch.forEach(processor);
                index += batchSize;
                
                if (index < items.length) {
                    requestAnimationFrame(processBatch);
                } else if (onComplete) {
                    onComplete();
                }
            }
            
            processBatch();
        };
    }
};

// Export all utilities
export default {
    CurrencyUtils,
    DateUtils,
    InterestUtils,
    StorageUtils,
    FileUtils,
    NotificationUtils,
    DOMUtils,
    A11yUtils,
    PerformanceUtils
};