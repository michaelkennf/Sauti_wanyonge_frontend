/**
 * Logger centralisé pour l'application
 * Remplace tous les console.log/warn/error pour un meilleur contrôle en production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

class Logger {
  private isDevelopment: boolean
  private isProduction: boolean
  private logHistory: LogEntry[] = []
  private maxHistorySize: number = 100

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `[${context}]` : ''
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry)
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }
  }

  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    }

    this.addToHistory(entry)

    // En production, ne logger que les erreurs
    if (this.isProduction && level !== 'error') {
      return
    }

    // En développement, logger tout
    const formattedMessage = this.formatMessage(level, message, data, context)

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, data || '')
        }
        break
      case 'info':
        console.info(formattedMessage, data || '')
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'error':
        console.error(formattedMessage, data || '')
        // En production, envoyer les erreurs à un service de monitoring si disponible
        if (this.isProduction && typeof window !== 'undefined') {
          // TODO: Intégrer avec un service de monitoring (Sentry, LogRocket, etc.)
          // Example: Sentry.captureException(new Error(message), { extra: data })
        }
        break
    }
  }

  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context)
  }

  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context)
  }

  error(message: string, error?: any, context?: string): void {
    this.log('error', message, error, context)
  }

  /**
   * Récupère l'historique des logs (utile pour le débogage)
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter(entry => entry.level === level)
    }
    return [...this.logHistory]
  }

  /**
   * Vide l'historique des logs
   */
  clearHistory(): void {
    this.logHistory = []
  }

  /**
   * Exporte l'historique des logs (utile pour le support)
   */
  exportHistory(): string {
    return JSON.stringify(this.logHistory, null, 2)
  }
}

// Instance singleton
export const logger = new Logger()

// Export par défaut pour compatibilité
export default logger

