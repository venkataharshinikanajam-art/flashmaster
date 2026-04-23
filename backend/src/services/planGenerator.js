// backend/src/services/planGenerator.js
// Builds a day-by-day study schedule given a list of topics and an exam date.

export function generateSchedule(options) {
  const topics = options.topics;
  const examDate = options.examDate;
  const dailyStudyHours = options.dailyStudyHours;
  const topicDifficulties = options.topicDifficulties || {};

  const exam = new Date(examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((exam - today) / (1000 * 60 * 60 * 24));

  // Edge case: exam is today or in the past - one revision day.
  if (totalDays <= 0) {
    return [
      {
        day: 1,
        date: formatDate(today),
        type: "revision",
        topics: copyArray(topics),
        hours: dailyStudyHours,
      },
    ];
  }

  // Edge case: only 1 or 2 days - all revision.
  if (totalDays <= 2) {
    return buildRevisionOnly(topics, today, totalDays, dailyStudyHours);
  }

  // Reserve last 2 days for revision (or 1 if only 3 days total).
  let revisionDays = 1;
  if (totalDays >= 5) revisionDays = 2;
  const studyDays = totalDays - revisionDays;

  // Put harder topics first so they get studied sooner.
  const topicQueue = sortByDifficulty(copyArray(topics), topicDifficulties);
  const schedule = [];
  let cycleBuffer = []; // topics covered in the current study-study cycle
  let dayNum = 1;
  let topicIndex = 0;

  // How many topics to put on each study day.
  const studyDaysInCycle = Math.ceil(studyDays * (2 / 3));
  let topicsPerStudyDay = 1;
  if (studyDaysInCycle > 0) {
    topicsPerStudyDay = Math.ceil(topics.length / studyDaysInCycle);
    if (topicsPerStudyDay < 1) topicsPerStudyDay = 1;
  }

  // Main loop: study, study, review, study, study, review, ...
  for (let d = 0; d < studyDays; d++) {
    const date = addDays(today, d);
    const posInCycle = d % 3; // 0 = study, 1 = study, 2 = review

    if (posInCycle < 2) {
      // Study day: take the next batch of topics from the queue.
      const dayTopics = [];
      for (let t = 0; t < topicsPerStudyDay; t++) {
        if (topicIndex < topicQueue.length) {
          dayTopics.push(topicQueue[topicIndex]);
          topicIndex++;
        }
      }

      // If the queue is empty, make it a review day instead.
      if (dayTopics.length === 0) {
        schedule.push({
          day: dayNum,
          date: formatDate(date),
          type: "review",
          topics: copyArray(cycleBuffer),
          hours: dailyStudyHours,
        });
      } else {
        // Add these topics to the buffer so the next review day covers them.
        for (let k = 0; k < dayTopics.length; k++) {
          cycleBuffer.push(dayTopics[k]);
        }
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
      // Review day: re-cover topics from the previous two study days.
      schedule.push({
        day: dayNum,
        date: formatDate(date),
        type: "review",
        topics: copyArray(cycleBuffer),
        hours: dailyStudyHours,
      });
      cycleBuffer = []; // reset for the next cycle
    }
    dayNum++;
  }

  // Add the final revision days, covering all topics each day.
  for (let r = 0; r < revisionDays; r++) {
    const date = addDays(today, studyDays + r);
    schedule.push({
      day: dayNum,
      date: formatDate(date),
      type: "revision",
      topics: copyArray(topics),
      hours: dailyStudyHours,
    });
    dayNum++;
  }

  return schedule;
}

// --- Helper functions ---

// Copy an array into a new array (so later mutations do not affect the original).
function copyArray(arr) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]);
  }
  return out;
}

// Format a Date as "YYYY-MM-DD".
function formatDate(d) {
  return d.toISOString().split("T")[0];
}

// Return a new Date n days after the given date.
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Put hard topics first, then medium, then easy.
function sortByDifficulty(topics, difficulties) {
  const order = { hard: 0, medium: 1, easy: 2 };
  topics.sort(function (a, b) {
    let diffA = difficulties[a];
    if (!diffA) diffA = "medium";
    let diffB = difficulties[b];
    if (!diffB) diffB = "medium";
    return order[diffA] - order[diffB];
  });
  return topics;
}

// Split the daily hours across topics: hard topics get more time, easy less.
function allocateHours(dayTopics, totalHours, difficulties) {
  const weights = { hard: 1.5, medium: 1, easy: 0.75 };

  // Find each topic's weight.
  const topicWeights = [];
  for (let i = 0; i < dayTopics.length; i++) {
    let diff = difficulties[dayTopics[i]];
    if (!diff) diff = "medium";
    let w = weights[diff];
    if (!w) w = 1;
    topicWeights.push(w);
  }

  // Sum of all weights.
  let totalWeight = 0;
  for (let i = 0; i < topicWeights.length; i++) {
    totalWeight += topicWeights[i];
  }

  // Assign hours proportional to each topic's weight.
  const hours = {};
  for (let i = 0; i < dayTopics.length; i++) {
    const share = (topicWeights[i] / totalWeight) * totalHours;
    hours[dayTopics[i]] = Math.round(share * 100) / 100;
  }
  return hours;
}

// If there are only 1-2 days, every day is revision over all topics.
function buildRevisionOnly(topics, today, totalDays, dailyStudyHours) {
  const schedule = [];
  for (let d = 0; d < totalDays; d++) {
    schedule.push({
      day: d + 1,
      date: formatDate(addDays(today, d)),
      type: "revision",
      topics: copyArray(topics),
      hours: dailyStudyHours,
    });
  }
  return schedule;
}
