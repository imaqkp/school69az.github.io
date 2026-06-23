const $ = (selector) => document.querySelector(selector);
const game = $("#game");
const startScreen = $("#screen-start");
const hud = $("#hud");
const progressBar = $("#progressBar");
const chapterLabel = $("#chapterLabel");
const chapterTitle = $("#chapterTitle");

const state = {
  name: "同学",
  chapter: 1,
  score: 0,
  firstChoice: "",
  memories: [],
  secret: "",
  quizAnswers: [],
};

const chapters = [
  "清晨的闹钟",
  "时间线里的碎片",
  "把回忆连回地点",
  "没说出口的话",
  "毕业前的最后测验",
  "你的毕业签",
];

const quiz = [
  {
    q: "毕业前夜，你最想带走什么？",
    options: [
      { text: "一张合照", score: 9 },
      { text: "一段录音", score: 8 },
      { text: "一封没寄出的信", score: 10 },
      { text: "一份课程报告", score: 7 },
    ],
  },
  {
    q: "如果校园广播突然响起，你希望它播放什么？",
    options: [
      { text: "入学那天的欢迎词", score: 8 },
      { text: "大家一起唱过的歌", score: 10 },
      { text: "老师最后一节课的祝福", score: 9 },
      { text: "食堂今日菜单", score: 7 },
    ],
  },
  {
    q: "你最像哪一种大学生？",
    options: [
      { text: "DDL 前突然爆发型", score: 8 },
      { text: "默默把事情做完型", score: 9 },
      { text: "到处认识朋友型", score: 10 },
      { text: "精神状态随机型", score: 7 },
    ],
  },
  {
    q: "重启这一天，你会把时间留给谁？",
    options: [
      { text: "室友", score: 9 },
      { text: "朋友", score: 10 },
      { text: "老师", score: 8 },
      { text: "以前的自己", score: 10 },
    ],
  },
  {
    q: "最后离开校门时，你会做什么？",
    options: [
      { text: "回头拍一张照", score: 9 },
      { text: "把校牌摸一下", score: 8 },
      { text: "大喊一声毕业快乐", score: 10 },
      { text: "假装只是普通放学", score: 7 },
    ],
  },
];

const pairs = [
  ["通宵复习", "图书馆三楼"],
  ["热汤面", "食堂窗口"],
  ["晚风散步", "操场跑道"],
  ["小组汇报", "教学楼"],
];

function setScreen(templateId) {
  game.innerHTML = document.importNode($(templateId).content, true).children[0].outerHTML;
  bindCurrentChapter();
  updateHud();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateHud() {
  chapterLabel.textContent = `第 ${state.chapter} 章`;
  chapterTitle.textContent = chapters[state.chapter - 1] || chapters.at(-1);
  progressBar.style.width = `${Math.min((state.chapter - 1) / 5 * 100, 100)}%`;
}

function nextChapter() {
  state.chapter += 1;
  if (state.chapter === 2) setScreen("#tpl-chapter2");
  if (state.chapter === 3) setScreen("#tpl-chapter3");
  if (state.chapter === 4) setScreen("#tpl-chapter4");
  if (state.chapter === 5) setScreen("#tpl-chapter5");
  if (state.chapter === 6) setScreen("#tpl-ending");
}

function bindCurrentChapter() {
  if (state.chapter === 1) bindChapter1();
  if (state.chapter === 2) bindChapter2();
  if (state.chapter === 3) bindChapter3();
  if (state.chapter === 4) bindChapter4();
  if (state.chapter === 5) bindChapter5();
  if (state.chapter === 6) bindEnding();
}

$("#startBtn").addEventListener("click", () => {
  const value = $("#playerName").value.trim();
  state.name = value || "同学";
  startScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  game.classList.remove("hidden");
  state.chapter = 1;
  setScreen("#tpl-chapter1");
});

$("#playerName").addEventListener("keydown", (event) => {
  if (event.key === "Enter") $("#startBtn").click();
});

$("#restartBtn").addEventListener("click", resetGame);

function resetGame() {
  Object.assign(state, {
    name: state.name || "同学",
    chapter: 1,
    score: 0,
    firstChoice: "",
    memories: [],
    secret: "",
    quizAnswers: [],
  });
  startScreen.classList.remove("hidden");
  hud.classList.add("hidden");
  game.classList.add("hidden");
  progressBar.style.width = "0%";
}

function bindChapter1() {
  document.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.firstChoice = btn.dataset.value;
      state.score += Number(btn.dataset.score);
      btn.classList.add("selected");
      setTimeout(nextChapter, 480);
    });
  });
}

function bindChapter2() {
  const pocket = $("#memoryPocket");
  const next = $("#timelineNext");
  document.querySelectorAll("#timeline button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("done")) return;
      btn.classList.add("done");
      state.memories.push(btn.dataset.memory);
      state.score += 3;
      pocket.textContent = `已收集：${Math.min(state.memories.length, 5)} / 5`;
      if (state.memories.length >= 5) {
        pocket.textContent = "记忆碎片已装满。你听见远处有人喊你的名字。";
        next.classList.remove("hidden");
      }
    });
  });
  next.addEventListener("click", nextChapter);
}

function bindChapter3() {
  const board = $("#matchBoard");
  const status = $("#matchStatus");
  const cards = shuffle(pairs.flatMap(([a, b], index) => [
    { text: a, pair: index },
    { text: b, pair: index },
  ]));

  let active = [];
  let matched = 0;

  board.innerHTML = cards.map((card, index) => `
    <button class="match-card" data-index="${index}" data-pair="${card.pair}">
      ${card.text}
    </button>
  `).join("");

  board.querySelectorAll(".match-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (card.classList.contains("matched") || card.classList.contains("active")) return;
      card.classList.add("active");
      active.push(card);

      if (active.length === 2) {
        const [a, b] = active;
        if (a.dataset.pair === b.dataset.pair) {
          a.classList.add("matched");
          b.classList.add("matched");
          a.classList.remove("active");
          b.classList.remove("active");
          matched += 1;
          state.score += 5;
          status.textContent = `已配对：${matched} / 4`;
          active = [];
          if (matched === 4) {
            status.textContent = "全部配对成功。校园地图重新亮起来了。";
            setTimeout(nextChapter, 700);
          }
        } else {
          a.classList.add("shake");
          b.classList.add("shake");
          setTimeout(() => {
            a.classList.remove("active", "shake");
            b.classList.remove("active", "shake");
            active = [];
          }, 420);
        }
      }
    });
  });
}

function bindChapter4() {
  $("#fillNext").addEventListener("click", () => {
    const secret = $("#secretWord").value.trim();
    const error = $("#fillError");
    if (secret.length < 2 || secret.length > 6) {
      error.textContent = "请填入 2 到 6 个字，让它像一句真正的毕业暗号。";
      return;
    }
    state.secret = secret;
    state.score += Math.min(secret.length * 2, 10);
    nextChapter();
  });
}

let quizIndex = 0;

function bindChapter5() {
  quizIndex = 0;
  renderQuiz();

  $("#quizPrev").addEventListener("click", () => {
    quizIndex = Math.max(quizIndex - 1, 0);
    renderQuiz();
  });

  $("#quizNext").addEventListener("click", () => {
    if (state.quizAnswers[quizIndex] === undefined) {
      pulseQuiz();
      return;
    }
    if (quizIndex < quiz.length - 1) {
      quizIndex += 1;
      renderQuiz();
    } else {
      state.score += state.quizAnswers.reduce((sum, item) => sum + item.score, 0);
      nextChapter();
    }
  });
}

function renderQuiz() {
  const item = quiz[quizIndex];
  $("#quizBox").innerHTML = `
    <p class="question-index">第 ${quizIndex + 1} / ${quiz.length} 题</p>
    <h3>${item.q}</h3>
    <div class="answer-list">
      ${item.options.map((option, index) => `
        <button class="answer ${state.quizAnswers[quizIndex]?.index === index ? "selected" : ""}" data-index="${index}">
          ${option.text}
        </button>
      `).join("")}
    </div>
  `;

  $("#quizPrev").disabled = quizIndex === 0;
  $("#quizNext").textContent = quizIndex === quiz.length - 1 ? "查看结局" : "下一题";

  document.querySelectorAll(".answer").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      state.quizAnswers[quizIndex] = {
        index,
        text: item.options[index].text,
        score: item.options[index].score,
      };
      renderQuiz();
    });
  });
}

function pulseQuiz() {
  const box = $("#quizBox");
  box.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(-6px)" },
    { transform: "translateX(6px)" },
    { transform: "translateX(0)" },
  ], { duration: 240 });
}

function bindEnding() {
  const finalScore = Math.min(100, Math.round(state.score + 8));
  let title = "温柔收藏家";
  let text = `${state.name}，你把校园里的小事一件件收好。对你来说，毕业不是结束，而是把熟悉的路带到更远的地方。`;

  if (finalScore >= 88) {
    title = "高光重启者";
    text = `${state.name}，你像按下了时光里的闪光键。那些普通日子被你重新点亮，连晚风都替你说了一句：毕业快乐。`;
  } else if (finalScore >= 72) {
    title = "回忆导航员";
    text = `${state.name}，你记得路，也记得人。未来很远，但你总能凭着这些坐标，找到继续出发的勇气。`;
  } else if (finalScore < 58) {
    title = "慢热毕业生";
    text = `${state.name}，你没有急着告别，而是认真把这一天走完。你知道，有些答案会在很久以后才亮起来。`;
  }

  $("#endingTitle").textContent = `你的毕业签：${title}`;
  $("#endingText").textContent = text;
  $("#finalScore").textContent = finalScore;

  const firstMap = {
    library: "图书馆",
    canteen: "食堂",
    playground: "操场",
  };

  const receipt = [
    `<strong>玩家：</strong>${state.name}`,
    `<strong>第一站：</strong>${firstMap[state.firstChoice] || "校园"}`,
    `<strong>收集碎片：</strong>${state.memories.slice(0, 5).join("、")}`,
    `<strong>毕业暗号：</strong>愿我们${state.secret || "重逢有期"}`,
    `<strong>结局：</strong>${title}`,
  ].join("<br />");
  $("#receipt").innerHTML = receipt;

  const shareText = `我在《毕业前夜 · 时光重启》里获得了「${title}」结局，记忆值 ${finalScore}/100。我的毕业暗号是：愿我们${state.secret || "重逢有期"}。`;

  $("#copyBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      $("#copyTip").textContent = "分享文案已复制。";
    } catch {
      $("#copyTip").textContent = shareText;
    }
  });

  $("#playAgainBtn").addEventListener("click", resetGame);
}

function shuffle(array) {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}
