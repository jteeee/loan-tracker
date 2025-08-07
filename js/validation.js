/**
 * Comprehensive validation utilities for the Loan Tracker Widget
 */

import { CONFIG, VALIDATION_RULES, ERROR_MESSAGES } from './config.js';

export class ValidationError extends Error {
    constructor(message, field = null, code = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = code;
    }
}

/**
 * Utility functions for common validation tasks
 */
export const ValidationUtils = {
    /**
     * Check if a value is empty or null
     */
    isEmpty(value) {
        return value === null || value === undefined || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0);
    },

    /**
     * Sanitize HTML to prevent XSS attacks
     */
    sanitizeHtml(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    /**
     * Validate and parse a date string
     */
    parseDate(dateString) {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_DATE, 'date', 'INVALID_DATE');
        }
        
        return date;
    },

    /**
     * Validate and parse a numeric amount
     */
    parseAmount(amountString) {
        if (this.isEmpty(amountString)) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_AMOUNT, 'amount', 'REQUIRED');
        }
        
        const amount = parseFloat(amountString);
        
        if (isNaN(amount)) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_AMOUNT, 'amount', 'INVALID_NUMBER');
        }
        
        if (amount < CONFIG.MIN_AMOUNT) {
            throw new ValidationError(ERROR_MESSAGES.AMOUNT_TOO_LOW, 'amount', 'TOO_LOW');
        }
        
        if (amount > CONFIG.MAX_AMOUNT) {
            throw new ValidationError(ERROR_MESSAGES.AMOUNT_TOO_HIGH, 'amount', 'TOO_HIGH');
        }
        
        return Math.round(amount * 100) / 100; // Round to 2 decimal places
    },

    /**
     * Validate transaction type
     */
    validateTransactionType(type) {
        const validTypes = Object.values(CONFIG.TRANSACTION_TYPES || ['Loan Out', 'Payment']);
        if (!validTypes.includes(type)) {
            throw new ValidationError('Invalid transaction type', 'type', 'INVALID_TYPE');
        }
        return type;
    },

    /**
     * Validate and sanitize notes
     */
    validateNotes(notes) {
        if (this.isEmpty(notes)) return '';
        
        const sanitized = this.sanitizeHtml(notes.trim());
        
        if (sanitized.length > CONFIG.MAX_NOTE_LENGTH) {
            throw new ValidationError(ERROR_MESSAGES.NOTES_TOO_LONG, 'notes', 'TOO_LONG');
        }
        
        return sanitized;
    },

    /**
     * Check if a date is in the future
     */
    isFutureDate(date) {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        return date > today;
    },

    /**
     * Validate file type for imports
     */
    validateFileType(file, allowedTypes = ['.json']) {
        const fileName = file.name.toLowerCase();
        const isValid = allowedTypes.some(type => fileName.endsWith(type));
        
        if (!isValid) {
            throw new ValidationError(
                `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
                'file',
                'INVALID_FILE_TYPE'
            );
        }
        
        return true;
    },

    /**
     * Validate file size
     */
    validateFileSize(file, maxSizeMB = 10) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        
        if (file.size > maxSizeBytes) {
            throw new ValidationError(
                `File size too large. Maximum size: ${maxSizeMB}MB`,
                'file',
                'FILE_TOO_LARGE'
            );
        }
        
        return true;
    }
};

/**
 * Transaction validator class
 */
export class TransactionValidator {
    constructor() {
        this.errors = {};
        this.warnings = {};
    }

    /**
     * Clear all errors and warnings
     */
    clear() {
        this.errors = {};
        this.warnings = {};
    }

    /**
     * Add an error for a specific field
     */
    addError(field, message, code = null) {
        if (!this.errors[field]) {
            this.errors[field] = [];
        }
        this.errors[field].push({ message, code });
    }

    /**
     * Add a warning for a specific field
     */
    addWarning(field, message, code = null) {
        if (!this.warnings[field]) {
            this.warnings[field] = [];
        }
        this.warnings[field].push({ message, code });
    }

    /**
     * Check if there are any errors
     */
    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    /**
     * Check if there are any warnings
     */
    hasWarnings() {
        return Object.keys(this.warnings).length > 0;
    }

    /**
     * Get all error messages
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Get all warning messages
     */
    getWarnings() {
        return this.warnings;
    }

    /**
     * Get the first error message for a field
     */
    getFieldError(field) {
        return this.errors[field]?.[0]?.message || null;
    }

    /**
     * Get the first warning message for a field
     */
    getFieldWarning(field) {
        return this.warnings[field]?.[0]?.message || null;
    }

    /**
     * Validate a complete transaction
     */
    validateTransaction(transaction, existingTransactions = []) {
        this.clear();

        try {
            // Validate date
            const date = ValidationUtils.parseDate(transaction.date);
            if (ValidationUtils.isFutureDate(date)) {
                this.addWarning('date', ERROR_MESSAGES.FUTURE_DATE_WARNING, 'FUTURE_DATE');
            }
        } catch (error) {
            this.addError('date', error.message, error.code);
        }

        try {
            // Validate amount
            ValidationUtils.parseAmount(transaction.amount);
        } catch (error) {
            this.addError('amount', error.message, error.code);
        }

        try {
            // Validate type
            ValidationUtils.validateTransactionType(transaction.type);
        } catch (error) {
            this.addError('type', error.message, error.code);
        }

        try {
            // Validate notes
            ValidationUtils.validateNotes(transaction.notes);
        } catch (error) {
            this.addError('notes', error.message, error.code);
        }

        // Check for potential duplicates
        this.checkForDuplicates(transaction, existingTransactions);

        return !this.hasErrors();
    }

    /**
     * Check for potential duplicate transactions
     */
    checkForDuplicates(transaction, existingTransactions) {
        const potential = existingTransactions.find(existing => 
            existing.date === transaction.date &&
            existing.type === transaction.type &&
            Math.abs(parseFloat(existing.amount) - parseFloat(transaction.amount)) < 0.01
        );

        if (potential) {
            this.addWarning('duplicate', ERROR_MESSAGES.DUPLICATE_WARNING, 'DUPLICATE');
        }
    }

    /**
     * Validate import data format
     */
    validateImportData(data) {
        this.clear();

        if (!data || typeof data !== 'object') {
            this.addError('format', 'Invalid data format', 'INVALID_FORMAT');
            return false;
        }

        if (!Array.isArray(data.transactions)) {
            this.addError('transactions', 'Transactions must be an array', 'INVALID_TRANSACTIONS');
            return false;
        }

        // Validate each transaction
        data.transactions.forEach((transaction, index) => {
            const validator = new TransactionValidator();
            if (!validator.validateTransaction(transaction)) {
                const errors = validator.getErrors();
                Object.keys(errors).forEach(field => {
                    this.addError(
                        `transaction_${index}_${field}`,
                        `Transaction ${index + 1}: ${errors[field][0].message}`,
                        errors[field][0].code
                    );
                });
            }
        });

        return !this.hasErrors();
    }
}

/**
 * Real-time form validation class
 */
export class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.validator = new TransactionValidator();
        this.setupValidation();
    }

    /**
     * Setup real-time validation for form fields
     */
    setupValidation() {
        if (!this.form) return;

        // Get form fields
        this.dateField = this.form.querySelector('#transactionDate');
        this.typeField = this.form.querySelector('#transactionType');
        this.amountField = this.form.querySelector('#transactionAmount');
        this.notesField = this.form.querySelector('#transactionNotes');

        // Setup event listeners with debouncing
        if (this.dateField) {
            this.setupFieldValidation(this.dateField, 'date', this.validateDate.bind(this));
        }
        
        if (this.amountField) {
            this.setupFieldValidation(this.amountField, 'amount', this.validateAmount.bind(this));
        }
        
        if (this.notesField) {
            this.setupFieldValidation(this.notesField, 'notes', this.validateNotes.bind(this));
        }
    }

    /**
     * Setup validation for a specific field
     */
    setupFieldValidation(field, fieldName, validationFn) {
        let timeout;
        
        const validate = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                try {
                    validationFn(field.value);
                    this.showFieldSuccess(field);
                } catch (error) {
                    this.showFieldError(field, error.message);
                }
            }, CONFIG.DEBOUNCE_DELAY);
        };

        field.addEventListener('input', validate);
        field.addEventListener('blur', validate);
    }

    /**
     * Validate date field
     */
    validateDate(value) {
        const date = ValidationUtils.parseDate(value);
        if (ValidationUtils.isFutureDate(date)) {
            throw new ValidationError(ERROR_MESSAGES.FUTURE_DATE_WARNING);
        }
        return date;
    }

    /**
     * Validate amount field
     */
    validateAmount(value) {
        return ValidationUtils.parseAmount(value);
    }

    /**
     * Validate notes field
     */
    validateNotes(value) {
        return ValidationUtils.validateNotes(value);
    }

    /**
     * Show field error state
     */
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove existing states
        formGroup.classList.remove('success');
        formGroup.classList.add('error');

        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <span class="icon">${CONFIG.ICONS?.ERROR || '⚠'}</span>
            <span>${message}</span>
        `;
        formGroup.appendChild(errorDiv);

        // Update ARIA attributes
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `${field.id}-error`);
        errorDiv.id = `${field.id}-error`;
    }

    /**
     * Show field success state
     */
    showFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove existing states
        formGroup.classList.remove('error');
        formGroup.classList.add('success');

        // Remove existing messages
        const existingMessage = formGroup.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Update ARIA attributes
        field.setAttribute('aria-invalid', 'false');
        field.removeAttribute('aria-describedby');
    }

    /**
     * Clear all field validation states
     */
    clearValidation() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const messages = group.querySelectorAll('.error-message, .success-message');
            messages.forEach(msg => msg.remove());
        });

        // Clear ARIA attributes
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.setAttribute('aria-invalid', 'false');
            field.removeAttribute('aria-describedby');
        });
    }

    /**
     * Validate the entire form
     */
    validateForm(existingTransactions = []) {
        const formData = {
            date: this.dateField?.value || '',
            type: this.typeField?.value || '',
            amount: this.amountField?.value || '',
            notes: this.notesField?.value || ''
        };

        const isValid = this.validator.validateTransaction(formData, existingTransactions);
        
        // Show field-specific errors
        const errors = this.validator.getErrors();
        Object.keys(errors).forEach(field => {
            const fieldElement = this.form.querySelector(`#transaction${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (fieldElement) {
                this.showFieldError(fieldElement, errors[field][0].message);
            }
        });

        return {
            isValid,
            data: formData,
            errors: this.validator.getErrors(),
            warnings: this.validator.getWarnings()
        };
    }
}

/**
 * Export validation utilities and classes
 */
export default {
    ValidationUtils,
    TransactionValidator,
    FormValidator,
    ValidationError
};