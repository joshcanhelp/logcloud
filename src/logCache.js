const cache = [];
let isLocked = false;
const maxLogs = parseInt(process.env.MAX_LOGS_IN_MEMORY, 10) || 100;

module.exports = {
  set: (log) => {
    if (cache.length === maxLogs) {
      cache.shift();
    }
    cache.push(log);
  },
  getAll: () => cache,
  get: (transaction) => cache.filter((log) => log.transaction === transaction),
  getOldest: () => cache[cache.length - 1],
  pop: () => cache.pop(),
  flush: () => {
    while (cache.length > 0) {
      cache.pop();
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
