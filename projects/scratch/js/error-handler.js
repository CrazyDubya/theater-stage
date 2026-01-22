/**
 * Error Handling and Logging System for Theater-Stage
 * Provides comprehensive error tracking, user-friendly messages, and debugging tools
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.logs = [];
        this.maxLogEntries = 500;
        this.logLevel = 'info'; // 'debug', 'info', 'warn', 'error'
        this.enableConsole = true;
        this.enableUI = true;
        this.errorPanel = null;

        this.init();
    }

    init() {
        this.createUI();
        this.setupGlobalErrorHandlers();
        this.interceptConsole();

        // Log initialization
        this.info('Theater-Stage Error Handler initialized');
    }

    setupGlobalErrorHandlers() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                type: 'unhandled'
            });
            // Prevent default browser error handling
            event.preventDefault();
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: `Unhandled Promise Rejection: ${event.reason}`,
                error: event.reason,
                type: 'promise'
            });
            event.preventDefault();
        });

        // Three.js specific error handling
        if (window.THREE) {
            const originalWarn = console.warn;
            console.warn = (...args) => {
                if (args[0] && args[0].includes('THREE.')) {
                    this.warn('Three.js Warning: ' + args.join(' '));
                }
                originalWarn.apply(console, args);
            };
        }
    }

    interceptConsole() {
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
        };

        // Intercept console methods
        console.log = (...args) => {
            this.addLog('log', args.join(' '));
            if (this.enableConsole) originalConsole.log.apply(console, args);
        };

        console.info = (...args) => {
            this.addLog('info', args.join(' '));
            if (this.enableConsole) originalConsole.info.apply(console, args);
        };

        console.warn = (...args) => {
            this.addLog('warn', args.join(' '));
            if (this.enableConsole) originalConsole.warn.apply(console, args);
        };

        console.error = (...args) => {
            this.addLog('error', args.join(' '));
            if (this.enableConsole) originalConsole.error.apply(console, args);
        };

        console.debug = (...args) => {
            this.addLog('debug', args.join(' '));
            if (this.enableConsole) originalConsole.debug.apply(console, args);
        };

        // Store original console for restoration
        this.originalConsole = originalConsole;
    }

    createUI() {
        // Error panel overlay
        this.errorPanel = document.createElement('div');
        this.errorPanel.id = 'error-handler-panel';
        this.errorPanel.style.cssText = `
            position: fixed;
            bottom: 0;
            right: 0;
            width: 400px;
            max-height: 300px;
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
            border: 2px solid rgba(255, 0, 0, 0.5);
            border-radius: 8px 0 0 0;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
            flex-direction: column;
            box-shadow: 0 -4px 20px rgba(255, 0, 0, 0.3);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px 12px;
            background: rgba(255, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">⚠️</span>
                <span style="font-weight: bold; font-size: 14px;">Error Console</span>
                <span id="error-count-badge" style="background: rgba(255,0,0,0.5); padding: 2px 8px; border-radius: 10px; font-size: 11px;">0</span>
            </div>
            <div style="display: flex; gap: 5px;">
                <button id="error-clear-btn" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Clear</button>
                <button id="error-export-btn" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Export</button>
                <button id="error-close-btn" style="background: transparent; border: none; color: white; font-size: 16px; cursor: pointer;">✖️</button>
            </div>
        `;
        this.errorPanel.appendChild(header);

        // Tabs
        const tabs = document.createElement('div');
        tabs.style.cssText = `
            display: flex;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;
        tabs.innerHTML = `
            <button class="error-tab active" data-tab="errors">Errors</button>
            <button class="error-tab" data-tab="warnings">Warnings</button>
            <button class="error-tab" data-tab="logs">All Logs</button>
        `;
        this.errorPanel.appendChild(tabs);

        // Content
        const content = document.createElement('div');
        content.id = 'error-content';
        content.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px;
            line-height: 1.4;
        `;
        this.errorPanel.appendChild(content);

        document.body.appendChild(this.errorPanel);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .error-tab {
                flex: 1;
                padding: 6px;
                background: transparent;
                border: none;
                border-bottom: 2px solid transparent;
                color: #aaa;
                cursor: pointer;
                font-size: 11px;
                font-family: 'Courier New', monospace;
                transition: all 0.2s ease;
            }
            .error-tab:hover {
                color: white;
                background: rgba(255, 255, 255, 0.05);
            }
            .error-tab.active {
                color: #ff4444;
                border-bottom-color: #ff4444;
            }
            .error-entry {
                margin-bottom: 8px;
                padding: 6px;
                background: rgba(0, 0, 0, 0.3);
                border-left: 3px solid #ff4444;
                border-radius: 2px;
                font-size: 11px;
            }
            .warning-entry {
                margin-bottom: 8px;
                padding: 6px;
                background: rgba(0, 0, 0, 0.3);
                border-left: 3px solid #ffa500;
                border-radius: 2px;
                font-size: 11px;
            }
            .log-entry {
                margin-bottom: 6px;
                padding: 4px;
                background: rgba(0, 0, 0, 0.2);
                border-left: 2px solid #4af;
                border-radius: 2px;
                font-size: 10px;
            }
            .error-timestamp {
                color: #888;
                font-size: 10px;
                margin-right: 6px;
            }
            .error-message {
                color: #fff;
            }
            .error-stack {
                color: #aaa;
                font-size: 10px;
                margin-top: 4px;
                padding-left: 10px;
            }
        `;
        document.head.appendChild(style);

        this.setupUIEventListeners();
    }

    setupUIEventListeners() {
        // Close button
        document.getElementById('error-close-btn').addEventListener('click', () => {
            this.hidePanel();
        });

        // Clear button
        document.getElementById('error-clear-btn').addEventListener('click', () => {
            this.clearAll();
        });

        // Export button
        document.getElementById('error-export-btn').addEventListener('click', () => {
            this.exportLogs();
        });

        // Tab switching
        document.querySelectorAll('.error-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    handleError(errorInfo) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: errorInfo.message || 'Unknown error',
            source: errorInfo.source || 'Unknown',
            line: errorInfo.line,
            column: errorInfo.column,
            stack: errorInfo.error?.stack || '',
            type: errorInfo.type || 'error',
            userAgent: navigator.userAgent
        };

        this.errors.push(errorEntry);
        this.addLog('error', errorEntry.message, errorEntry);

        // Show error panel if enabled
        if (this.enableUI) {
            this.showPanel();
            this.updateUI();
        }

        // Show user-friendly error notification
        this.showErrorNotification(errorEntry);

        // Limit stored errors
        if (this.errors.length > this.maxLogEntries) {
            this.errors.shift();
        }
    }

    addLog(level, message, details = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            details: details
        };

        this.logs.push(logEntry);

        if (level === 'warn') {
            this.warnings.push(logEntry);
        }

        // Limit stored logs
        if (this.logs.length > this.maxLogEntries) {
            this.logs.shift();
        }

        if (this.warnings.length > this.maxLogEntries) {
            this.warnings.shift();
        }

        // Update UI if panel is visible
        if (this.errorPanel && this.errorPanel.style.display !== 'none') {
            this.updateUI();
        }
    }

    // Convenience methods
    error(message, details = null) {
        this.handleError({ message, error: details });
    }

    warn(message, details = null) {
        this.addLog('warn', message, details);
    }

    info(message, details = null) {
        this.addLog('info', message, details);
    }

    debug(message, details = null) {
        this.addLog('debug', message, details);
    }

    showErrorNotification(errorEntry) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 350px;
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideIn 0.3s ease;
            font-family: Arial, sans-serif;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 10px;">
                <span style="font-size: 24px;">⚠️</span>
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 5px;">An error occurred</div>
                    <div style="font-size: 13px; opacity: 0.9;">${this.sanitizeHTML(errorEntry.message.substring(0, 100))}</div>
                    <div style="margin-top: 8px;">
                        <button onclick="errorHandler.showPanel(); this.parentElement.parentElement.parentElement.remove();" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">View Details</button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove();" style="background: transparent; border: none; color: white; padding: 5px 12px; cursor: pointer; font-size: 12px;">Dismiss</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }

    showPanel() {
        this.errorPanel.style.display = 'flex';
        this.updateUI();
    }

    hidePanel() {
        this.errorPanel.style.display = 'none';
    }

    togglePanel() {
        if (this.errorPanel.style.display === 'none') {
            this.showPanel();
        } else {
            this.hidePanel();
        }
    }

    updateUI() {
        // Update error count badge
        const badge = document.getElementById('error-count-badge');
        if (badge) {
            badge.textContent = this.errors.length;
        }

        // Update current tab content
        const activeTab = document.querySelector('.error-tab.active');
        if (activeTab) {
            this.switchTab(activeTab.dataset.tab);
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.error-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        const content = document.getElementById('error-content');
        if (!content) return;

        content.innerHTML = '';

        switch (tabName) {
            case 'errors':
                this.renderErrors(content);
                break;
            case 'warnings':
                this.renderWarnings(content);
                break;
            case 'logs':
                this.renderLogs(content);
                break;
        }
    }

    renderErrors(container) {
        if (this.errors.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No errors logged</div>';
            return;
        }

        this.errors.slice().reverse().forEach(error => {
            const entry = document.createElement('div');
            entry.className = 'error-entry';
            entry.innerHTML = `
                <div>
                    <span class="error-timestamp">${new Date(error.timestamp).toLocaleTimeString()}</span>
                    <span class="error-message">${this.sanitizeHTML(error.message)}</span>
                </div>
                ${error.source ? `<div style="color: #aaa; font-size: 10px; margin-top: 2px;">${this.sanitizeHTML(error.source)}:${error.line}:${error.column}</div>` : ''}
                ${error.stack ? `<div class="error-stack">${this.sanitizeHTML(error.stack.split('\n').slice(0, 3).join('\n'))}</div>` : ''}
            `;
            container.appendChild(entry);
        });
    }

    renderWarnings(container) {
        if (this.warnings.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No warnings logged</div>';
            return;
        }

        this.warnings.slice().reverse().forEach(warning => {
            const entry = document.createElement('div');
            entry.className = 'warning-entry';
            entry.innerHTML = `
                <div>
                    <span class="error-timestamp">${new Date(warning.timestamp).toLocaleTimeString()}</span>
                    <span class="error-message">${this.sanitizeHTML(warning.message)}</span>
                </div>
            `;
            container.appendChild(entry);
        });
    }

    renderLogs(container) {
        if (this.logs.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No logs</div>';
            return;
        }

        this.logs.slice().reverse().slice(0, 100).forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';

            let color = '#4af';
            if (log.level === 'error') color = '#ff4444';
            else if (log.level === 'warn') color = '#ffa500';
            else if (log.level === 'info') color = '#4af';

            entry.style.borderLeftColor = color;

            entry.innerHTML = `
                <span class="error-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
                <span style="color: ${color}; font-weight: bold;">[${log.level.toUpperCase()}]</span>
                <span class="error-message">${this.sanitizeHTML(log.message)}</span>
            `;
            container.appendChild(entry);
        });
    }

    clearAll() {
        if (confirm('Clear all error logs?')) {
            this.errors = [];
            this.warnings = [];
            this.logs = [];
            this.updateUI();
        }
    }

    exportLogs() {
        const data = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            errors: this.errors,
            warnings: this.warnings,
            logs: this.logs
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theater-stage-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.info('Logs exported successfully');
    }

    sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Utility: Safe function wrapper
    safe(fn, context = null) {
        return (...args) => {
            try {
                return fn.apply(context, args);
            } catch (error) {
                this.error(`Error in ${fn.name || 'anonymous function'}`, error);
                return null;
            }
        };
    }

    // Utility: Safe async function wrapper
    safeAsync(fn, context = null) {
        return async (...args) => {
            try {
                return await fn.apply(context, args);
            } catch (error) {
                this.error(`Error in async ${fn.name || 'anonymous function'}`, error);
                return null;
            }
        };
    }
}

// Global instance
const errorHandler = new ErrorHandler();

// Expose to global scope
window.errorHandler = errorHandler;

// Add keyboard shortcut (Shift+E) to toggle error panel
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'E') {
        errorHandler.togglePanel();
    }
});

// Add animation for notifications
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);
