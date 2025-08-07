# Loan Tracker Widget - Documentation

## Overview

The Loan Tracker Widget is a robust, accessible, and feature-rich web application for tracking loans and payments with automatic interest calculation. This enhanced version includes comprehensive error handling, accessibility features, and modern web development practices.

## Features

### Core Functionality
- ✅ **Loan and Payment Tracking**: Add and manage loan transactions and payments
- ✅ **Automatic Interest Calculation**: Daily interest calculation at 8.25% APR
- ✅ **Real-time Balance Updates**: Running balance with accrued interest
- ✅ **Transaction History**: Complete audit trail of all transactions
- ✅ **Export Capabilities**: CSV export for Excel compatibility
- ✅ **Data Backup & Restore**: JSON backup and restore functionality
- ✅ **Print Support**: Print-optimized reports

### Enhanced Features
- ✅ **Comprehensive Validation**: Real-time form validation with user feedback
- ✅ **Error Handling**: Robust error handling with user-friendly messages
- ✅ **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- ✅ **Keyboard Navigation**: Full keyboard support with shortcuts
- ✅ **Responsive Design**: Mobile-friendly responsive layout
- ✅ **Dark Mode Support**: Automatic dark mode based on user preference
- ✅ **High Contrast Support**: Enhanced visibility for users with visual impairments
- ✅ **Performance Optimized**: Efficient algorithms and memory management
- ✅ **Security Features**: XSS protection and input sanitization
- ✅ **Modular Architecture**: Clean, maintainable code structure

## File Structure

```
loan-tracker/
├── index.html              # Original single-file version
├── index-enhanced.html      # Enhanced modular version
├── css/
│   └── styles.css          # Enhanced styles with design system
├── js/
│   ├── config.js           # Configuration and constants
│   ├── validation.js       # Validation utilities and classes
│   ├── utils.js            # Utility functions
│   └── app.js              # Main application logic
├── tests/
│   └── index.html          # Test suite
└── docs/
    └── README.md           # This documentation
```

## Getting Started

### Basic Usage

1. Open `index-enhanced.html` in a modern web browser
2. Add your first transaction using the form
3. View calculated interest and running balance
4. Export or print reports as needed

### Development Setup

1. Clone the repository
2. Serve files using a local web server (required for ES6 modules)
3. Open the enhanced version in your browser

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

## API Reference

### Configuration (`js/config.js`)

```javascript
import { CONFIG, TRANSACTION_TYPES, VALIDATION_RULES } from './js/config.js';

// Interest rate (8.25% APR)
CONFIG.INTEREST_RATE

// Transaction types
TRANSACTION_TYPES.LOAN_OUT    // "Loan Out"
TRANSACTION_TYPES.PAYMENT     // "Payment"

// Validation rules
VALIDATION_RULES.AMOUNT.min   // Minimum amount
VALIDATION_RULES.AMOUNT.max   // Maximum amount
```

### Validation (`js/validation.js`)

```javascript
import { ValidationUtils, TransactionValidator } from './js/validation.js';

// Validate individual values
const amount = ValidationUtils.parseAmount('100.50');
const date = ValidationUtils.parseDate('2023-12-25');

// Validate complete transactions
const validator = new TransactionValidator();
const isValid = validator.validateTransaction(transaction);
```

### Utilities (`js/utils.js`)

```javascript
import { 
    CurrencyUtils, 
    DateUtils, 
    InterestUtils, 
    StorageUtils 
} from './js/utils.js';

// Format currency
const formatted = CurrencyUtils.format(1234.56); // "$1,234.56"

// Calculate interest
const interest = InterestUtils.calculate(1000, '2023-01-01', '2023-02-01');

// Storage operations
StorageUtils.save('key', data);
const data = StorageUtils.load('key');
```

## Accessibility Features

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Proper ARIA labels and landmarks
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: Sufficient contrast ratios for all text
- **Semantic HTML**: Proper heading structure and form labels

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Add transaction |
| `Ctrl+S` | Save data backup |
| `Ctrl+E` | Export to Excel |
| `Ctrl+P` | Print report |
| `Alt+A` | Focus amount field |
| `Alt+D` | Focus date field |
| `Alt+N` | Focus notes field |

### Screen Reader Support

- Semantic HTML structure with proper landmarks
- ARIA labels for interactive elements
- Live regions for dynamic content updates
- Descriptive text for complex interactions

## Validation Rules

### Date Validation
- Must be in YYYY-MM-DD format
- Cannot be empty
- Future dates show warning but are allowed

### Amount Validation
- Must be numeric
- Minimum: $0.01
- Maximum: $999,999,999.99
- Supports up to 2 decimal places

### Notes Validation
- Optional field
- Maximum 500 characters
- HTML content is sanitized

### Transaction Type
- Must be either "Loan Out" or "Payment"
- Cannot be empty

## Error Handling

### Validation Errors
- Real-time form validation with immediate feedback
- Field-specific error messages
- Visual indicators (red borders, error icons)
- Accessible error announcements

### Runtime Errors
- Graceful degradation for unsupported features
- User-friendly error messages
- Automatic error recovery where possible
- Console logging for debugging

### Storage Errors
- Fallback for localStorage unavailability
- Data corruption detection and recovery
- Backup validation before import

## Performance Features

### Optimization Techniques
- Debounced input validation (300ms delay)
- Throttled resize handlers (250ms limit)
- Virtual scrolling for large datasets (>100 items)
- Efficient DOM updates with minimal reflows

### Memory Management
- Automatic cleanup of event listeners
- Garbage collection friendly patterns
- Minimal DOM manipulation
- Efficient data structures

## Security Features

### Input Sanitization
- HTML content sanitization to prevent XSS
- Input validation on all user data
- Safe innerHTML usage with sanitized content

### Data Protection
- Client-side only (no server transmission)
- LocalStorage encryption (future enhancement)
- Secure file handling for imports/exports

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Required Features
- ES6 Modules support
- CSS Custom Properties
- LocalStorage API
- File API for import/export

### Fallbacks
- Graceful degradation for older browsers
- Alternative layouts for limited CSS support
- Polyfill suggestions for missing features

## Testing

### Test Suite
Run the test suite by opening `tests/index.html` in your browser.

### Test Categories
- **Validation Tests**: Input validation and sanitization
- **Utility Tests**: Currency, date, and interest calculations
- **Integration Tests**: Complete workflow testing
- **Accessibility Tests**: Keyboard navigation and screen reader support

### Manual Testing Checklist
- [ ] Add various transaction types
- [ ] Test form validation with invalid inputs
- [ ] Verify interest calculations
- [ ] Test export/import functionality
- [ ] Check keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Test responsive design on different screen sizes

## Deployment

### Production Deployment
1. Serve files from a web server (required for ES6 modules)
2. Consider enabling HTTPS for security
3. Configure proper MIME types for JavaScript modules
4. Enable gzip compression for better performance

### CDN Considerations
- All resources are self-contained
- No external dependencies
- Can be deployed to any static hosting service

## Customization

### Styling
Modify `css/styles.css` to customize the appearance:

```css
:root {
    --primary: #your-color;
    --success: #your-success-color;
    /* ... other variables */
}
```

### Configuration
Update `js/config.js` for different settings:

```javascript
export const CONFIG = {
    INTEREST_RATE: 0.085,  // Change interest rate
    CURRENCY: 'EUR',       // Change currency
    LOCALE: 'de-DE',       // Change locale
    // ... other settings
};
```

### Extending Functionality
The modular architecture makes it easy to add new features:

1. Add new utility functions to `js/utils.js`
2. Extend validation rules in `js/validation.js`
3. Add new UI components to the main application

## Contributing

### Code Style
- Use ES6+ features
- Follow semantic HTML practices
- Maintain accessibility standards
- Include comprehensive error handling
- Write descriptive comments

### Testing Requirements
- Add tests for new functionality
- Ensure accessibility compliance
- Test across supported browsers
- Verify responsive design

## Support

### Common Issues

**"Module not found" errors**
- Ensure you're serving files through a web server
- Check that all file paths are correct
- Verify browser supports ES6 modules

**Validation not working**
- Check browser console for JavaScript errors
- Ensure all required modules are loaded
- Verify form field IDs match JavaScript selectors

**Data not saving**
- Check if localStorage is available
- Verify browser privacy settings
- Check for storage quota limits

### Troubleshooting

1. **Check Browser Console**: Most issues will show error messages
2. **Test in Private Mode**: Eliminates extension conflicts
3. **Try Different Browser**: Isolates browser-specific issues
4. **Clear Browser Data**: Resolves corrupt localStorage issues

### Getting Help

For issues or questions:
1. Check this documentation
2. Review the test suite for examples
3. Examine the browser console for error messages
4. Test with the original single-file version for comparison

## License

This project is provided as-is for educational and personal use. See repository license for full details.