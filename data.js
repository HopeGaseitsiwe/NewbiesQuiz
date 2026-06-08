/* ============================================================
   Quiz — data.js  (FINAL FIX)
   - Uses var instead of const/let at top scope (max compat)
   - No btoa/atob anywhere
   - All localStorage wrapped in try/catch
   - Safe for GitHub Pages, all browsers, strict mode
   ============================================================ */

/* ── Password obfuscation (no btoa — it breaks on special chars) ── */
function sqHash(pw) {
  var key = 'sq2025';
  var out = '';
  for (var i = 0; i < pw.length; i++) {
    out += pw.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return out;
}

/* ── Safe localStorage ── */
var DB = {
  get: function(k) {
    try {
      var v = localStorage.getItem(k);
      return v ? JSON.parse(v) : null;
    } catch(e) { return null; }
  },
  set: function(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch(e) { return false; }
  },
  del: function(k) {
    try { localStorage.removeItem(k); } catch(e) {}
  }
};

/* ── Users ── */
var Users = {
  getAll: function() {
    return DB.get('sq_users') || {};
  },
  getUser: function(u) {
    if (!u) return null;
    var all = this.getAll();
    return all[u.toLowerCase()] || null;
  },
  addUser: function(username, password, displayName) {
    try {
      var users = this.getAll();
      var key = username.toLowerCase().trim();
      if (users[key]) return { ok: false, msg: 'Username already taken 💔' };
      users[key] = {
        username: key,
        displayName: (displayName || username).trim(),
        password: sqHash(password),
        createdAt: Date.now(),
        notifications: [],
        answeredQuiz: false
      };
      var saved = DB.set('sq_users', users);
      if (!saved) return { ok: false, msg: 'Could not save to storage. Check your browser settings.' };
      return { ok: true };
    } catch(e) {
      return { ok: false, msg: 'Error: ' + e.message };
    }
  },
  login: function(username, password) {
    try {
      var user = this.getUser(username);
      if (!user) return { ok: false, msg: 'Username not found. Please check and try again.' };
      if (user.password !== sqHash(password)) return { ok: false, msg: 'Wrong password. Please try again.' };
      DB.set('sq_session', user.username);
      return { ok: true, user: user };
    } catch(e) {
      return { ok: false, msg: 'Login error: ' + e.message };
    }
  },
  logout: function() { DB.del('sq_session'); },
  current: function() {
    try {
      var k = DB.get('sq_session');
      return k ? this.getUser(k) : null;
    } catch(e) { return null; }
  },
  update: function(username, data) {
    try {
      var users = this.getAll();
      if (!users[username]) return;
      for (var key in data) { users[username][key] = data[key]; }
      DB.set('sq_users', users);
    } catch(e) {}
  },
  addNotification: function(toUsername, notif) {
    try {
      var users = this.getAll();
      if (!users[toUsername]) return;
      if (!users[toUsername].notifications) users[toUsername].notifications = [];
      notif.id = Date.now();
      notif.read = false;
      users[toUsername].notifications.push(notif);
      DB.set('sq_users', users);
    } catch(e) {}
  }
};

/* ── Answers ── */
var Answers = {
  save: function(u, data) { DB.set('sq_ans_' + u, data); },
  get: function(u) { return DB.get('sq_ans_' + u) || {}; }
};

/* ── Pairs ── */
var Pairs = {
  getAll: function() { return DB.get('sq_pairs') || []; },
  add: function(a, b) {
    try {
      var pairs = this.getAll();
      var a2 = a.toLowerCase(), b2 = b.toLowerCase();
      for (var i = 0; i < pairs.length; i++) {
        if ((pairs[i].a === a2 && pairs[i].b === b2) ||
            (pairs[i].a === b2 && pairs[i].b === a2)) return;
      }
      pairs.push({ a: a2, b: b2, createdAt: Date.now() });
      DB.set('sq_pairs', pairs);
    } catch(e) {}
  },
  getPartner: function(u) {
    try {
      var k = u.toLowerCase();
      var pairs = this.getAll();
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].a === k) return pairs[i].b;
        if (pairs[i].b === k) return pairs[i].a;
      }
      return null;
    } catch(e) { return null; }
  }
};

/* ── Questions ── */
var QUESTIONS = [
  { id:1, topic:'personality', icon:'✨', text:'Which vibe describes you best on a regular day?', type:'options', options:['Bubbly & talkative — I bring the energy','Chill & observant — I\'m the quiet one with all the opinions','Driven & focused — always got something on my mind','Spontaneous & unpredictable — I keep people guessing'] },
  { id:2, topic:'personality', icon:'✨', text:'What drains you the most after a long day?', type:'options', options:['Being around too many people','Having nothing to do — boredom is evil','Drama and conflict, even if it\'s not mine','Not being heard or understood'] },
  { id:3, topic:'personality', icon:'✨', text:'If you could describe your love language in one sentence, what would it be?', type:'open' },
  { id:4, topic:'personality', icon:'✨', text:'When things go wrong, you are more likely to…', type:'options', options:['Talk it out immediately with someone I trust','Go quiet and process alone first','Distract myself until I\'m ready to face it','Jump straight into fixing the problem'] },
  { id:5, topic:'personality', icon:'✨', text:'How would your closest friend describe you in three words?', type:'open' },
  { id:6, topic:'interests', icon:'🎯', text:'Your perfect Saturday has zero obligations. What does it look like?', type:'options', options:['Outdoors — hiking, braai, beach, or something active','Indoors — series, snacks, and zero social interaction','Exploring — new restaurant, market, city, or event','Creative — music, art, cooking, or building something'] },
  { id:7, topic:'interests', icon:'🎯', text:'What kind of music do you actually listen to on repeat?', type:'options', options:['Amapiano / Afrobeats — it hits different','R&B / Soul — I\'m a whole vibe','Hip-hop / Rap — lyrics matter','Pop / Indie / Alternative — don\'t judge me'] },
  { id:8, topic:'interests', icon:'🎯', text:'What is one hobby or interest you wish more people knew about you?', type:'open' },
  { id:9, topic:'interests', icon:'🎯', text:'Pick your ideal date from scratch:', type:'options', options:['Fancy dinner with good conversation','Chilling at home, cooking together','Adventure date — go-karting, escape room, hiking','Cultural or creative — gallery, live music, market'] },
  { id:10, topic:'interests', icon:'🎯', text:'Which of these could you talk about for hours and never get bored?', type:'options', options:['Football, sport, or fitness','Food, travel, and new experiences','People, relationships, and human behaviour','Tech, business, money, or future ideas'] },
  { id:11, topic:'relationship', icon:'💞', text:'What does your ideal relationship dynamic look like? Be honest.', type:'open' },
  { id:12, topic:'relationship', icon:'💞', text:'When you have a problem with someone you like, you tend to…', type:'options', options:['Address it straight away, even if it\'s uncomfortable','Wait until I\'ve cooled down — I need time','Drop hints and hope they pick up on it','Write it down or text rather than say it out loud'] },
  { id:13, topic:'relationship', icon:'💞', text:'What is one thing a person can do that would make you feel truly seen and appreciated?', type:'open' },
  { id:14, topic:'trust', icon:'🔒', text:'Loyalty in a relationship means what to you exactly?', type:'options', options:['Being completely open — no secrets, no hidden conversations','Showing up consistently, even when it\'s inconvenient','Choosing each other even when other options exist','All of the above — loyalty is the whole package'] },
  { id:15, topic:'life', icon:'🌱', text:'What is one value or belief you will never compromise on, no matter who asks?', type:'open' }
];

var TOPIC_META = {
  personality:  { label: 'Personality',  icon: '✨' },
  interests:    { label: 'Interests',    icon: '🎯' },
  relationship: { label: 'Relationship', icon: '💞' },
  trust:        { label: 'Trust',        icon: '🔒' },
  life:         { label: 'Life Values',  icon: '🌱' }
};

/* ── Synonym matching ── */
var SYNONYM_GROUPS = [
  ['love','adore','cherish','care','affection','fond'],
  ['trust','faith','honest','honesty','truthful','reliable'],
  ['loyalty','faithful','devoted','commitment','dedicated'],
  ['talk','conversation','openness','communicate','express'],
  ['respect','admire','value','appreciate'],
  ['freedom','independence','space','autonomy'],
  ['fun','joy','happy','happiness','laugh','enjoy','pleasure'],
  ['growth','improve','learn','develop','evolve','progress'],
  ['music','songs','beats','tunes','rhythm'],
  ['travel','explore','adventure','journey','trip'],
  ['cooking','food','eating','cuisine','recipe','meal'],
  ['creative','art','paint','draw','write','craft','design'],
  ['calm','peace','peaceful','relaxed','chill','serene'],
  ['ambitious','driven','motivated','goal','career','succeed'],
  ['kind','compassionate','gentle','caring','warm','empathetic'],
  ['honest','truthful','sincere','genuine','real','authentic'],
  ['time','presence','together','quality'],
  ['words','affirmation','compliment','say','tell'],
  ['touch','hug','physical','cuddle','hold'],
  ['acts','service','actions','do','show','help'],
  ['gift','gifts','surprise','presents']
];

function sqNormalise(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function sqSynonymGroup(word) {
  var w = sqNormalise(word);
  for (var i = 0; i < SYNONYM_GROUPS.length; i++) {
    for (var j = 0; j < SYNONYM_GROUPS[i].length; j++) {
      var s = SYNONYM_GROUPS[i][j];
      if (w.indexOf(s) !== -1 || s.indexOf(w) !== -1) return i;
    }
  }
  return -1;
}

function openAnswerSimilarity(a, b) {
  if (!a || !b) return 0;
  var wa = sqNormalise(a).split(/\s+/).filter(function(x){return x;});
  var wb = sqNormalise(b).split(/\s+/).filter(function(x){return x;});
  if (!wa.length || !wb.length) return 0;
  var matches = 0;
  var usedB = {};
  for (var i = 0; i < wa.length; i++) {
    for (var j = 0; j < wb.length; j++) {
      if (!usedB[j] && wb[j] === wa[i]) { matches++; usedB[j] = true; break; }
    }
    var gA = sqSynonymGroup(wa[i]);
    if (gA < 0) continue;
    for (var k = 0; k < wb.length; k++) {
      if (!usedB[k] && sqSynonymGroup(wb[k]) === gA) { matches += 0.85; usedB[k] = true; break; }
    }
  }
  return Math.min(1, matches / Math.max(wa.length, wb.length));
}

function scoreAnswerPair(q, a, b) {
  if (!a || !b) return 0;
  return q.type === 'options'
    ? (sqNormalise(a) === sqNormalise(b) ? 1 : 0)
    : openAnswerSimilarity(a, b);
}

function computeCompatibility(uA, uB) {
  var aA = Answers.get(uA), aB = Answers.get(uB);
  var topicScores = {}, topicCounts = {};
  var total = 0, count = 0;
  for (var i = 0; i < QUESTIONS.length; i++) {
    var q = QUESTIONS[i];
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    var s = scoreAnswerPair(q, aA[q.id], aB[q.id]);
    topicScores[q.topic] = (topicScores[q.topic] || 0) + s;
    total += s; count++;
  }
  var overall = count ? Math.round((total / count) * 100) : 0;
  var topicPct = {};
  var topics = Object.keys(TOPIC_META);
  for (var t = 0; t < topics.length; t++) {
    var tp = topics[t];
    topicPct[tp] = topicCounts[tp]
      ? Math.round(((topicScores[tp] || 0) / topicCounts[tp]) * 100) : 0;
  }
  return { overall: overall, topicPct: topicPct };
}

function getResultMessage(score) {
  if (score <= 30) return { emoji: '🌧️', tier: 'Not Compatible (For Now)', msg: "Hmm... the stars aren't quite aligning yet. We're giving 'not compatible (for now)' — but hey, even WiFi connects better with time 😌" };
  if (score <= 60) return { emoji: '🌙', tier: 'Mildly Flirting With Destiny', msg: "Okay, there's definitely some overlap here... like 'we could accidentally keep texting each other till 2am' kind of common ground. No need for a friendzone label — just two people mildly flirting with destiny 😏" };
  return { emoji: '🔥', tier: 'Highly Compatible', msg: "Alright, this is looking serious... don't act surprised when you end up as each other's favourite notification. Go get your person 😌🔥" };
}

/* ── Toast ── */
function showToast(msg, ms) {
  try {
    ms = ms || 4500;
    var t = document.createElement('div');
    t.className = 'toast-sq';
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, ms);
  } catch(e) {}
}

/* ── Nav ── */
function renderNav() {
  try {
    var navEl = document.getElementById('main-nav');
    if (!navEl) return;
    var user = Users.current();
    if (user) {
      var fresh = Users.getUser(user.username) || user;
      var notifs = fresh.notifications || [];
      var unread = 0;
      for (var i = 0; i < notifs.length; i++) { if (!notifs[i].read) unread++; }
      var initial = (fresh.displayName || '?').charAt(0).toUpperCase();
      navEl.innerHTML =
        '<li class="nav-item"><a class="nav-link" href="quiz.html">Quiz</a></li>' +
        '<li class="nav-item"><a class="nav-link" href="results.html">Results</a></li>' +
        '<li class="nav-item"><a class="nav-link position-relative" href="dashboard.html">🔔' +
        (unread > 0 ? '<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.6rem;">' + unread + '</span>' : '') +
        '</a></li>' +
        '<li class="nav-item"><a class="btn-nav-cta btn ms-2" href="dashboard.html">' +
        '<span style="background:rgba(255,255,255,0.25);border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;margin-right:6px;">' + initial + '</span>' +
        (fresh.displayName || user.username) + '</a></li>';
    } else {
      navEl.innerHTML =
        '<li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>' +
        '<li class="nav-item ms-2"><a class="btn-nav-cta btn" href="register.html">Sign Up</a></li>';
    }
  } catch(e) { console.warn('nav error:', e); }
}

document.addEventListener('DOMContentLoaded', renderNav);
