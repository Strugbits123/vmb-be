// logger.js
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const logsDir = 'logs';
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const getLogFile = () => {
  const today = new Date().toISOString().split('T')[0];
  return path.join(logsDir, `vmb-${today}.log`);
};

const logStream = fs.createWriteStream(getLogFile(), { flags: 'a' });

const logger = pino(
  { level: 'info', timestamp: pino.stdTimeFunctions.isoTime },
  pino.multistream([{ stream: logStream }, { stream: process.stdout }])
);

const cleanOldLogs = () => {
  const maxAgeMs = 5 * 24 * 60 * 60 * 1000; // 5 days
  const now = Date.now();

  try {
    fs.readdirSync(logsDir).forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted old log file: ${file}`);
      }
    });
  } catch (err) {
    logger.error('Error cleaning old logs:', err);
  }
};

module.exports = { logger, cleanOldLogs };
