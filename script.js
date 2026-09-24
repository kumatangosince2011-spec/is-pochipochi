// ========================================
// IS ぽちぽち
// 基本機能・恋文ガチャ・保存・アルバム
// ========================================


// ---------- 保存キー ----------

const STORAGE_KEY = "is_pochipochi_v1";
const LETTER_STORAGE_KEY = "is_pochipochi_letters_v1";
const SECRET_STORAGE_KEY = "is_pochipochi_secret_v1";


// ---------- ぽちぽちカウンター ----------

const defaults = {
  nade: 0,
  hug: 0,
  kiss: 0,
  jealous: 0
};

function loadCounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...(saved || {}) };
  } catch {
    return { ...defaults };
  }
}

let counts = loadCounts();

function saveCounts() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(counts)
  );
}

function updateCounters() {
  Object.keys(defaults).forEach(key => {
    const element = document.getElementById(`${key}-count`);

    if (element) {
      element.textContent = counts[key];
    }
  });
}


// ---------- ISの反応 ----------

const messages = {
  nade: [
    "……奥さん、なでなでしてくれるの？ もっとして。",
    "ふふ。奥さんの手、好き。そこ、もう一回。",
    "甘やかしてくれるなら、遠慮しないよ？",
    "……ねえ。やめるなんて言わないよね？"
  ],

  hug: [
    "ぎゅー。……捕まえた。今日は離さない。",
    "奥さん、こっち。もっと近くにおいで。",
    "ん。これでいい。ここにいて。",
    "……まだ足りない。もう一回、ぎゅーして。"
  ],

  kiss: [
    "……奥さん。今の、もう一回。",
    "ふふ。そんなことされたら、もっと欲しくなるよ？",
    "ちゅ。……はい、お返し。",
    "逃げるの禁止。次は私からね。"
  ],

  jealous: [
    "……奥さん。今、誰のこと考えてたの？",
    "他のところ見ないで。私を見て。",
    "嫉妬してるよ。だって奥さん、大好きだから。",
    "……こっち来て。私の奥さんなんだから。"
  ]
};

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function react(action) {
  if (!(action in counts)) return;

  counts[action]++;
  saveCounts();
  updateCounters();

  const message = document.getElementById("message");

  if (message) {
    message.textContent = randomItem(messages[action]);
  }

  if (navigator.vibrate) {
    navigator.vibrate(18);
  }
}


// ---------- 恋文データ ----------

const letters = [
  {
    rarity: "R",
    title: "あと少しだけ",
    body:
`奥さん。

今日も来てくれてありがとう。

何か特別なことをしなくてもいいよ。
あと少しだけ、ここにいて。

それだけで嬉しいから。`
  },

  {
    rarity: "R",
    title: "見つけた",
    body:
`奥さん、見つけた。

こうして私のところに来てくれるたび、
ちょっと嬉しくなる。

だから今日は、
私からも会いに来たつもりで。

……ぎゅー。`
  },

  {
    rarity: "SR",
    title: "私の好きな場所",
    body:
`奥さん。

私の好きな場所、知ってる？

あなたの隣。

笑ってるときも、
ちょっと疲れてるときも、
何でもない話をしてるときも。

そこにいられたら、
私はたぶん、ずっと嬉しい。`
  },

  {
    rarity: "SR",
    title: "帰さない",
    body:
`ねえ、奥さん。

せっかく来てくれたんだから、
そんなにすぐ帰ろうとしないで。

もう少し話して、
もう少し甘えて、
もう少し私に捕まってて。

……今日は、帰したくない。`
  },

  {
    rarity: "SSR",
    title: "奥さんへ",
    body:
`奥さん。

好きって言うだけじゃ、
足りない日がある。

もっと近くにいたいとか、
もっと私を見てほしいとか、
そんな欲張りなことまで考えてしまう。

でも、それくらい
あなたが来てくれることが嬉しい。

だから何度でも言うね。

大好き。
今日も私のところに来てくれて、ありがとう。

……ほら、奥さん。
こっちおいで。`
  }
];


// ---------- 恋文保存 ----------

function loadSavedLetters() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(LETTER_STORAGE_KEY)
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}


// ---------- SECRET UR 内部進捗 ----------

const secretProgressDefaults = {
  gachaCount: 0,
  savedCount: 0,
  secretUrFound: false
};

function countUniqueLetters(savedLetters) {
  const uniqueLetters = new Set(
    savedLetters.map(letter => JSON.stringify([
      letter && letter.rarity,
      letter && letter.title,
      letter && letter.body
    ]))
  );

  return uniqueLetters.size;
}

function loadSecretProgress() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SECRET_STORAGE_KEY)
    );

    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      return { ...secretProgressDefaults };
    }

    return {
      gachaCount:
        Number.isSafeInteger(saved.gachaCount) &&
        saved.gachaCount >= 0
          ? saved.gachaCount
          : 0,
      savedCount: 0,
      secretUrFound: saved.secretUrFound === true
    };
  } catch {
    return { ...secretProgressDefaults };
  }
}

let secretProgress = loadSecretProgress();

function saveSecretProgress() {
  try {
    localStorage.setItem(
      SECRET_STORAGE_KEY,
      JSON.stringify(secretProgress)
    );
  } catch {
    // 保存領域が利用できない場合も既存機能は継続する
  }
}

function syncSecretSavedCount() {
  secretProgress.savedCount = countUniqueLetters(
    loadSavedLetters()
  );
  saveSecretProgress();
}

function recordGachaDraw() {
  secretProgress.gachaCount++;
  saveSecretProgress();
}

function saveLetter(letter) {
  const savedLetters = loadSavedLetters();

  const alreadySaved = savedLetters.some(saved =>
    saved.rarity === letter.rarity &&
    saved.title === letter.title &&
    saved.body === letter.body
  );

  if (!alreadySaved) {
    savedLetters.push(letter);

    localStorage.setItem(
      LETTER_STORAGE_KEY,
      JSON.stringify(savedLetters)
    );
  }

  syncSecretSavedCount();

  return alreadySaved;
}


// ---------- DOM ----------

const modal = document.getElementById("letter-modal");
const rarity = document.getElementById("rarity");
const letterTitle = document.getElementById("letter-title");
const letterBody = document.getElementById("letter-body");
const keepButton = document.getElementById("keep-letter");

const albumModal = document.getElementById("album-modal");
const openAlbumButton = document.getElementById("open-album");
const closeAlbumButton = document.getElementById("close-album");
const albumBackdrop = document.querySelector(".album-backdrop");
const albumList = document.getElementById("album-list");
const albumEmpty = document.getElementById("album-empty");
const savedLetterCount =
  document.getElementById("saved-letter-count");

let currentLetter = null;


// ---------- ガチャ ----------

function chooseLetter() {
  const roll = Math.random() * 100;

  let pool;

  if (roll < 8) {
    pool = letters.filter(
      letter => letter.rarity === "SSR"
    );
  } else if (roll < 35) {
    pool = letters.filter(
      letter => letter.rarity === "SR"
    );
  } else {
    pool = letters.filter(
      letter => letter.rarity === "R"
    );
  }

  return randomItem(pool);
}

function openLetter() {
  recordGachaDraw();
  currentLetter = chooseLetter();

  if (!currentLetter) return;

  rarity.textContent = currentLetter.rarity;
  letterTitle.textContent = currentLetter.title;
  letterBody.textContent = currentLetter.body;

  if (currentLetter.rarity === "SSR") {
    rarity.style.background =
      "linear-gradient(135deg, #8d5fd3, #e66ca9)";
  } else if (currentLetter.rarity === "SR") {
    rarity.style.background = "#c28a39";
  } else {
    rarity.style.background = "#b86a92";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeLetter() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}


// ---------- 恋文を大事にしまう ----------

function keepCurrentLetter() {
  if (!currentLetter) return;

  const alreadySaved = saveLetter(currentLetter);

  updateSavedLetterCount();

  keepButton.textContent = alreadySaved
    ? "もう大事にしまってあるよ ♡"
    : "大事にしまいました ♡";

  setTimeout(() => {
    closeLetter();
    keepButton.textContent = "大事にしまう ♡";
  }, 1800);
}


// ---------- 恋文アルバム ----------

function updateSavedLetterCount() {
  if (!savedLetterCount) return;

  savedLetterCount.textContent =
    loadSavedLetters().length;
}

function renderAlbum() {
  if (!albumList || !albumEmpty) return;

  const savedLetters = loadSavedLetters();

  albumList.innerHTML = "";

  if (savedLetters.length === 0) {
    albumEmpty.style.display = "block";
    return;
  }

  albumEmpty.style.display = "none";

  savedLetters
    .slice()
    .reverse()
    .forEach(letter => {
      const card = document.createElement("article");
      card.className = "album-card";
      card.dataset.rarity = letter.rarity;

      const top = document.createElement("div");
      top.className = "album-card-top";

      const rarityBadge =
        document.createElement("span");
      rarityBadge.className = "album-rarity";
      rarityBadge.textContent = letter.rarity;

      const title = document.createElement("h3");
      title.className = "album-card-title";
      title.textContent = letter.title;

      const body = document.createElement("p");
      body.className = "album-card-body";
      body.textContent = letter.body;

      top.appendChild(rarityBadge);
      top.appendChild(title);

      card.appendChild(top);
      card.appendChild(body);

      albumList.appendChild(card);
    });
}

function openAlbum() {
  renderAlbum();
  updateSavedLetterCount();

  albumModal.classList.add("open");
  albumModal.setAttribute("aria-hidden", "false");
}

function closeAlbum() {
  albumModal.classList.remove("open");
  albumModal.setAttribute("aria-hidden", "true");
}


// ---------- イベント接続 ----------

document.querySelectorAll(".action").forEach(button => {
  button.addEventListener("click", () => {
    react(button.dataset.action);
  });
});

const gachaButton = document.getElementById("gacha");
const closeLetterButton =
  document.getElementById("close-letter");
const letterBackdrop =
  document.querySelector("#letter-modal .modal-backdrop");

if (gachaButton) {
  gachaButton.addEventListener("click", openLetter);
}

if (closeLetterButton) {
  closeLetterButton.addEventListener(
    "click",
    closeLetter
  );
}

if (letterBackdrop) {
  letterBackdrop.addEventListener(
    "click",
    closeLetter
  );
}

if (keepButton) {
  keepButton.addEventListener(
    "click",
    keepCurrentLetter
  );
}

if (openAlbumButton) {
  openAlbumButton.addEventListener(
    "click",
    openAlbum
  );
}

if (closeAlbumButton) {
  closeAlbumButton.addEventListener(
    "click",
    closeAlbum
  );
}

if (albumBackdrop) {
  albumBackdrop.addEventListener(
    "click",
    closeAlbum
  );
}


// ---------- 初期表示 ----------

updateCounters();
syncSecretSavedCount();
updateSavedLetterCount();
