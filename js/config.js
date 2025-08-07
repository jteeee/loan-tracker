/**
 * Core configuration and constants for the Loan Tracker Widget
 */

export const CONFIG = {
    // Interest rate configuration
    INTEREST_RATE: 0.0825, // 8.25% annual rate
    
    // Currency configuration
    CURRENCY: 'USD',
    LOCALE: 'en-US',
    
    // Date configuration
    DATE_FORMAT: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    },
    
    // Storage configuration
    STORAGE_KEY: 'loanTrackerTransactions',
    BACKUP_PREFIX: 'loan_tracker_backup_',
    EXPORT_PREFIX: 'loan_tracker_',
    
    // UI configuration
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    
    // Validation configuration
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 999999999.99,
    MAX_NOTE_LENGTH: 500,
    
    // Performance configuration
    VIRTUAL_SCROLL_THRESHOLD: 100,
    
    // Version information
    VERSION: '2.0.0',
    DATA_VERSION: '1.0'
};

export const TRANSACTION_TYPES = {
    LOAN_OUT: 'Loan Out',
    PAYMENT: 'Payment'
};

export const VALIDATION_RULES = {
    DATE: {
        required: true,
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Please enter a valid date'
    },
    AMOUNT: {
        required: true,
        min: CONFIG.MIN_AMOUNT,
        max: CONFIG.MAX_AMOUNT,
        pattern: /^\d+(\.\d{1,2})?$/,
        message: `Amount must be between $${CONFIG.MIN_AMOUNT} and $${CONFIG.MAX_AMOUNT.toLocaleString()}`
    },
    NOTES: {
        required: false,
        maxLength: CONFIG.MAX_NOTE_LENGTH,
        message: `Notes cannot exceed ${CONFIG.MAX_NOTE_LENGTH} characters`
    }
};

export const ERROR_MESSAGES = {
    INVALID_DATE: 'Please enter a valid date',
    INVALID_AMOUNT: 'Please enter a valid amount',
    AMOUNT_TOO_LOW: `Amount must be at least $${CONFIG.MIN_AMOUNT}`,
    AMOUNT_TOO_HIGH: `Amount cannot exceed $${CONFIG.MAX_AMOUNT.toLocaleString()}`,
    NOTES_TOO_LONG: `Notes cannot exceed ${CONFIG.MAX_NOTE_LENGTH} characters`,
    GENERIC_ERROR: 'An error occurred. Please try again.',
    STORAGE_ERROR: 'Unable to save data. Please check your browser settings.',
    IMPORT_ERROR: 'Invalid file format. Please select a valid backup file.',
    EXPORT_ERROR: 'Unable to export data. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    FUTURE_DATE_WARNING: 'Future dates will affect interest calculations',
    DUPLICATE_WARNING: 'Similar transaction detected. Are you sure you want to add this?'
};

export const SUCCESS_MESSAGES = {
    TRANSACTION_ADDED: 'Transaction added successfully',
    TRANSACTION_DELETED: 'Transaction deleted successfully',
    DATA_SAVED: 'Data saved successfully',
    DATA_LOADED: 'Data loaded successfully',
    DATA_EXPORTED: 'Data exported successfully',
    DATA_CLEARED: 'All data cleared successfully'
};

export const ICONS = {
    DOLLAR: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    PLUS: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>',
    MINUS: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>',
    TRASH: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    DOWNLOAD: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3"/></svg>',
    UPLOAD: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 13V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10c0 1.1.9 2 2 2h8"/><path d="m4 8 10 6 10-6"/><path d="m16 22 5-5m0 0-5-5m5 5H10"/></svg>',
    PRINT: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    SAVE: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    INFO: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',
    SUCCESS: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
    ERROR: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    WARNING: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/></svg>',
    EDIT: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    SEARCH: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    FILTER: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>',
    CLOSE: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

export const ACCESSIBILITY = {
    LABELS: {
        SKIP_LINK: 'Skip to main content',
        MAIN_HEADING: 'Loan Tracker Application',
        STATS_SECTION: 'Financial statistics',
        FORM_SECTION: 'Add new transaction',
        HISTORY_SECTION: 'Transaction history',
        CONTROLS_SECTION: 'Data management controls',
        DELETE_BUTTON: 'Delete transaction',
        EDIT_BUTTON: 'Edit transaction',
        AMOUNT_INPUT: 'Transaction amount in dollars',
        DATE_INPUT: 'Transaction date',
        TYPE_SELECT: 'Transaction type',
        NOTES_INPUT: 'Optional notes for transaction',
        ADD_BUTTON: 'Add new transaction',
        EXPORT_BUTTON: 'Export data to Excel',
        PRINT_BUTTON: 'Print report',
        SAVE_BUTTON: 'Save data backup',
        LOAD_BUTTON: 'Load data from backup',
        CLEAR_BUTTON: 'Clear all data'
    },
    DESCRIPTIONS: {
        CURRENT_BALANCE: 'Current outstanding balance including accrued interest',
        TOTAL_LOANED: 'Total amount loaned out',
        TOTAL_PAYMENTS: 'Total amount of payments received',
        TOTAL_INTEREST: 'Total interest calculated',
        DAYS_ACTIVE: 'Number of days since first transaction',
        TRANSACTION_TABLE: 'List of all transactions with calculated interest and running balance'
    }
};

export const KEYBOARD_SHORTCUTS = {
    ADD_TRANSACTION: 'Ctrl+Enter',
    SAVE_DATA: 'Ctrl+S',
    EXPORT_DATA: 'Ctrl+E',
    PRINT: 'Ctrl+P',
    FOCUS_AMOUNT: 'Alt+A',
    FOCUS_DATE: 'Alt+D',
    FOCUS_NOTES: 'Alt+N'
};