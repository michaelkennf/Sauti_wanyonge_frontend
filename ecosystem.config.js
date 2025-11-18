/**
 * Configuration PM2 pour le Frontend Sauti ya Wayonge
 * 
 * Installation: npm install -g pm2
 * Démarrage: pm2 start ecosystem.config.js
 * Monitoring: pm2 monit
 * Logs: pm2 logs vbgsos-frontend
 * Redémarrage: pm2 restart vbgsos-frontend
 */

module.exports = {
  apps: [
    {
      name: 'vbgsos-frontend',
      script: 'npm',
      args: 'start',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      
      // Variables d'environnement
      env: {
        NODE_ENV: 'production',
        PORT: 5002,
      },
      
      // Gestion des erreurs
      error_file: './logs/pm2-frontend-error.log',
      out_file: './logs/pm2-frontend-out.log',
      log_file: './logs/pm2-frontend-combined.log',
      time: true,
      merge_logs: true,
      
      // Redémarrage automatique
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Gestion des instances
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      // Source maps pour meilleur debugging
      source_map_support: true,
      
      // Ignorer certains fichiers pour le watch
      ignore_watch: [
        'node_modules',
        'logs',
        '.next',
        '.git',
      ],
    },
  ],
}


