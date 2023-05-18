const cache = [];
let isLocked = false;
const maxLogs = parseInt(process.env.MAX_LOGS_IN_MEMORY, 10) || 100;

module.exports = {
  set: (log) => {
    cache.push(log);
    if (cache.length === maxLogs) {
      cache.shift();
    }
  },
  getAll: () => cache,
  get: (transaction) => cache.filter((log) => log.transaction === transaction),
  shift: () => cache.shift(),
  flush: () => {
    while (cache.length > 0) {
      cache.shift();
    }
  },
  lock: () => {
    isLocked = true;
  },
  isLocked: () => isLocked,
  unlock: () => {
    isLocked = false;
  },
};
