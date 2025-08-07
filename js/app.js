/**
 * Main Loan Tracker Widget Application
 * Enhanced with robust error handling, accessibility, and modern features
 */

import { CONFIG, TRANSACTION_TYPES, ACCESSIBILITY, KEYBOARD_SHORTCUTS } from './config.js';
import { FormValidator, ValidationError } from './validation.js';
import { 
    CurrencyUtils, 
    DateUtils, 
    InterestUtils, 
    StorageUtils, 
    FileUtils, 
    NotificationUtils,
    DOMUtils,
    A11yUtils 
} from './utils.js';

/**
 * Main Application Class
 */
class LoanTrackerWidget {
    constructor(container) {
        this.container = container;
        this.transactions = [];
        this.formValidator = null;
        this.isLoading = false;
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.setupAccessibility();
            this.setupFormValidation();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            await this.loadData();
            this.updateDisplay();
            this.setupPerformanceOptimizations();
            
            // Show success message for initialization
            NotificationUtils.showSuccess('Loan Tracker initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Loan Tracker:', error);
            NotificationUtils.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add skip link
        if (!document.querySelector('.skip-link')) {
            const skipLink = DOMUtils.createElement('a', {
                className: 'skip-link',
                href: '#main-content',
                'aria-label': ACCESSIBILITY.LABELS.SKIP_LINK
            }, 'Skip to main content');
            
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        // Add main landmark
        const mainContent = DOMUtils.query('#main-content') || DOMUtils.query('.content');
        if (mainContent && !mainContent.getAttribute('role')) {
            mainContent.setAttribute('role', 'main');
            mainContent.id = 'main-content';
        }

        // Setup ARIA labels
        this.setupAriaLabels();
    }

    /**
     * Setup ARIA labels for better accessibility
     */
    setupAriaLabels() {
        const elements = {
            '#transactionDate': ACCESSIBILITY.LABELS.DATE_INPUT,
            '#transactionType': ACCESSIBILITY.LABELS.TYPE_SELECT,
            '#transactionAmount': ACCESSIBILITY.LABELS.AMOUNT_INPUT,
            '#transactionNotes': ACCESSIBILITY.LABELS.NOTES_INPUT,
            '.btn-primary': ACCESSIBILITY.LABELS.ADD_BUTTON,
            '[onclick="exportToExcel()"]': ACCESSIBILITY.LABELS.EXPORT_BUTTON,
            '[onclick="printReport()"]': ACCESSIBILITY.LABELS.PRINT_BUTTON,
            '[onclick="saveData()"]': ACCESSIBILITY.LABELS.SAVE_BUTTON,
            '[onclick="loadData()"]': ACCESSIBILITY.LABELS.LOAD_BUTTON,
            '[onclick="clearAllData()"]': ACCESSIBILITY.LABELS.CLEAR_BUTTON
        };

        Object.keys(elements).forEach(selector => {
            const element = DOMUtils.query(selector);
            if (element && !element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', elements[selector]);
            }
        });
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        const form = DOMUtils.query('.input-section');
        if (form) {
            this.formValidator = new FormValidator(form);
        }
    }

    /**
     * Setup event listeners with error handling
     */
    setupEventListeners() {
        // Form submission
        const addButton = DOMUtils.query('button[onclick="addTransaction()"]');
        if (addButton) {
            addButton.removeAttribute('onclick');
            DOMUtils.addEventListener(addButton, 'click', (e) => {
                e.preventDefault();
                this.handleAddTransaction();
            });
        }

        // Control buttons
        this.setupControlButtons();

        // Real-time form updates
        this.setupFormUpdates();

        // Window events
        DOMUtils.addEventListener(window, 'beforeunload', () => {
            this.saveData();
        });

        // Error handling for unhandled promise rejections
        DOMUtils.addEventListener(window, 'unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            NotificationUtils.showError('An unexpected error occurred');
            event.preventDefault();
        });
    }

    /**
     * Setup control button event listeners
     */
    setupControlButtons() {
        const buttons = {
            '[onclick="exportToExcel()"]': () => this.exportToExcel(),
            '[onclick="printReport()"]': () => this.printReport(),
            '[onclick="saveData()"]': () => this.saveDataBackup(),
            '[onclick="loadData()"]': () => this.loadDataBackup(),
            '[onclick="clearAllData()"]': () => this.clearAllData()
        };

        Object.keys(buttons).forEach(selector => {
            const button = DOMUtils.query(selector);
            if (button) {
                button.removeAttribute('onclick');
                DOMUtils.addEventListener(button, 'click', (e) => {
                    e.preventDefault();
                    if (!this.isLoading) {
                        buttons[selector]();
                    }
                });
            }
        });
    }

    /**
     * Setup real-time form updates
     */
    setupFormUpdates() {
        const amountField = DOMUtils.query('#transactionAmount');
        const dateField = DOMUtils.query('#transactionDate');

        if (amountField) {
            DOMUtils.addEventListener(amountField, 'input', 
                DOMUtils.debounce(() => this.previewTransaction(), CONFIG.DEBOUNCE_DELAY)
            );
        }

        if (dateField) {
            DOMUtils.addEventListener(dateField, 'change', () => this.previewTransaction());
        }

        // Set default date
        if (dateField && !dateField.value) {
            dateField.value = DateUtils.today();
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        DOMUtils.addEventListener(document, 'keydown', (e) => {
            // Ctrl+Enter: Add transaction
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.handleAddTransaction();
                return;
            }

            // Ctrl+S: Save data
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveDataBackup();
                return;
            }

            // Ctrl+E: Export data
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.exportToExcel();
                return;
            }

            // Ctrl+P: Print
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.printReport();
                return;
            }

            // Alt+A: Focus amount
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                A11yUtils.focus(DOMUtils.query('#transactionAmount'));
                return;
            }

            // Alt+D: Focus date
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                A11yUtils.focus(DOMUtils.query('#transactionDate'));
                return;
            }

            // Alt+N: Focus notes
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                A11yUtils.focus(DOMUtils.query('#transactionNotes'));
                return;
            }
        });
    }

    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Implement virtual scrolling if too many transactions
        if (this.transactions.length > CONFIG.VIRTUAL_SCROLL_THRESHOLD) {
            this.setupVirtualScrolling();
        }

        // Throttle window resize events
        DOMUtils.addEventListener(window, 'resize', 
            DOMUtils.throttle(() => this.handleResize(), 250)
        );
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        // Update table layout if needed
        const table = DOMUtils.query('table');
        const tableContainer = DOMUtils.query('.table-container');
        
        if (table && tableContainer) {
            const needsHorizontalScroll = table.scrollWidth > tableContainer.clientWidth;
            tableContainer.style.overflowX = needsHorizontalScroll ? 'auto' : 'visible';
        }
    }

    /**
     * Handle add transaction with comprehensive validation
     */
    async handleAddTransaction() {
        if (this.isLoading) return;

        try {
            this.setLoading(true);

            // Validate form
            const validation = this.formValidator.validateForm(this.transactions);
            
            if (!validation.isValid) {
                NotificationUtils.showError('Please fix the form errors before submitting');
                return;
            }

            // Show warnings if any
            if (validation.warnings && Object.keys(validation.warnings).length > 0) {
                const shouldContinue = await this.showWarningDialog(validation.warnings);
                if (!shouldContinue) return;
            }

            // Create transaction
            const transaction = {
                id: this.generateTransactionId(),
                date: validation.data.date,
                type: validation.data.type,
                amount: parseFloat(validation.data.amount),
                notes: validation.data.notes,
                timestamp: new Date().toISOString()
            };

            // Add transaction
            this.addTransaction(transaction);

            // Clear form
            this.clearForm();

            // Show success message
            NotificationUtils.showSuccess('Transaction added successfully');

            // Announce to screen readers
            A11yUtils.announce(`Transaction added: ${transaction.type} of ${CurrencyUtils.format(transaction.amount)}`);

        } catch (error) {
            console.error('Error adding transaction:', error);
            NotificationUtils.showError(error.message || 'Failed to add transaction');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Generate unique transaction ID
     */
    generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Add transaction to the list
     */
    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.sortTransactions();
        this.updateDisplay();
        this.saveData();
    }

    /**
     * Sort transactions by date
     */
    sortTransactions() {
        this.transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * Delete transaction with confirmation
     */
    async deleteTransaction(id) {
        try {
            const transaction = this.transactions.find(t => t.id === id);
            if (!transaction) return;

            const confirmed = await this.showConfirmDialog(
                `Are you sure you want to delete this ${transaction.type.toLowerCase()} of ${CurrencyUtils.format(transaction.amount)}?`,
                'Delete Transaction'
            );

            if (confirmed) {
                this.transactions = this.transactions.filter(t => t.id !== id);
                this.updateDisplay();
                this.saveData();
                NotificationUtils.showSuccess('Transaction deleted successfully');
                A11yUtils.announce('Transaction deleted');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            NotificationUtils.showError('Failed to delete transaction');
        }
    }

    /**
     * Preview transaction calculations
     */
    previewTransaction() {
        // This could show a preview of how the transaction would affect the balance
        // Implementation could be added based on UI requirements
    }

    /**
     * Clear the form
     */
    clearForm() {
        const form = DOMUtils.query('.input-section');
        if (!form) return;

        const amountField = form.querySelector('#transactionAmount');
        const notesField = form.querySelector('#transactionNotes');

        if (amountField) amountField.value = '';
        if (notesField) notesField.value = '';

        // Clear validation states
        if (this.formValidator) {
            this.formValidator.clearValidation();
        }
    }

    /**
     * Update the entire display
     */
    updateDisplay() {
        try {
            this.updateStatistics();
            this.updateTransactionTable();
            this.updateEntryCount();
        } catch (error) {
            console.error('Error updating display:', error);
            NotificationUtils.showError('Failed to update display');
        }
    }

    /**
     * Update statistics cards
     */
    updateStatistics() {
        const stats = this.calculateStatistics();

        // Update individual stat cards
        this.updateStatCard('currentBalance', stats.currentBalance, 'currency');
        this.updateStatCard('totalLoaned', stats.totalLoaned, 'currency');
        this.updateStatCard('totalPayments', stats.totalPayments, 'currency');
        this.updateStatCard('totalInterest', stats.totalInterest, 'currency');
        this.updateStatCard('daysActive', stats.daysActive, 'number');

        // Update subtexts
        this.updateElement('balanceChange', stats.balanceChangeText);
        this.updateElement('loanCount', stats.loanCountText);
        this.updateElement('paymentCount', stats.paymentCountText);
        this.updateElement('effectiveRate', stats.effectiveRateText);
        this.updateElement('dateRange', stats.dateRangeText);
    }

    /**
     * Calculate comprehensive statistics
     */
    calculateStatistics() {
        let balance = 0;
        let totalLoaned = 0;
        let totalPayments = 0;
        let totalInterest = 0;
        let loanCount = 0;
        let paymentCount = 0;
        let previousDate = null;

        // Process transactions chronologically
        this.transactions.forEach(transaction => {
            // Calculate interest since last transaction
            if (previousDate && balance > 0) {
                const interest = InterestUtils.calculate(balance, previousDate, transaction.date);
                totalInterest += interest;
                balance += interest;
            }

            // Apply transaction
            if (transaction.type === TRANSACTION_TYPES.LOAN_OUT) {
                balance += transaction.amount;
                totalLoaned += transaction.amount;
                loanCount++;
            } else {
                balance -= transaction.amount;
                totalPayments += transaction.amount;
                paymentCount++;
            }

            previousDate = transaction.date;
        });

        // Add interest to today if there's a balance
        let interestToToday = 0;
        if (balance > 0 && previousDate) {
            interestToToday = InterestUtils.calculate(balance, previousDate, DateUtils.today());
            totalInterest += interestToToday;
        }

        const currentBalance = balance + interestToToday;
        
        // Calculate derived statistics
        const daysActive = this.transactions.length > 0 
            ? DateUtils.daysBetween(this.transactions[0].date, this.transactions[this.transactions.length - 1]?.date || this.transactions[0].date)
            : 0;

        const effectiveRate = totalLoaned > 0 ? (totalInterest / totalLoaned * 100) : 0;

        // Generate text descriptions
        const lastTransaction = this.transactions[this.transactions.length - 1];
        const balanceChangeText = lastTransaction 
            ? `Last ${lastTransaction.type.toLowerCase()}: ${CurrencyUtils.format(lastTransaction.amount)}`
            : 'No transactions yet';

        const loanCountText = `${loanCount} loan${loanCount !== 1 ? 's' : ''}`;
        const paymentCountText = `${paymentCount} payment${paymentCount !== 1 ? 's' : ''}`;
        const effectiveRateText = `${effectiveRate.toFixed(2)}% of principal`;
        
        const dateRangeText = this.transactions.length > 0
            ? `${DateUtils.format(this.transactions[0].date)} - ${DateUtils.format(this.transactions[this.transactions.length - 1]?.date || this.transactions[0].date)}`
            : 'No activity';

        return {
            currentBalance,
            totalLoaned,
            totalPayments,
            totalInterest,
            daysActive,
            balanceChangeText,
            loanCountText,
            paymentCountText,
            effectiveRateText,
            dateRangeText
        };
    }

    /**
     * Update a statistics card
     */
    updateStatCard(elementId, value, type = 'text') {
        const element = DOMUtils.query(`#${elementId}`);
        if (!element) return;

        const formattedValue = type === 'currency' 
            ? CurrencyUtils.format(value)
            : type === 'number'
            ? value.toString()
            : value;

        if (element.textContent !== formattedValue) {
            // Add animation for value changes
            element.style.opacity = '0.5';
            setTimeout(() => {
                element.textContent = formattedValue;
                element.style.opacity = '1';
            }, 150);
        }
    }

    /**
     * Update transaction table
     */
    updateTransactionTable() {
        const tbody = DOMUtils.query('#transactionTableBody');
        const emptyState = DOMUtils.query('#emptyState');
        const table = DOMUtils.query('table');

        if (!tbody) return;

        // Clear existing content
        tbody.innerHTML = '';

        // Show/hide empty state
        const hasTransactions = this.transactions.length > 0;
        if (emptyState) emptyState.style.display = hasTransactions ? 'none' : 'block';
        if (table) table.style.display = hasTransactions ? 'table' : 'none';

        if (!hasTransactions) return;

        // Generate table rows
        let balance = 0;
        let previousDate = null;

        this.transactions.forEach((transaction, index) => {
            // Calculate days and interest
            const daysSinceLastEntry = previousDate 
                ? DateUtils.daysBetween(previousDate, transaction.date)
                : 0;

            let interestAccrued = 0;
            if (previousDate && balance > 0) {
                interestAccrued = InterestUtils.calculate(balance, previousDate, transaction.date);
                balance += interestAccrued;
            }

            // Apply transaction
            if (transaction.type === TRANSACTION_TYPES.LOAN_OUT) {
                balance += transaction.amount;
            } else {
                balance -= transaction.amount;
            }

            // Create row
            const row = this.createTransactionRow(transaction, daysSinceLastEntry, interestAccrued, balance, index === this.transactions.length - 1);
            tbody.appendChild(row);

            previousDate = transaction.date;
        });

        // Add current interest row if applicable
        if (balance > 0 && previousDate) {
            const today = DateUtils.today();
            const daysToToday = DateUtils.daysBetween(previousDate, today);
            const interestToToday = InterestUtils.calculate(balance, previousDate, today);
            
            if (daysToToday > 0) {
                const currentInterestRow = this.createCurrentInterestRow(today, daysToToday, interestToToday, balance + interestToToday);
                tbody.appendChild(currentInterestRow);
            }
        }
    }

    /**
     * Create a transaction table row
     */
    createTransactionRow(transaction, days, interest, balance, isLast = false) {
        const row = DOMUtils.createElement('tr', {
            className: isLast ? 'new-row' : '',
            'data-transaction-id': transaction.id
        });

        const typeClass = transaction.type === TRANSACTION_TYPES.LOAN_OUT ? 'loan' : 'payment';
        const amountClass = transaction.type === TRANSACTION_TYPES.LOAN_OUT ? 'loan-amount' : 'payment-amount';

        row.innerHTML = `
            <td>${DateUtils.format(transaction.date)}</td>
            <td>
                <span class="type-badge ${typeClass}">
                    ${transaction.type === TRANSACTION_TYPES.LOAN_OUT ? '➕' : '➖'}
                    ${transaction.type}
                </span>
            </td>
            <td class="amount-cell ${amountClass}">
                ${CurrencyUtils.format(transaction.amount)}
            </td>
            <td>${days > 0 ? Math.round(days) : '-'}</td>
            <td class="amount-cell interest-amount">
                ${interest > 0 ? CurrencyUtils.format(interest) : '-'}
            </td>
            <td class="amount-cell balance-amount">
                ${CurrencyUtils.format(balance)}
            </td>
            <td class="notes-cell" title="${transaction.notes || ''}">${transaction.notes || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-danger" 
                            onclick="app.deleteTransaction('${transaction.id}')"
                            aria-label="${ACCESSIBILITY.LABELS.DELETE_BUTTON}">
                        🗑️
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    /**
     * Create current interest row
     */
    createCurrentInterestRow(date, days, interest, balance) {
        const row = DOMUtils.createElement('tr', {
            style: 'background-color: var(--gray-50); font-style: italic;'
        });

        row.innerHTML = `
            <td>${DateUtils.format(date)}</td>
            <td><span class="type-badge" style="background: #fef3c7; color: #92400e;">💰 Current Interest</span></td>
            <td>-</td>
            <td>${Math.round(days)}</td>
            <td class="amount-cell interest-amount">${CurrencyUtils.format(interest)}</td>
            <td class="amount-cell balance-amount" style="font-size: 1.1rem;">${CurrencyUtils.format(balance)}</td>
            <td>Interest accrued to today</td>
            <td>-</td>
        `;

        return row;
    }

    /**
     * Update entry count
     */
    updateEntryCount() {
        const element = DOMUtils.query('#entryCount');
        if (element) {
            const count = this.transactions.length;
            element.textContent = `${count} entr${count === 1 ? 'y' : 'ies'}`;
        }
    }

    /**
     * Update element content safely
     */
    updateElement(id, content) {
        const element = DOMUtils.query(`#${id}`);
        if (element && element.textContent !== content) {
            element.textContent = content;
        }
    }

    /**
     * Export data to Excel/CSV
     */
    async exportToExcel() {
        try {
            this.setLoading(true);
            
            const csvContent = this.generateCSV();
            const filename = FileUtils.generateFilename(CONFIG.EXPORT_PREFIX, '.csv');
            
            if (FileUtils.download(csvContent, filename, 'text/csv')) {
                NotificationUtils.showSuccess('Data exported successfully');
            }
        } catch (error) {
            console.error('Export failed:', error);
            NotificationUtils.showError('Failed to export data');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Generate CSV content
     */
    generateCSV() {
        let csv = 'Date,Type,Amount,Days Since Last Entry,Interest Accrued,Running Balance,Notes\n';
        
        let balance = 0;
        let previousDate = null;
        
        this.transactions.forEach(transaction => {
            let daysSinceLastEntry = 0;
            let interestAccrued = 0;
            
            if (previousDate) {
                daysSinceLastEntry = DateUtils.daysBetween(previousDate, transaction.date);
                if (balance > 0) {
                    interestAccrued = InterestUtils.calculate(balance, previousDate, transaction.date);
                }
            }
            
            balance += interestAccrued;
            
            if (transaction.type === TRANSACTION_TYPES.LOAN_OUT) {
                balance += transaction.amount;
            } else {
                balance -= transaction.amount;
            }
            
            // Escape quotes in notes
            const notes = (transaction.notes || '').replace(/"/g, '""');
            
            csv += `${transaction.date},"${transaction.type}",${transaction.amount},${Math.round(daysSinceLastEntry)},${interestAccrued.toFixed(2)},${balance.toFixed(2)},"${notes}"\n`;
            
            previousDate = transaction.date;
        });
        
        // Add current interest row
        if (balance > 0 && previousDate) {
            const today = DateUtils.today();
            const daysToToday = DateUtils.daysBetween(previousDate, today);
            const interestToToday = InterestUtils.calculate(balance, previousDate, today);
            csv += `${today},"Current Interest",,${daysToToday},${interestToToday.toFixed(2)},${(balance + interestToToday).toFixed(2)},"Interest accrued to today"\n`;
        }
        
        return csv;
    }

    /**
     * Print report
     */
    printReport() {
        try {
            window.print();
            NotificationUtils.showInfo('Print dialog opened');
        } catch (error) {
            console.error('Print failed:', error);
            NotificationUtils.showError('Failed to open print dialog');
        }
    }

    /**
     * Save data backup
     */
    async saveDataBackup() {
        try {
            this.setLoading(true);
            
            const data = {
                version: CONFIG.DATA_VERSION,
                exportDate: new Date().toISOString(),
                interestRate: CONFIG.INTEREST_RATE,
                transactions: this.transactions,
                metadata: {
                    totalTransactions: this.transactions.length,
                    dateRange: this.transactions.length > 0 ? {
                        start: this.transactions[0].date,
                        end: this.transactions[this.transactions.length - 1].date
                    } : null
                }
            };
            
            const filename = FileUtils.generateFilename(CONFIG.BACKUP_PREFIX, '.json');
            const jsonString = JSON.stringify(data, null, 2);
            
            if (FileUtils.download(jsonString, filename, 'application/json')) {
                NotificationUtils.showSuccess('Backup created successfully');
            }
        } catch (error) {
            console.error('Backup failed:', error);
            NotificationUtils.showError('Failed to create backup');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Load data backup
     */
    async loadDataBackup() {
        try {
            const file = await this.selectFile('.json');
            if (!file) return;

            this.setLoading(true);
            
            FileUtils.validate(file, {
                allowedTypes: ['.json'],
                allowedMimeTypes: ['application/json', 'text/plain']
            });
            
            const content = await FileUtils.readAsText(file);
            const data = JSON.parse(content);
            
            if (!data.transactions || !Array.isArray(data.transactions)) {
                throw new Error('Invalid backup file format');
            }
            
            const confirmed = await this.showConfirmDialog(
                `This will replace all current data with ${data.transactions.length} transactions from the backup. Continue?`,
                'Load Backup'
            );
            
            if (confirmed) {
                this.transactions = data.transactions;
                this.sortTransactions();
                this.updateDisplay();
                this.saveData();
                NotificationUtils.showSuccess('Data loaded successfully');
                A11yUtils.announce(`Loaded ${data.transactions.length} transactions from backup`);
            }
        } catch (error) {
            console.error('Load failed:', error);
            NotificationUtils.showError(error.message || 'Failed to load backup file');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Clear all data with confirmation
     */
    async clearAllData() {
        try {
            const confirmed = await this.showConfirmDialog(
                'Are you sure you want to clear all data? This action cannot be undone!',
                'Clear All Data'
            );
            
            if (confirmed) {
                this.transactions = [];
                this.updateDisplay();
                this.saveData();
                NotificationUtils.showSuccess('All data cleared successfully');
                A11yUtils.announce('All transaction data has been cleared');
            }
        } catch (error) {
            console.error('Clear data failed:', error);
            NotificationUtils.showError('Failed to clear data');
        }
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        return StorageUtils.save(CONFIG.STORAGE_KEY, this.transactions);
    }

    /**
     * Load data from localStorage
     */
    async loadData() {
        try {
            const saved = StorageUtils.load(CONFIG.STORAGE_KEY, []);
            if (Array.isArray(saved)) {
                this.transactions = saved;
                this.sortTransactions();
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            NotificationUtils.showWarning('Failed to load saved data. Starting fresh.');
        }
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        const buttons = DOMUtils.queryAll('.btn');
        
        buttons.forEach(button => {
            if (loading) {
                button.disabled = true;
                button.classList.add('loading');
            } else {
                button.disabled = false;
                button.classList.remove('loading');
            }
        });
    }

    /**
     * Show confirmation dialog
     */
    showConfirmDialog(message, title = 'Confirm') {
        return new Promise((resolve) => {
            // Use native confirm for now, could be enhanced with custom modal
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    /**
     * Show warning dialog
     */
    showWarningDialog(warnings) {
        return new Promise((resolve) => {
            const warningMessages = Object.values(warnings)
                .flat()
                .map(w => w.message)
                .join('\n');
            
            const result = confirm(`Warning:\n\n${warningMessages}\n\nDo you want to continue?`);
            resolve(result);
        });
    }

    /**
     * Select file dialog
     */
    selectFile(accept = '') {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                resolve(file || null);
            };
            
            input.click();
        });
    }

    /**
     * Setup virtual scrolling for large datasets
     */
    setupVirtualScrolling() {
        // Implementation for virtual scrolling if needed
        // This would be useful for datasets with thousands of transactions
        console.log('Virtual scrolling enabled for large dataset');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const container = document.querySelector('.app-container');
        if (container) {
            window.app = new LoanTrackerWidget(container);
        } else {
            throw new Error('Application container not found');
        }
    } catch (error) {
        console.error('Failed to initialize Loan Tracker:', error);
        NotificationUtils.showError('Failed to initialize application');
    }
});

// Export for global access (needed for onclick handlers in existing HTML)
window.LoanTrackerWidget = LoanTrackerWidget;