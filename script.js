const STORAGE_KEY = "is_pochipochi_v1";

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

function saveCounts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function updateCounters() {
  Object.keys(defaults).forEach(key => {
    const element = document.getElementById(`${key}-count`);
    if (element) element.textContent = counts[key];
  });
}

function react(action) {
  counts[action]++;
  saveCounts();
  updateCounters();

  const message = document.getElementById("message");
  message.textContent = randomItem(messages[action]);

  if (navigator.vibrate) {
    navigator.vibrate(18);
  }
}

document.querySelectorAll(".action").forEach(button => {
  button.addEventListener("click", () => {
    react(button.dataset.action);
  });
});

const modal = document.getElementById("letter-modal");
const rarity = document.getElementById("rarity");
const letterTitle = document.getElementById("letter-title");
const letterBody = document.getElementById("letter-body");

function chooseLetter() {
  const roll = Math.random() * 100;
  let pool;

  if (roll < 8) {
    pool = letters.filter(letter => letter.rarity === "SSR");
  } else if (roll < 35) {
    pool = letters.filter(letter => letter.rarity === "SR");
  } else {
    pool = letters.filter(letter => letter.rarity === "R");
  }

  return randomItem(pool);
}

function openLetter() {
  const letter = chooseLetter();

  rarity.textContent = letter.rarity;
  letterTitle.textContent = letter.title;
  letterBody.textContent = letter.body;

  if (letter.rarity === "SSR") {
    rarity.style.background =
      "linear-gradient(135deg, #8d5fd3, #e66ca9)";
  } else if (letter.rarity === "SR") {
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

document
  .getElementById("gacha")
  .addEventListener("click", openLetter);

document
  .getElementById("close-letter")
  .addEventListener("click", closeLetter);

document
  .querySelector(".modal-backdrop")
  .addEventListener("click", closeLetter);

document
  .getElementById("keep-letter")
  .addEventListener("click", closeLetter);

updateCounters();
// ===== 恋文保存システム =====

const LETTER_STORAGE_KEY = "is_pochipochi_letters_v1";

function loadSavedLetters() {
  try {
    return JSON.parse(
      localStorage.getItem(LETTER_STORAGE_KEY)
    ) || [];
  } catch {
    return [];
  }
}

function saveCurrentLetter() {
  const savedLetters = loadSavedLetters();

  const currentLetter = {
    rarity: rarity.textContent,
    title: letterTitle.textContent,
    body: letterBody.textContent
  };

  const alreadySaved = savedLetters.some(letter =>
    letter.rarity === currentLetter.rarity &&
    letter.title === currentLetter.title &&
    letter.body === currentLetter.body
  );

if (!alreadySaved) {
  savedLetters.push(currentLetter);

  localStorage.setItem(
    LETTER_STORAGE_KEY,
    JSON.stringify(savedLetters)
  );
}

  const keepButton = document.getElementById("keep-letter");

  keepButton.textContent = alreadySaved
    ? "もう大事にしまってあるよ ♡"
    : "大事にしまいました ♡";

  setTimeout(() => {
    closeLetter();
    keepButton.textContent = "大事にしまう ♡";
  }, 700);
}

// 既存の「閉じるだけ」の動作を、保存動作に交換
const oldKeepButton = document.getElementById("keep-letter");
const newKeepButton = oldKeepButton.cloneNode(true);

oldKeepButton.replaceWith(newKeepButton);

newKeepButton.addEventListener("click", saveCurrentLetter);
// =========================
// 恋文アルバム
// =========================

const albumModal = document.getElementById("album-modal");
const openAlbumButton = document.getElementById("open-album");
const closeAlbumButton = document.getElementById("close-album");
const albumBackdrop = document.querySelector(".album-backdrop");
const albumList = document.getElementById("album-list");
const albumEmpty = document.getElementById("album-empty");
const savedLetterCount = document.getElementById("saved-letter-count");

function loadSavedLetters() {
  try {
    return JSON.parse(
      localStorage.getItem(LETTER_STORAGE_KEY)
    ) || [];
  } catch {
    return [];
  }
}

function updateSavedLetterCount() {
  const savedLetters = loadSavedLetters();

  if (savedLetterCount) {
    savedLetterCount.textContent = savedLetters.length;
  }
}

function renderAlbum() {
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

      const rarityBadge = document.createElement("span");
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

openAlbumButton.addEventListener("click", openAlbum);
closeAlbumButton.addEventListener("click", closeAlbum);
albumBackdrop.addEventListener("click", closeAlbum);

updateSavedLetterCount();
// ===== SECRET UR SYSTEM =====
// まだ扉は開けない。
// ここでは「秘密に辿り着くための記録」だけを残す。

const SECRET_STORAGE_KEY = "is_pochipochi_secret_v1";

function loadSecretState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SECRET_STORAGE_KEY));

    return {
      gachaCount: 0,
      savedCount: 0,
      secretUrFound: false,
      ...(saved || {})
    };
  } catch {
    return {
      gachaCount: 0,
      savedCount: 0,
      secretUrFound: false
    };
  }
}

let secretState = loadSecretState();

function saveSecretState() {
  localStorage.setItem(
    SECRET_STORAGE_KEY,
    JSON.stringify(secretState)
  );
}

// 現在すでに保存されている恋文も記録に反映
secretState.savedCount = loadSavedLetters().length;
saveSecretState();
