/**
 * Number formatting utilities for better UI display
 * Adds thousands separators and handles various number formats
 */

/**
 * Format number with thousands separators
 * @param {number|string} number - Number to format
 * @returns {string} - Formatted number with commas
 */
export const formatNumber = (number) => {
    if (number === null || number === undefined) return '0'
    
    // Convert to number if string
    const num = typeof number === 'string' ? 
        parseInt(number.replace(/,/g, '')) || 0 : 
        number
    
    return num.toLocaleString('ko-KR')
}

/**
 * Format percentage with decimal places
 * @param {number} percentage - Percentage value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (percentage, decimals = 1) => {
    if (percentage === null || percentage === undefined) return '0.0%'
    
    const num = typeof percentage === 'string' ? 
        parseFloat(percentage) : 
        percentage
    
    return num.toFixed(decimals) + '%'
}

/**
 * Format context string for KPI cards
 * Creates formatted strings like: "전체 블로그 대비 1.1% (311/27,663건)"
 * @param {string} prefix - Context prefix text
 * @param {number} percentage - Percentage value
 * @param {number} asterasysValue - Asterasys value
 * @param {number} marketTotal - Total market value
 * @param {string} unit - Unit text (default: "건")
 * @returns {string} - Formatted context string
 */
export const formatContext = (prefix, percentage, asterasysValue, marketTotal, unit = '건') => {
    return `${prefix} ${formatPercentage(percentage)} (${formatNumber(asterasysValue)}/${formatNumber(marketTotal)}${unit})`
}

/**
 * Format compact numbers for large values
 * @param {number} number - Number to format
 * @returns {string} - Formatted compact number
 */
export const formatCompactNumber = (number) => {
    if (number === null || number === undefined) return '0'
    
    const num = typeof number === 'string' ? 
        parseInt(number.replace(/,/g, '')) || 0 : 
        number
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString('ko-KR')
}