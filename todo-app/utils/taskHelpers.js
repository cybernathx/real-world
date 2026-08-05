function getTaskStatistics(tasks) {
  const completedCount = tasks.filter(task => task.completed).length;

  return {
    completedCount,
    pendingCount: tasks.length - completedCount
  };
}

module.exports = {
  getTaskStatistics
};