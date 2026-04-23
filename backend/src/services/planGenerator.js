// backend/src/services/planGenerator.js

/**
 * @param {Object} opts
 * @param {string[]} opts.topics - e.g. ["Arrays", "Trees", "Graphs"]
 * @param {Date|string} opts.examDate - the exam date
 * @param {number} opts.dailyStudyHours - hours per day (e.g. 3)
 * @param {Object} opts.topicDifficulties - e.g. { "Trees": "hard", "Arrays": "easy" }
 * @returns {Array<{ day: number, date: string, type: string, topics: string[], hours: number, topicHours?: Object }>}
 */
export function generateSchedule({ topics, examDate, dailyStudyHours, topicDifficulties = {} }) {
  const exam = new Date(examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((exam - today) / (1000 * 60 * 60 * 24));

  // Edge case: exam is today or in the past
  if (totalDays <= 0) {
    return [
      {
        day: 1,
        date: formatDate(today),
        type: "revision",
        topics: [...topics],
        hours: dailyStudyHours,
      },
    ];
  }

  // Edge case: only 1-2 days — all revision
  if (totalDays <= 2) {
    return buildRevisionOnly(topics, today, totalDays, dailyStudyHours);
  }

  // Reserve last 2 days for revision (or 1 if only 3 days total)
  const revisionDays = totalDays >= 5 ? 2 : 1;
  const studyDays = totalDays - revisionDays;

  // Distribute topics across study days in study-study-review pattern
  const schedule = [];
  const topicQueue = sortByDifficulty([...topics], topicDifficulties);
  let dayNum = 1;
  let cycleBuffer = []; // topics covered in current cycle (for review day)

  let topicIndex = 0;
  const topicsPerStudyDay = Math.max(1, Math.ceil(topics.length / countStudyDaysInCycle(studyDays)));

  for (let d = 0; d < studyDays; d++) {
    const date = addDays(today, d);
    const posInCycle = d % 3; // 0=study, 1=study, 2=review

    if (posInCycle < 2) {
      // Study day: assign new topics
      const dayTopics = [];
      for (let t = 0; t < topicsPerStudyDay && topicIndex < topicQueue.length; t++) {
        dayTopics.push(topicQueue[topicIndex]);
        topicIndex++;
      }

      // If no new topics left, make it a review day instead
      if (dayTopics.length === 0) {
        schedule.push({
          day: dayNum,
          date: formatDate(date),
          type: "review",
          topics: [...cycleBuffer],
          hours: dailyStudyHours,
        });
      } else {
        cycleBuffer.push(...dayTopics);
        const hours = allocateHours(dayTopics, dailyStudyHours, topicDifficulties);
        schedule.push({
          day: dayNum,
          date: formatDate(date),
          type: "study",
          topics: dayTopics,
          hours: dailyStudyHours,
          topicHours: hours,
        });
      }
    } else {
      // Review day
      schedule.push({
        day: dayNum,
        date: formatDate(date),
        type: "review",
        topics: [...cycleBuffer],
        hours: dailyStudyHours,
      });
      cycleBuffer = []; // reset for next cycle
    }
    dayNum++;
  }

  // Add revision days at the end
  for (let r = 0; r < revisionDays; r++) {
    const date = addDays(today, studyDays + r);
    schedule.push({
      day: dayNum,
      date: formatDate(date),
      type: "revision",
      topics: [...topics], // all topics
      hours: dailyStudyHours,
    });
    dayNum++;
  }

  return schedule;
}

// --- Helper functions ---

function formatDate(d) {
  return d.toISOString().split("T")[0]; // "2026-04-09"
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Put hard topics first, then medium, then easy.
function sortByDifficulty(topics, difficulties) {
  const order = { hard: 0, medium: 1, easy: 2 };
  return topics.sort((a, b) => {
    const diffA = difficulties[a] || "medium";
    const diffB = difficulties[b] || "medium";
    return order[diffA] - order[diffB];
  });
}

function countStudyDaysInCycle(totalStudyDays) {
  // In a 3-day cycle (study, study, review), 2 out of 3 are study days
  return Math.ceil(totalStudyDays * (2 / 3));
}

function allocateHours(dayTopics, totalHours, difficulties) {
  // Hard topics get 1.5x weight, easy get 0.75x, medium 1x
  const weights = { hard: 1.5, medium: 1, easy: 0.75 };
  const topicWeights = dayTopics.map((t) => weights[difficulties[t] || "medium"] || 1);
  const totalWeight = topicWeights.reduce((sum, w) => sum + w, 0);

  const hours = {};
  dayTopics.forEach((t, i) => {
    hours[t] = Math.round((topicWeights[i] / totalWeight) * totalHours * 100) / 100;
  });
  return hours;
}

function buildRevisionOnly(topics, today, totalDays, dailyStudyHours) {
  const schedule = [];
  for (let d = 0; d < totalDays; d++) {
    schedule.push({
      day: d + 1,
      date: formatDate(addDays(today, d)),
      type: "revision",
      topics: [...topics],
      hours: dailyStudyHours,
    });
  }
  return schedule;
}
