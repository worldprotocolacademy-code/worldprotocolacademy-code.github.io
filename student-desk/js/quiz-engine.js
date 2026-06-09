/**
 * World Protocol Academy — Student Desk Beta
 * Quiz Engine Module
 *
 * Static JavaScript quiz engine using local JSON data.
 * No server. No login. No personal data stored.
 * Scores remain in browser memory only.
 *
 * Rules:
 * - All quiz content is placeholder only until approved by Sande Smiljanov.
 * - Real questions must be authored or approved by the doctrinal author.
 */

(function () {
  "use strict";

  // ============================================================
  // Quiz Engine State
  // ============================================================
  var QuizEngine = {
    currentQuiz: null,
    questions: [],
    currentIndex: 0,
    answers: [], // user selections
    score: 0,
    lang: "mk",
    container: null,
    onComplete: null,
  };

  // ============================================================
  // Load Quiz Data from JSON
  // ============================================================
  window.QuizEngine = QuizEngine;

  QuizEngine.loadQuiz = function (quizId, lang) {
    QuizEngine.lang = lang || "mk";
    var jsonPath =
      "../data/quizzes-" +
      QuizEngine.lang +
      ".json?v=" +
      Date.now();

    fetch(jsonPath)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load quiz data");
        return res.json();
      })
      .then(function (data) {
        var quiz = data.quizzes.find(function (q) {
          return q.quiz_id === quizId;
        });
        if (!quiz) throw new Error("Quiz not found: " + quizId);
        QuizEngine.startQuiz(quiz);
      })
      .catch(function (err) {
        console.error("QuizEngine:", err);
        QuizEngine.renderError(err.message);
      });
  };

  // ============================================================
  // Start Quiz
  // ============================================================
  QuizEngine.startQuiz = function (quizData) {
    QuizEngine.currentQuiz = quizData;
    QuizEngine.questions = quizData.questions || [];
    QuizEngine.currentIndex = 0;
    QuizEngine.answers = [];
    QuizEngine.score = 0;

    QuizEngine.container = document.querySelector("[data-quiz-container]");
    if (!QuizEngine.container) return;

    QuizEngine.renderIntro();
  };

  // ============================================================
  // Render Quiz Intro Screen
  // ============================================================
  QuizEngine.renderIntro = function () {
    var q = QuizEngine.currentQuiz;
    var title = QuizEngine.lang === "mk" ? q.quiz_title_mk : q.quiz_title_en;
    var desc =
      QuizEngine.lang === "mk"
        ? "Тестот содржи " +
          QuizEngine.questions.length +
          " прашања. Одговорите се анонимни и не се зачувуваат."
        : "This quiz contains " +
          QuizEngine.questions.length +
          " questions. Answers are anonymous and not stored.";

    var startLabel = QuizEngine.lang === "mk" ? "Започни тест" : "Start Quiz";

    QuizEngine.container.innerHTML =
      '<div class="wpa-quiz-intro">' +
      '<h2>' +
      wpaEscapeHtml(title) +
      "</h2>" +
      '<p class="wpa-text-muted">' +
      wpaEscapeHtml(desc) +
      "</p>" +
      (QuizEngine.questions.length === 0
        ? '<div class="wpa-callout wpa-callout-warn wpa-mt-lg">' +
          '<div class="wpa-callout-title">' +
          (QuizEngine.lang === "mk" ? "Тестот е во подготовка" : "Quiz in Preparation") +
          "</div>" +
          "<p>" +
          (QuizEngine.lang === "mk"
            ? 'Прашањата сеуште не се достапни. Контактирајте го WPA Институтот за повеќе информации.'
            : "Questions are not yet available. Contact the WPA Institute for more information.") +
          "</p></div>"
        : '<button class="wpa-btn wpa-btn-primary wpa-mt-lg" data-quiz-start>' +
          wpaEscapeHtml(startLabel) +
          "</button>") +
      "</div>";

    var startBtn = QuizEngine.container.querySelector("[data-quiz-start]");
    if (startBtn) {
      startBtn.addEventListener("click", function () {
        QuizEngine.renderQuestion();
      });
    }
  };

  // ============================================================
  // Render Current Question
  // ============================================================
  QuizEngine.renderQuestion = function () {
    var question = QuizEngine.questions[QuizEngine.currentIndex];
    if (!question) {
      QuizEngine.renderResults();
      return;
    }

    var progress =
      ((QuizEngine.currentIndex) / QuizEngine.questions.length) * 100;
    var qNum = QuizEngine.currentIndex + 1;
    var total = QuizEngine.questions.length;

    var html =
      '<div class="wpa-quiz-progress">' +
      '<div class="wpa-quiz-progress-bar" style="width:' +
      progress +
      '%"></div></div>' +
      '<div class="wpa-quiz-meta wpa-text-muted wpa-mb-sm">' +
      (QuizEngine.lang === "mk" ? "Прашање" : "Question") +
      " " +
      qNum +
      " / " +
      total +
      "</div>" +
      '<div class="wpa-quiz-question">' +
      '<div class="wpa-quiz-question-text">' +
      wpaEscapeHtml(question.question_text) +
      "</div>" +
      '<div class="wpa-quiz-options">';

    question.answers.forEach(function (ans, idx) {
      html +=
        '<label class="wpa-quiz-option" data-option="' +
        idx +
        '">' +
        '<input type="radio" name="quiz-answer" value="' +
        idx +
        '">' +
        "<span>" +
        wpaEscapeHtml(ans) +
        "</span></label>";
    });

    html += "</div></div>";

    // Navigation
    var nextLabel = QuizEngine.lang === "mk" ? "Следно" : "Next";
    html +=
      '<div class="wpa-quiz-nav wpa-mt-lg">' +
      '<button class="wpa-btn wpa-btn-primary" data-quiz-next disabled>' +
      wpaEscapeHtml(nextLabel) +
      " →</button></div>";

    QuizEngine.container.innerHTML = html;

    // Enable Next when answer selected
    var options = QuizEngine.container.querySelectorAll("[data-option]");
    var nextBtn = QuizEngine.container.querySelector("[data-quiz-next]");

    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        options.forEach(function (o) {
          o.style.background = "";
          o.style.borderColor = "";
        });
        opt.style.background = "var(--wpa-cream)";
        opt.style.borderColor = "var(--wpa-gold)";
        var radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        if (nextBtn) nextBtn.disabled = false;
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var selected = QuizEngine.container.querySelector(
          'input[name="quiz-answer"]:checked'
        );
        if (!selected) return;
        var answerIdx = parseInt(selected.value, 10);
        QuizEngine.answers.push({
          question_id: question.question_id,
          selected: answerIdx,
          correct: answerIdx === question.correct_answer,
        });
        if (answerIdx === question.correct_answer) {
          QuizEngine.score++;
        }
        QuizEngine.currentIndex++;
        QuizEngine.renderQuestion();
      });
    }
  };

  // ============================================================
  // Render Results
  // ============================================================
  QuizEngine.renderResults = function () {
    var total = QuizEngine.questions.length;
    var correct = QuizEngine.score;
    var pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    var resultTitle =
      QuizEngine.lang === "mk" ? "Резултат" : "Results";
    var resultText =
      QuizEngine.lang === "mk"
        ? correct + " точни од " + total + " прашања (" + pct + "%)"
        : correct + " correct out of " + total + " questions (" + pct + "%)";
    var restartLabel =
      QuizEngine.lang === "mk" ? "Почни одново" : "Restart";
    var printLabel =
      QuizEngine.lang === "mk" ? "Печати резултат" : "Print Results";
    var disclaimer =
      QuizEngine.lang === "mk"
        ? "Овој резултат е локален преглед и не претставува официјална оцена."
        : "This result is a local preview and does not represent an official assessment.";

    var html =
      '<div class="wpa-quiz-results wpa-card wpa-mt-lg">' +
      "<h2>" +
      wpaEscapeHtml(resultTitle) +
      "</h2>" +
      '<p style="font-size:1.3rem; color:var(--wpa-navy); font-weight:600;">' +
      wpaEscapeHtml(resultText) +
      "</p>" +
      '<p class="wpa-text-muted">' +
      wpaEscapeHtml(disclaimer) +
      "</p>" +
      '<div class="wpa-mt-lg">' +
      '<button class="wpa-btn wpa-btn-secondary" data-quiz-restart>' +
      wpaEscapeHtml(restartLabel) +
      "</button> " +
      '<button class="wpa-btn wpa-btn-primary no-print" onclick="wpaPrint()">' +
      wpaEscapeHtml(printLabel) +
      "</button></div></div>";

    QuizEngine.container.innerHTML = html;

    var restartBtn = QuizEngine.container.querySelector("[data-quiz-restart]");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        QuizEngine.startQuiz(QuizEngine.currentQuiz);
      });
    }

    if (typeof QuizEngine.onComplete === "function") {
      QuizEngine.onComplete({ score: correct, total: total, percentage: pct });
    }
  };

  // ============================================================
  // Render Error
  // ============================================================
  QuizEngine.renderError = function (message) {
    if (!QuizEngine.container) return;
    var errorLabel =
      QuizEngine.lang === "mk" ? "Грешка" : "Error";
    QuizEngine.container.innerHTML =
      '<div class="wpa-callout wpa-callout-danger">' +
      '<div class="wpa-callout-title">' +
      wpaEscapeHtml(errorLabel) +
      "</div>" +
      "<p>" +
      wpaEscapeHtml(message) +
      "</p></div>";
  };
})();
