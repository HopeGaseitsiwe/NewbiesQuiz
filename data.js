/* ============================================================
   Quiz — data.js
   15 curated questions · users · answers · pairs · compatibility
   ============================================================ */

/* ── LocalStorage DB ── */
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

/* ── User Management ── */
const Users = {
  getAll: () => DB.get('sq_users') || {},
  getUser: (u) => (Users.getAll())[u?.toLowerCase()] || null,
  addUser: (username, password, displayName) => {
    const users = Users.getAll();
    const key = username.toLowerCase();
    if (users[key]) return { ok: false, msg: 'Username already taken 💔' };
    users[key] = {
      username: key, displayName: displayName || username,
      password: btoa(password), createdAt: Date.now(),
      notifications: [], answeredQuiz: false,
    };
    DB.set('sq_users', users);
    return { ok: true };
  },
  login: (username, password) => {
    const user = Users.getUser(username);
    if (!user) return { ok: false, msg: 'Username not found 🙁' };
    if (user.password !== btoa(password)) return { ok: false, msg: 'Wrong password 🔐' };
    DB.set('sq_session', user.username);
    return { ok: true, user };
  },
  logout: () => localStorage.removeItem('sq_session'),
  current: () => { const k = DB.get('sq_session'); return k ? Users.getUser(k) : null; },
  update: (username, data) => {
    const users = Users.getAll();
    if (!users[username]) return;
    users[username] = { ...users[username], ...data };
    DB.set('sq_users', users);
  },
  addNotification: (toUsername, notif) => {
    const users = Users.getAll();
    if (!users[toUsername]) return;
    (users[toUsername].notifications = users[toUsername].notifications || [])
      .push({ ...notif, id: Date.now(), read: false });
    DB.set('sq_users', users);
  },
};

/* ── 15 Curated Questions ── */
/* Topics: personality (5), interests (5), relationship (3), trust (1), life (1) */
const QUESTIONS = [
  /* ── PERSONALITY ── */
  {
    id: 1, topic: 'personality', icon: '✨',
    text: 'Which vibe describes you best on a regular day?',
    type: 'options',
    options: [
      'Bubbly & talkative — I bring the energy',
      'Chill & observant — I\'m the quiet one with all the opinions',
      'Driven & focused — always got something on my mind',
      'Spontaneous & unpredictable — I keep people guessing',
    ],
  },
  {
    id: 2, topic: 'personality', icon: '✨',
    text: 'What drains you the most after a long day?',
    type: 'options',
    options: [
      'Being around too many people',
      'Having nothing to do — boredom is evil',
      'Drama and conflict, even if it\'s not mine',
      'Not being heard or understood',
    ],
  },
  {
    id: 3, topic: 'personality', icon: '✨',
    text: 'If you could describe your love language in one sentence, what would it be?',
    type: 'open',
  },
  {
    id: 4, topic: 'personality', icon: '✨',
    text: 'When things go wrong, you are more likely to…',
    type: 'options',
    options: [
      'Talk it out immediately with someone I trust',
      'Go quiet and process alone first',
      'Distract myself until I\'m ready to face it',
      'Jump straight into fixing the problem',
    ],
  },
  {
    id: 5, topic: 'personality', icon: '✨',
    text: 'How would your closest friend describe you in three words? (go ahead, brag a little 😏)',
    type: 'open',
  },

  /* ── INTERESTS ── */
  {
    id: 6, topic: 'interests', icon: '🎯',
    text: 'Your perfect Saturday has zero obligations. What does it look like?',
    type: 'options',
    options: [
      'Outdoors — hiking, a braai, beach, or something active',
      'Indoors — series, snacks, and zero social interaction',
      'Exploring — new restaurant, market, city, or event',
      'Creative — music, art, cooking, or building something',
    ],
  },
  {
    id: 7, topic: 'interests', icon: '🎯',
    text: 'What kind of music do you actually listen to on repeat?',
    type: 'options',
    options: [
      'Amapiano / Afrobeats — it hits different 🎷',
      'R&B / Soul — I\'m a whole vibe',
      'Hip-hop / Rap — lyrics matter',
      'Pop / Indie / Alternative — don\'t judge me',
    ],
  },
  {
    id: 8, topic: 'interests', icon: '🎯',
    text: 'What is one hobby or interest you wish more people knew about you?',
    type: 'open',
  },
  {
    id: 9, topic: 'interests', icon: '🎯',
    text: 'Pick your ideal date from scratch:',
    type: 'options',
    options: [
      'Fancy dinner with good conversation',
      'Chilling at home, cooking together',
      'Adventure date — go-karting, escape room, hiking',
      'Cultural/creative — gallery, live music, market',
    ],
  },
  {
    id: 10, topic: 'interests', icon: '🎯',
    text: 'Which of these could you talk about for hours and never get bored?',
    type: 'options',
    options: [
      'Football / sport / fitness',
      'Food, travel, and new experiences',
      'People, relationships, and human behaviour',
      'Tech, business, money, or future ideas',
    ],
  },

  /* ── RELATIONSHIP ── */
  {
    id: 11, topic: 'relationship', icon: '💞',
    text: 'What does your ideal relationship dynamic look like? Be honest.',
    type: 'open',
  },
  {
    id: 12, topic: 'relationship', icon: '💞',
    text: 'When you have a problem with someone you like, you tend to…',
    type: 'options',
    options: [
      'Address it straight away, even if it\'s uncomfortable',
      'Wait until I\'ve cooled down — I need time',
      'Drop hints and hope they pick up on it 😬',
      'Write it down or text rather than say it out loud',
    ],
  },
  {
    id: 13, topic: 'relationship', icon: '💞',
    text: 'What is one thing a person can do that would make you feel truly seen and appreciated?',
    type: 'open',
  },

  /* ── TRUST ── */
  {
    id: 14, topic: 'trust', icon: '🔒',
    text: 'Loyalty in a relationship means what to you exactly?',
    type: 'options',
    options: [
      'Being completely open — no secrets, no hidden conversations',
      'Showing up consistently, even when it\'s inconvenient',
      'Choosing each other even when other options exist',
      'All of the above — loyalty is the whole package',
    ],
  },

  /* ── LIFE ── */
  {
    id: 15, topic: 'life', icon: '🌱',
    text: 'What is one value or belief you will never compromise on, no matter who asks?',
    type: 'open',
  },
];

const TOPIC_META = {
  personality:  { label: 'Personality',    icon: '✨' },
  interests:    { label: 'Interests',       icon: '🎯' },
  relationship: { label: 'Relationship',    icon: '💞' },
  trust:        { label: 'Trust',           icon: '🔒' },
  life:         { label: 'Life Values',     icon: '🌱' },
};

/* ── Synonym groups for open-answer matching ── */
const SYNONYM_GROUPS = [
  ['love','adore','cherish','care','affection','fond','feeling'],
  ['trust','faith','honest','honesty','truthful','reliable','dependable','open'],
  ['family','parents','siblings','relatives','home','roots'],
  ['loyalty','faithful','devoted','commitment','dedicated'],
  ['communication','talk','conversation','openness','transparency','express','communicate'],
  ['respect','admire','regard','honour','value','appreciate'],
  ['freedom','independence','space','autonomy'],
  ['fun','joy','happy','happiness','laugh','laughter','enjoy','pleasure','exciting','excitement'],
  ['growth','improve','learn','develop','evolve','progress'],
  ['music','songs','beats','tunes','rhythm','sound'],
  ['travel','explore','adventure','journey','trip','discover'],
  ['cooking','food','eating','cuisine','chef','recipe','meal'],
  ['creative','art','paint','draw','write','craft','design'],
  ['calm','peace','peaceful','relaxed','chill','tranquil','serene','balance'],
  ['ambitious','driven','motivated','goal','career','succeed','success','work'],
  ['kind','compassionate','gentle','caring','warm','empathetic','thoughtful'],
  ['consistent','reliable','steady','dependable','stable','present'],
  ['honest','truthful','sincere','genuine','real','authentic'],
  ['quality time','time','presence','together','spend time'],
  ['words','affirmation','compliment','verbal','say','tell'],
  ['touch','hug','physical','cuddle','hold'],
  ['acts','service','actions','do','show','help'],
  ['gift','gifts','surprise','presents'],
];

function normalise(s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]/g,'').trim(); }

function synonymGroupOf(word) {
  const w = normalise(word);
  for (let i = 0; i < SYNONYM_GROUPS.length; i++) {
    if (SYNONYM_GROUPS[i].some(s => w.includes(s) || s.includes(w))) return i;
  }
  return -1;
}

function openAnswerSimilarity(a, b) {
  if (!a || !b) return 0;
  const wa = normalise(a).split(/\s+/).filter(Boolean);
  const wb = normalise(b).split(/\s+/).filter(Boolean);
  if (!wa.length || !wb.length) return 0;
  let matches = 0;
  const usedB = new Set();
  for (const wordA of wa) {
    for (let i = 0; i < wb.length; i++) {
      if (!usedB.has(i) && wb[i] === wordA) { matches++; usedB.add(i); break; }
    }
    const gA = synonymGroupOf(wordA);
    if (gA < 0) continue;
    for (let i = 0; i < wb.length; i++) {
      if (!usedB.has(i) && synonymGroupOf(wb[i]) === gA) { matches += 0.85; usedB.add(i); break; }
    }
  }
  return Math.min(1, matches / Math.max(wa.length, wb.length));
}

function scoreAnswerPair(q, a, b) {
  if (!a || !b) return 0;
  return q.type === 'options'
    ? (normalise(a) === normalise(b) ? 1 : 0)
    : openAnswerSimilarity(a, b);
}

/* ── Answers Storage ── */
const Answers = {
  save: (u, data) => DB.set('sq_ans_' + u, data),
  get:  (u) => DB.get('sq_ans_' + u) || {},
};

/* ── Pairs (invite links) ── */
const Pairs = {
  getAll: () => DB.get('sq_pairs') || [],
  add: (a, b) => {
    const pairs = Pairs.getAll();
    const a2 = a.toLowerCase(), b2 = b.toLowerCase();
    if (!pairs.some(p => (p.a===a2&&p.b===b2)||(p.a===b2&&p.b===a2))) {
      pairs.push({ a: a2, b: b2, createdAt: Date.now() });
      DB.set('sq_pairs', pairs);
    }
  },
  getPartner: (u) => {
    const k = u.toLowerCase();
    const pair = Pairs.getAll().find(p => p.a===k||p.b===k);
    return pair ? (pair.a===k ? pair.b : pair.a) : null;
  },
};

/* ── Compatibility Engine ── */
function computeCompatibility(uA, uB) {
  const aA = Answers.get(uA), aB = Answers.get(uB);
  const topicScores = {}, topicCounts = {};
  let total = 0, count = 0;
  for (const q of QUESTIONS) {
    topicCounts[q.topic] = (topicCounts[q.topic]||0)+1;
    const s = scoreAnswerPair(q, aA[q.id], aB[q.id]);
    topicScores[q.topic] = (topicScores[q.topic]||0)+s;
    total += s; count++;
  }
  const overall = count ? Math.round((total/count)*100) : 0;
  const topicPct = {};
  for (const t of Object.keys(TOPIC_META)) {
    topicPct[t] = topicCounts[t] ? Math.round(((topicScores[t]||0)/topicCounts[t])*100) : 0;
  }
  return { overall, topicPct };
}

/* ── Result Message ── */
function getResultMessage(score) {
  if (score <= 30) return {
    emoji: '🌧️', tier: 'Not Compatible (For Now)',
    msg: "Hmm… the stars aren't quite aligning yet. We're giving 'not compatible (for now)' — but hey, even WiFi connects better with time 😌",
  };
  if (score <= 60) return {
    emoji: '🌙', tier: 'Mildly Flirting With Destiny',
    msg: "Okay, there's definitely some overlap here… like 'we could accidentally keep texting each other till 2am' kind of common ground. No need for a friendzone label — just two people mildly flirting with destiny 😏",
  };
  return {
    emoji: '🔥', tier: 'Highly Compatible',
    msg: "Alright, this is looking serious… don't act surprised when you end up as each other's favourite notification. Go get your person 😌🔥",
  };
}

/* ── Helpers ── */
function showToast(msg, ms = 4500) {
  const t = document.createElement('div');
  t.className = 'toast-sq';
  t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms + 400);
}

function renderNav() {
  const user = Users.current();
  const navEl = document.getElementById('main-nav');
  if (!navEl) return;

  const freshUser = user ? Users.getUser(user.username) : null;
  const notifCount = freshUser
    ? (freshUser.notifications || []).filter(n => !n.read).length : 0;

  if (user) {
    navEl.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="quiz.html">Quiz</a></li>
      <li class="nav-item"><a class="nav-link" href="results.html">Results</a></li>
      <li class="nav-item">
        <a class="nav-link position-relative" href="dashboard.html">
          🔔
          ${notifCount > 0 ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.62rem;">${notifCount}</span>` : ''}
        </a>
      </li>
      <li class="nav-item">
        <a class="btn-nav-cta btn ms-2" href="dashboard.html">
          <span style="background:rgba(255,255,255,0.25);border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;margin-right:6px;">${freshUser.displayName.charAt(0).toUpperCase()}</span>
          ${freshUser.displayName}
        </a>
      </li>
    `;
  } else {
    navEl.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
      <li class="nav-item ms-2"><a class="btn-nav-cta btn" href="register.html">Sign Up</a></li>
    `;
  }
}

document.addEventListener('DOMContentLoaded', renderNav);