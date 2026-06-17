const $ = id => document.getElementById(id);
const totalQuestions = () => Array.isArray(window.QUESTIONS) ? window.QUESTIONS.length : 0;

let pool = [];
let index = 0;
let answered = false;
let optionOrder = [];
let stats = JSON.parse(localStorage.getItem("financeQuizStats") || '{"correct":0,"wrong":0,"done":0,"wrongIds":[]}');

function saveStats(){
  localStorage.setItem("financeQuizStats", JSON.stringify(stats));
}

function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function updateStats(){
  $("correctCount").textContent = stats.correct;
  $("wrongCount").textContent = stats.wrong;
  $("doneCount").textContent = stats.done;
  renderWrongList();
}

function updateStaticLabels(){
  const total = totalQuestions();
  const label = $("totalLabel");
  const allOption = $("allChapterOption");
  if(label) label.textContent = total + " câu trắc nghiệm";
  if(allOption) allOption.textContent = "Tất cả " + total + " câu";
}

function questionLabel(q){
  return q && q.sourceLabel ? q.sourceLabel : "Câu gốc " + (q ? q.id : "--");
}

function start(){
  const chapter = $("chapterSelect").value;
  pool = window.QUESTIONS.filter(q => chapter === "all" || String(q.chapter) === chapter);

  if($("shuffleToggle").checked) pool = shuffle(pool);

  const limit = $("limitSelect").value;
  if(limit !== "all") pool = pool.slice(0, Math.min(Number(limit), pool.length));

  index = 0;
  $("mainTitle").textContent = chapter === "all" ? "Bộ ôn " + pool.length + " câu" : (pool[0]?.chapterTitle || "Ôn tập");
  render();
}

function render(){
  if(!pool.length) return;

  const q = pool[index];
  answered = false;
  optionOrder = $("shuffleOptionsToggle").checked ? shuffle(["A", "B", "C", "D"]) : ["A", "B", "C", "D"];

  $("chapterLabel").textContent = q.chapterTitle;
  $("questionNumber").textContent = "Câu " + (index + 1) + "/" + pool.length;
  $("originalNumber").textContent = questionLabel(q);
  $("questionText").innerHTML = highlightQuestion(q.question, q.keywords);
  $("keywordBox").className = "keyword-box hidden";
  $("keywordBox").textContent = "";
  $("feedback").className = "feedback hidden";
  $("feedback").textContent = "";
  $("progressText").textContent = (index + 1) + "/" + pool.length;
  $("progressBar").style.width = ((index + 1) / pool.length) * 100 + "%";

  const wrap = $("options");
  wrap.innerHTML = "";
  optionOrder.forEach((letter, i) => {
    const div = document.createElement("div");
    div.className = "option";
    div.dataset.letter = letter;
    div.innerHTML = '<span class="letter">' + String.fromCharCode(65 + i) + '</span><span>' + escapeHtml(q.options[letter]) + '</span>';
    div.addEventListener("click", () => choose(letter));
    wrap.appendChild(div);
  });
}

function choose(letter){
  if(answered) return;

  const q = pool[index];
  answered = true;

  document.querySelectorAll(".option").forEach(el => {
    const l = el.dataset.letter;
    if(l === q.answer) el.classList.add("correct");
    if(l === letter && letter !== q.answer) el.classList.add("wrong");
  });

  const good = letter === q.answer;
  if(good){
    stats.correct++;
  }else{
    stats.wrong++;
    if(!stats.wrongIds.includes(q.id)) stats.wrongIds.push(q.id);
  }

  stats.done++;
  saveStats();
  updateStats();
  showFeedback(good);
}

function showFeedback(good){
  const q = pool[index];
  const box = $("feedback");
  const answer = displayLetterFor(q.answer) + ". " + escapeHtml(q.answerText);
  box.className = "feedback " + (good ? "good" : "bad");
  box.innerHTML = good ? "Đúng rồi. Đáp án: <b>" + answer + "</b>" : "Sai rồi. Đáp án đúng là: <b>" + answer + "</b>";
}

function showAnswer(){
  if(!pool.length) return;

  const q = pool[index];
  answered = true;

  document.querySelectorAll(".option").forEach(el => {
    if(el.dataset.letter === q.answer) el.classList.add("correct");
  });

  const box = $("feedback");
  box.className = "feedback good";
  box.innerHTML = "Đáp án đúng: <b>" + displayLetterFor(q.answer) + ". " + escapeHtml(q.answerText) + "</b>";
}

function next(){
  if(!pool.length) return;
  index = Math.min(index + 1, pool.length - 1);
  render();
}

function prev(){
  if(!pool.length) return;
  index = Math.max(index - 1, 0);
  render();
}

function renderWrongList(){
  const wrap = $("wrongList");
  if(!stats.wrongIds.length){
    wrap.className = "wrong-list empty";
    wrap.textContent = "Chưa có câu sai nào. Ngon nha.";
    return;
  }

  wrap.className = "wrong-list";
  wrap.innerHTML = "";
  stats.wrongIds.slice(-40).forEach(id => {
    const question = window.QUESTIONS.find(q => q.id === id);
    const btn = document.createElement("button");
    btn.className = "wrong-pill";
    btn.textContent = questionLabel(question || { id });
    btn.addEventListener("click", () => {
      pool = window.QUESTIONS.filter(q => q.id === id);
      index = 0;
      $("mainTitle").textContent = "Ôn lại câu sai";
      render();
    });
    wrap.appendChild(btn);
  });
}

function reviewWrong(){
  if(!stats.wrongIds.length) return;
  const wrongPool = stats.wrongIds
    .map(id => window.QUESTIONS.find(q => q.id === id))
    .filter(Boolean);
  pool = $("shuffleToggle").checked ? shuffle(wrongPool) : wrongPool;
  index = 0;
  $("mainTitle").textContent = ($("shuffleToggle").checked ? "Ôn random " : "Ôn ") + pool.length + " câu sai";
  render();
}

function resetProgress(){
  if(!confirm("Xóa toàn bộ thống kê và danh sách câu sai nha?")) return;
  stats = { correct: 0, wrong: 0, done: 0, wrongIds: [] };
  saveStats();
  updateStats();
}

function displayLetterFor(letter){
  const pos = optionOrder.indexOf(letter);
  return pos === -1 ? letter : String.fromCharCode(65 + pos);
}

function highlightQuestion(question, keywords){
  const text = String(question || "");
  const source = Array.isArray(keywords) ? keywords : getQuestionKeywords(text);
  const terms = source
    .map(term => String(term || "").trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if(!terms.length) return escapeHtml(text);

  const lower = text.toLocaleLowerCase("vi");
  const spans = [];

  terms.forEach(term => {
    const target = term.toLocaleLowerCase("vi");
    let pos = 0;
    while(target && (pos = lower.indexOf(target, pos)) !== -1){
      const end = pos + target.length;
      const overlaps = spans.some(span => pos < span.end && end > span.start);
      if(!overlaps) spans.push({ start: pos, end });
      pos = end;
    }
  });

  if(!spans.length) return escapeHtml(text);

  spans.sort((a, b) => a.start - b.start);
  let out = "";
  let last = 0;
  spans.forEach(span => {
    out += escapeHtml(text.slice(last, span.start));
    out += "<mark>" + escapeHtml(text.slice(span.start, span.end)) + "</mark>";
    last = span.end;
  });
  out += escapeHtml(text.slice(last));
  return out;
}

function getQuestionKeywords(question){
  const stop = new Set([
    "trong", "được", "không", "những", "thường", "thành", "hoặc", "người", "doanh", "nghiệp",
    "nào", "sau", "đây", "của", "với", "khi", "một", "các", "cho", "biết", "điểm", "hình",
    "thức", "chủ", "yếu", "quan", "trọng", "nhất", "khác", "nhau", "thuộc", "loại", "tính",
    "theo", "gọi", "phản", "ánh", "thế", "bao", "nhiêu", "năm", "tiền", "hàng", "đồng",
    "xảy", "điều", "kiện", "mục", "đích", "hoạt", "động", "chức", "năng", "công", "thức",
    "giữa", "phải", "hiện", "tượng", "dùng", "nhằm", "phần", "trước"
  ]);

  return question
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map(word => word.trim())
    .filter(Boolean)
    .filter(word => word.length >= 4)
    .filter(word => !stop.has(word.toLocaleLowerCase("vi")))
    .slice(0, 5);
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("startBtn").addEventListener("click", start);
$("nextBtn").addEventListener("click", next);
$("prevBtn").addEventListener("click", prev);
$("showAnswerBtn").addEventListener("click", showAnswer);
$("reviewWrongBtn").addEventListener("click", reviewWrong);
$("resetProgressBtn").addEventListener("click", resetProgress);

updateStaticLabels();
updateStats();
start();
