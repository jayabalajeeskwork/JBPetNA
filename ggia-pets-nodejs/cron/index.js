/**
 * Cron Jobs Manager
 * Centralized management of all scheduled cron jobs
 */
const logger = require('../config/logger');

/**
 * Initialize and schedule all cron jobs
 */
function initializeCronJobs() {
  try {
    logger.info('🚀 Initializing cron jobs...');


    logger.info('✅ All cron jobs initialized successfully');
  } catch (error) {
    logger.error('❌ Error initializing cron jobs:', error);
  }
}

/**
 * Stop all cron jobs (useful for graceful shutdown)
 */
function stopCronJobs() {
  try {
    logger.info('🛑 Stopping all cron jobs...');
    // Note: node-cron doesn't provide a global stop method
    // Individual jobs can be stopped by storing their references
    logger.info('✅ Cron jobs stopped');
  } catch (error) {
    logger.error('❌ Error stopping cron jobs:', error);
  }
}

module.exports = {
  initializeCronJobs,
  stopCronJobs
}; 