// Utility function to combine class names
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

// Utility function to format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Utility function to format numbers with commas
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number)
}

// Utility function to capitalize first letter
export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Utility function to debounce function calls
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
} 