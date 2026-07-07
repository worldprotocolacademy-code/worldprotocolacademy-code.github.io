/* =====================================================================
   WPA Five Engines — Interactive logic
   Vanilla JS, no dependencies. Populates every #...Mount element,
   handles MK/EN language switching, and wires the Readiness Review form.
   ===================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     0. Language state (MK default, EN available)
     ------------------------------------------------------------------ */
  const state = { lang: "mk" };

  /* Static i18n dictionary for data-i18n text nodes already in the HTML.
     Keys mirror the data-i18n attributes used in wpa-five-engines.html. */
  const I18N = {
    "hero.title": { mk: "WPA Five Engines", en: "WPA Five Engines" },
    "brand.tagline": { mk: "Независна образовна платформа во развој", en: "Independent educational platform in development" },
    "nav.home": { mk: "Почетна", en: "Home" },
    "nav.institute": { mk: "Институт", en: "Institute" },
    "hero.kicker": { mk: "Протокол · Дипломатија · Безбедност · Комуникација", en: "Protocol · Diplomacy · Security · Communication" },
    "hero.heading": { mk: "10 бесплатни алатки за протокол и дипломатија", en: "10 free tools for protocol and diplomacy" },
    "hero.lead": { mk: "За дипломати, студенти и организатори на настани. Почни со брз тест од 2 минути, потоа истражи ризик-калкулатор, симулации и база од 160 институции.", en: "For diplomats, students, and event organizers. Start with a quick 2-minute quiz, then explore a risk calculator, simulations, and a database of 160 institutions." },
    "hero.cta1": { mk: "Започни Protocol Score", en: "Start Protocol Score" },
    "hero.cta2": { mk: "Отвори симулатор", en: "Open simulator" },
    "ethics.title": { mk: "WPA Trust Discipline", en: "WPA Trust Discipline" },
    "ethics.text": { mk: "Овој модул е образовен и аналитички. Не е државна услуга, не е официјална проценка на институции и не претставува правна, дипломатска или безбедносна одлука.", en: "This module is educational and analytical. It is not a state service, not an official assessment of institutions, and does not constitute a legal, diplomatic, or security decision." },
    "ethics.item1": { mk: "Opt-in пристап за институции.", en: "Opt-in approach for institutions." },
    "ethics.item2": { mk: "Без измислени цитати и без неосновани тврдења.", en: "No invented quotes and no unsupported claims." },
    "ethics.item3": { mk: "Јасна фактографска таксономија за анализи.", en: "Clear factual taxonomy for analyses." },
    "engine1.title": { mk: "Attraction", en: "Attraction" },
    "engine1.text": { mk: "Protocol Score, кратки анализи и содржина што луѓето сакаат да ја споделат.", en: "Protocol Score, short analyses, and content people want to share." },
    "engine2.title": { mk: "Education", en: "Education" },
    "engine2.text": { mk: "Scenario Simulator, Micro Lessons и практични алатки за учење.", en: "Scenario Simulator, micro lessons and practical learning tools." },
    "engine3.title": { mk: "Authority", en: "Authority" },
    "engine3.text": { mk: "Insights, календар, мапа и case library со академска дисциплина.", en: "Insights, calendar, map, and case library with academic discipline." },
    "engine4.title": { mk: "Trust", en: "Trust" },
    "engine4.text": { mk: "Дисклејмери, taxonomy, correction policy и проверлива методологија.", en: "Disclaimers, taxonomy, correction policy and verifiable methodology." },
    "engine5.title": { mk: "Premium Future", en: "Premium Future" },
    "engine5.text": { mk: "Seal, review, executive formats и membership — активирани само кога правната рамка е подготвена.", en: "Seal, review, executive formats, and membership — activated only once the legal framework is ready." },
    "score.kicker": { mk: "Engine 1 · Lead Magnet", en: "Engine 1 · Lead Magnet" },
    "score.title": { mk: "WPA Protocol Score", en: "WPA Protocol Score" },
    "score.desc": { mk: "Одговори на 8 прашања и добиј професионален профил: Новак, Апсолвент, Експерт или Мајстор.", en: "Answer 8 questions and receive a professional profile: Novice, Graduate, Expert, or Master." },
    "score.notThis": { mk: "Не е лиценца, сертификат или официјална проценка.", en: "Not a license, certificate, or official assessment." },
    "scenario.kicker": { mk: "Engine 2 · Gamified Learning", en: "Engine 2 · Gamified Learning" },
    "scenario.title": { mk: "Protocol Scenario Simulator", en: "Protocol Scenario Simulator" },
    "scenario.desc": { mk: "Вежбај реални протоколарни ситуации преку избори, последици и кратки објаснувања.", en: "Practice real protocol situations through choices, consequences, and short explanations." },
    "risk.kicker": { mk: "Engine 2 · Readiness", en: "Engine 2 · Readiness" },
    "risk.title": { mk: "Protocol Risk Meter", en: "Protocol Risk Meter" },
    "risk.desc": { mk: "Едукативна проценка на протоколарна подготвеност за формален настан.", en: "Educational assessment of protocol readiness for a formal event." },
    "map.kicker": { mk: "Engine 3 · Reference Atlas", en: "Engine 3 · Reference Atlas" },
    "map.title": { mk: "Global Protocol Reference Map", en: "Global Protocol Reference Map" },
    "map.desc": { mk: "Едукативен атлас на 160 записи од WPA Master List REV2 — академии, think tank-ови, УН тела, судови и финансиски институции, групирани по континент и категорија.", en: "An educational atlas of 160 records from the WPA Master List REV2 — academies, think tanks, UN bodies, courts, and financial institutions, grouped by continent and category." },
    "precedence.kicker": { mk: "Engine 2 · Practical Tool", en: "Engine 2 · Practical Tool" },
    "precedence.title": { mk: "WPA Precedence Builder", en: "WPA Precedence Builder" },
    "precedence.desc": { mk: "Внеси учесници и добиј основна логика за ред на предимство, со предупредувања за проверка.", en: "Enter participants and get a baseline precedence order, with prompts to verify locally." },
    "precedence.notThis": { mk: "Не заменува проверка според Виенската конвенција или локален протоколарен авторитет.", en: "Does not replace verification against the Vienna Convention or a local protocol authority." },
    "flag.kicker": { mk: "Engine 4 · Symbol Discipline", en: "Engine 4 · Symbol Discipline" },
    "flag.title": { mk: "Flag & Symbol Check Tool", en: "Flag & Symbol Check Tool" },
    "flag.desc": { mk: "Контролна листа за знамиња, амблеми, химни, редослед, визуелен протокол и zero-hallucination дисциплина.", en: "A checklist for flags, emblems, anthems, order, visual protocol, and zero-hallucination discipline." },
    "daily.kicker": { mk: "Engine 1 · Daily Touchpoint", en: "Engine 1 · Daily Touchpoint" },
    "daily.title": { mk: "WPA Daily Protocol Minute", en: "WPA Daily Protocol Minute" },
    "daily.desc": { mk: "30 готови дневни пораки за веб, LinkedIn, Telegram, WhatsApp или Viber — без потреба веднаш да се гради бот.", en: "30 ready daily messages for web, LinkedIn, Telegram, WhatsApp, or Viber — no need to build a bot right away." },
    "insights.kicker": { mk: "Engine 3 + 4 · Authority with Discipline", en: "Engine 3 + 4 · Authority with Discipline" },
    "insights.title": { mk: "WPA Insights Engine", en: "WPA Insights Engine" },
    "insights.desc": { mk: "Шаблон за анализа со фактографска таксономија: Verified, Widely Reported, Visual Observation, Analytical Interpretation.", en: "An analysis template with factual taxonomy: Verified, Widely Reported, Visual Observation, Analytical Interpretation." },
    "review.kicker": { mk: "Engine 4 · Safe Opt-In", en: "Engine 4 · Safe Opt-In" },
    "review.title": { mk: "WPA Protocol Readiness Review", en: "WPA Protocol Readiness Review" },
    "review.desc": { mk: "Само доброволно барање за едукативен преглед, со јасна граница и без службени тврдења.", en: "Only a voluntary request for an educational review, with clear boundaries and no official claims." },
    "review.notThis": { mk: "Не е официјална институционална проценка, ниту акредитација.", en: "Not an official institutional assessment, nor an accreditation." },
    "form.name": { mk: "Име и презиме", en: "Full name" },
    "form.org": { mk: "Организација", en: "Organization" },
    "form.email": { mk: "Е-пошта", en: "Email" },
    "form.event": { mk: "Тип на настан", en: "Event type" },
    "form.note": { mk: "Краток опис", en: "Short description" },
    "form.consent": { mk: "Разбирам дека ова е образовен/консултативен opt-in преглед, не официјална институционална проценка.", en: "I understand this is an educational/advisory opt-in review, not an official institutional assessment." },
    "form.submit": { mk: "Подготви е-пошта", en: "Prepare email" },
    "future.kicker": { mk: "Engine 5 · Later Stage", en: "Engine 5 · Later Stage" },
    "future.title": { mk: "Corporate Diplomatic Seal · Future Gate", en: "Corporate Diplomatic Seal · Future Gate" },
    "future.desc": { mk: "Овој дел намерно останува како идно ниво: без наплата, без тврдење за акредитација и без агресивна продажба додека не се подготви правна форма.", en: "This section deliberately remains a future stage: no charge, no accreditation claim, and no aggressive sales until a legal form is ready." },
    "future.card1.title": { mk: "Before Launch", en: "Before Launch" },
    "future.card1.text": { mk: "Правна форма, конфликт-на-интерес политика, методологија, жалбена постапка и јавни критериуми.", en: "Legal form, conflict-of-interest policy, methodology, appeals process, and public criteria." },
    "future.card2.title": { mk: "What It Could Include", en: "What It Could Include" },
    "future.card2.text": { mk: "Обука, readiness review, јавен профил, сертификат за учество и проверлива WPA евиденција.", en: "Training, readiness review, public profile, certificate of participation, and verifiable WPA records." },
    "future.card3.title": { mk: "What It Must Avoid", en: "What It Must Avoid" },
    "future.card3.text": { mk: "Не смее да изгледа како државна, дипломатска, универзитетска или официјална акредитација.", en: "Must never resemble state, diplomatic, university, or official accreditation." },
    "footer.note": { mk: "Independent educational platform in development.", en: "Independent educational platform in development." }
  };

  function applyLanguage(lang) {
    state.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const entry = I18N[key];
      if (entry && entry[lang]) el.textContent = entry[lang];
    });
    document.querySelectorAll("button.lang").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    document.documentElement.setAttribute("lang", lang);
    // Re-render dynamic engines that carry their own language-sensitive copy.
    renderQuizQuestion();
    renderScenarioStep();
    renderDailyMinute();

    // Update jump-nav labels in place (built once; just refresh text per language).
    const jumpLinks = document.querySelectorAll(".jump-nav-link");
    jumpLinks.forEach((link) => {
      const target = link.getAttribute("data-target");
      const section = JUMP_SECTIONS.find((s) => s.id === target);
      if (section) link.textContent = t(section.mk, section.en);
    });
  }

  function initLanguageSwitcher() {
    document.querySelectorAll("button.lang").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.getAttribute("data-lang")));
    });
  }

  function t(mk, en) {
    return state.lang === "en" ? en : mk;
  }

  /* Generic download helper used across engines for "export result" buttons. */
  function downloadTextFile(filename, content, mime) {
    const blob = new Blob([content], { type: (mime || "text/plain") + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function toCSVValue(v) {
    const s = String(v == null ? "" : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ------------------------------------------------------------------
     1. WPA Protocol Score — 8 questions, 4 profiles
     ------------------------------------------------------------------ */
  const QUIZ_QUESTIONS = [
    {
      mk: "На официјална вечера, кој треба да седне најблиску до домаќинот?",
      en: "At an official dinner, who should sit closest to the host?",
      options: [
        { mk: "Најблискиот пријател на домаќинот", en: "The host's closest friend", pts: 0 },
        { mk: "Гостинот со највисок ранг", en: "The highest-ranking guest", pts: 3 },
        { mk: "Оној што прв пристигнал", en: "Whoever arrived first", pts: 0 },
        { mk: "Не е важно, се седи слободно", en: "It doesn't matter, seating is free", pts: 0 }
      ]
    },
    {
      mk: "Кога примаш визит-карта во азиски деловен контекст, што правиш прво?",
      en: "When receiving a business card in an Asian business context, what do you do first?",
      options: [
        { mk: "Веднаш ја ставам во џеб", en: "Immediately pocket it", pts: 0 },
        { mk: "Ја разгледувам со внимание пред да ја одложам", en: "Examine it carefully before putting it away", pts: 3 },
        { mk: "Пишувам белешки на неа веднаш", en: "Write notes on it right away", pts: 0 },
        { mk: "Ја враќам назад", en: "Hand it back", pts: 0 }
      ]
    },
    {
      mk: "Кога две знамиња стојат едно до друго на билатерална средба, кој принцип важи?",
      en: "When two flags stand side by side at a bilateral meeting, which principle applies?",
      options: [
        { mk: "Поголемото знаме секогаш оди прво", en: "The larger flag always goes first", pts: 0 },
        { mk: "Домаќинското знаме секогаш е десно (heraldic right)", en: "The host flag is always on the heraldic right", pts: 3 },
        { mk: "Азбучен редослед по земји без исклучок", en: "Strict alphabetical order by country, no exceptions", pts: 1 },
        { mk: "Не постои принцип, произволно е", en: "There is no principle, it's arbitrary", pts: 0 }
      ]
    },
    {
      mk: "Планираш меѓународен настан со мешана верска публика. Што провери прв?",
      en: "You are planning an international event with a mixed religious audience. What do you check first?",
      options: [
        { mk: "Верски пости и празници кои се преклопуваат со датумот", en: "Religious fasts or holidays overlapping the date", pts: 3 },
        { mk: "Само дали има доволно паркинг", en: "Only whether there is enough parking", pts: 0 },
        { mk: "Ништо посебно, менито е универзално", en: "Nothing special, the menu is universal", pts: 0 },
        { mk: "Само боите на украсот", en: "Only the decoration colors", pts: 0 }
      ]
    },
    {
      mk: "Домаќинот доцни неколку минути на сопствен настан. Каков сигнал испраќа тоа?",
      en: "The host is a few minutes late to their own event. What signal does that send?",
      options: [
        { mk: "Никаков, доцнењето е неутрално", en: "None, lateness is neutral", pts: 0 },
        { mk: "Хиерархиска порака дека времето на гостите вреди помалку", en: "A hierarchical message that guests' time matters less", pts: 3 },
        { mk: "Знак на важност на домаќинот", en: "A sign of the host's importance", pts: 0 },
        { mk: "Позитивен знак на леж пристап", en: "A positive sign of a relaxed approach", pts: 0 }
      ]
    },
    {
      mk: "Пред тост на официјална вечера, што треба да се провери со домаќинскиот тим?",
      en: "Before a toast at an official dinner, what should be checked with the host team?",
      options: [
        { mk: "Ништо, тостот е спонтан по дефиниција", en: "Nothing, a toast is spontaneous by definition", pts: 0 },
        { mk: "Дали содржината допира чувствителни политички теми", en: "Whether the content touches sensitive political topics", pts: 3 },
        { mk: "Само времетраењето", en: "Only the duration", pts: 1 },
        { mk: "Само редоследот на чаши", en: "Only the order of glasses", pts: 0 }
      ]
    },
    {
      mk: "На видео-повик со повеќе делегации, што е протоколарно најважно?",
      en: "On a video call with multiple delegations, what matters most protocol-wise?",
      options: [
        { mk: "Квалитетот на интернетот", en: "Internet quality", pts: 0 },
        { mk: "Точниот редослед на прикажани имиња и титули", en: "The correct order of displayed names and titles", pts: 3 },
        { mk: "Позадината на екранот", en: "The screen background", pts: 0 },
        { mk: "Бојата на осветлувањето", en: "The lighting color", pts: 0 }
      ]
    },
    {
      mk: "По протоколарен инцидент, што треба да содржи првата официјална изјава?",
      en: "After a protocol incident, what should the first official statement contain?",
      options: [
        { mk: "Сите детали веднаш, без исклучок", en: "All details at once, without exception", pts: 0 },
        { mk: "Смирувачки тон и само потврдени факти", en: "A calming tone and only confirmed facts", pts: 3 },
        { mk: "Нагаѓања за причината", en: "Speculation about the cause", pts: 0 },
        { mk: "Молчење додека сè не се разјасни", en: "Silence until everything is clarified", pts: 1 }
      ]
    }
  ];

  const QUIZ_PROFILES = [
    { min: 0, max: 6, mk: "Протоколен Новак", en: "Protocol Novice", icon: "🥉", mkDesc: "Вашето патување започнува тука.", enDesc: "Your journey begins here." },
    { min: 7, max: 13, mk: "Дипломатски Апсолвент", en: "Diplomatic Graduate", icon: "🥈", mkDesc: "Добра основа, има простор за раст.", enDesc: "A good foundation, with room to grow." },
    { min: 14, max: 20, mk: "Амбасадорски Експерт", en: "Ambassadorial Expert", icon: "🥇", mkDesc: "Ги знаете правилата.", enDesc: "You know the rules." },
    { min: 21, max: 24, mk: "Протоколен Мајстор", en: "Protocol Master", icon: "💎", mkDesc: "Вие ги пишувате правилата.", enDesc: "You write the rules." }
  ];

  const quiz = { index: 0, answers: [], done: false };

  function renderQuizQuestion() {
    const mount = document.getElementById("quizMount");
    if (!mount) return;
    if (quiz.done) return renderQuizResult();

    const q = QUIZ_QUESTIONS[quiz.index];
    const total = QUIZ_QUESTIONS.length;
    const selected = quiz.answers[quiz.index];

    mount.innerHTML = `
      <div class="quiz-progress" aria-live="polite">${t("Прашање", "Question")} ${quiz.index + 1} / ${total}</div>
      <div class="quiz-question">
        <h4 id="quizQuestionLabel">${t(q.mk, q.en)}</h4>
        <div class="quiz-options" role="radiogroup" aria-labelledby="quizQuestionLabel">
          ${q.options.map((opt, i) => {
            const isCorrect = opt.pts === Math.max(...q.options.map((o) => o.pts));
            const showFeedback = selected !== undefined;
            let cls = "quiz-option" + (selected === i ? " selected" : "");
            if (showFeedback && i === selected) cls += isCorrect ? " correct-answer" : " wrong-answer";
            if (showFeedback && isCorrect && i !== selected) cls += " correct-answer-hint";
            return `<button type="button" class="${cls}" data-opt="${i}" role="radio" aria-checked="${selected === i}">
              ${t(opt.mk, opt.en)}
            </button>`;
          }).join("")}
        </div>
        ${selected !== undefined ? (() => {
          const chosen = q.options[selected];
          const best = q.options.reduce((a, b) => (b.pts > a.pts ? b : a));
          const isBest = chosen.pts === best.pts;
          return `<div class="quiz-feedback ${isBest ? "correct" : "caution"}" aria-live="polite">
            ${isBest
              ? t("✓ Точно.", "✓ Correct.")
              : t(`Појасно: ${best.mk}`, `More precise: ${best.en}`)}
          </div>`;
        })() : ""}
      </div>
      <div class="quiz-nav">
        <button type="button" class="secondary" id="quizPrev" ${quiz.index === 0 ? "disabled" : ""}>${t("Назад", "Back")}</button>
        <button type="button" class="primary" id="quizNext" ${selected === undefined ? "disabled" : ""}>
          ${quiz.index === total - 1 ? t("Прикажи резултат", "Show result") : t("Следно", "Next")}
        </button>
      </div>
    `;

    mount.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        quiz.answers[quiz.index] = parseInt(btn.getAttribute("data-opt"), 10);
        renderQuizQuestion();
      });
    });
    const prevBtn = mount.querySelector("#quizPrev");
    const nextBtn = mount.querySelector("#quizNext");
    if (prevBtn) prevBtn.addEventListener("click", () => { quiz.index = Math.max(0, quiz.index - 1); renderQuizQuestion(); });
    if (nextBtn) nextBtn.addEventListener("click", () => {
      if (quiz.index < total - 1) { quiz.index++; renderQuizQuestion(); }
      else { quiz.done = true; renderQuizResult(); }
    });
  }

  function scoreQuiz() {
    let score = 0;
    quiz.answers.forEach((optIndex, qIndex) => {
      const opt = QUIZ_QUESTIONS[qIndex].options[optIndex];
      if (opt) score += opt.pts;
    });
    return score;
  }

  function profileForScore(score) {
    return QUIZ_PROFILES.find((p) => score >= p.min && score <= p.max) || QUIZ_PROFILES[0];
  }

  const QUIZ_NEXT_STEPS = {
    0: [ // Novice
      { anchor: "#daily-minute", mk: "WPA Daily Protocol Minute — кратки дневни лекции", en: "WPA Daily Protocol Minute — short daily lessons" },
      { anchor: "#risk-meter", mk: "Protocol Risk Meter — препознај ризик пред настан", en: "Protocol Risk Meter — spot risk before an event" }
    ],
    7: [ // Graduate
      { anchor: "#scenario-simulator", mk: "Protocol Scenario Simulator — вежбај реални ситуации", en: "Protocol Scenario Simulator — practice real situations" },
      { anchor: "#precedence-builder", mk: "WPA Precedence Builder — ред на предимство", en: "WPA Precedence Builder — order of precedence" }
    ],
    14: [ // Expert
      { anchor: "#insights-engine", mk: "WPA Insights Engine — структурирана анализа", en: "WPA Insights Engine — structured analysis" },
      { anchor: "#reference-map", mk: "Global Protocol Reference Map — 160 институции", en: "Global Protocol Reference Map — 160 institutions" }
    ],
    21: [ // Master
      { anchor: "#insights-engine", mk: "WPA Insights Engine — за твои анализи", en: "WPA Insights Engine — for your own analyses" },
      { anchor: "#premium-future", mk: "Corporate Diplomatic Seal · Future Gate", en: "Corporate Diplomatic Seal · Future Gate" }
    ]
  };

  function renderQuizResult() {
    const mount = document.getElementById("quizMount");
    if (!mount) return;
    const score = scoreQuiz();
    const maxScore = 24;
    const profile = profileForScore(score);
    const pct = Math.round((score / maxScore) * 100);

    mount.innerHTML = `
      <div class="score-result">
        <div class="score-badge">${profile.icon} ${t(profile.mk, profile.en)}</div>
        <p>${t(profile.mkDesc, profile.enDesc)}</p>
        <div class="score-bar-track"><div class="score-bar-fill" style="width:${pct}%"></div></div>
        <p style="font-size:0.85rem;">${score} / ${maxScore} · ${pct}%</p>
        <div class="next-step-card">
          <p class="next-step-title">${t("Следен чекор за тебе", "Your next step")}</p>
          <div class="next-step-links">
            ${(QUIZ_NEXT_STEPS[profile.min] || []).map((step) => `<a href="${step.anchor}" class="next-step-link">${t(step.mk, step.en)} →</a>`).join("")}
          </div>
        </div>
        <div class="share-box">
          <button type="button" class="secondary" id="quizRetake">${t("Повтори", "Retake")}</button>
          <button type="button" class="primary" id="quizDownload">${t("Преземи резултат (PNG)", "Download result (PNG)")}</button>
          <button type="button" class="secondary" id="quizCopy">${t("Копирај текст", "Copy text")}</button>
          <a class="secondary" id="quizShareLinkedIn" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;">LinkedIn</a>
          <a class="secondary" id="quizShareTwitter" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;">X</a>
        </div>
      </div>
    `;

    const shareText = t(
      `Го поминав WPA Protocol Score и добив: ${profile.icon} ${profile.mk} (${score}/${maxScore}). Провери го твојот на World Protocol Academy.`,
      `I took the WPA Protocol Score and got: ${profile.icon} ${profile.en} (${score}/${maxScore}). Check yours at World Protocol Academy.`
    );
    const shareUrl = "https://worldprotocolacademy-code.github.io/tools/wpa-five-engines.html";

    const copyBtn = mount.querySelector("#quizCopy");
    if (copyBtn) copyBtn.addEventListener("click", () => {
      const fullText = `${shareText}\n${shareUrl}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullText).then(() => {
          copyBtn.textContent = t("Копирано ✓", "Copied ✓");
          setTimeout(() => { copyBtn.textContent = t("Копирај текст", "Copy text"); }, 1800);
        }).catch(() => {
          downloadTextFile("wpa-protocol-score-share.txt", fullText);
        });
      } else {
        downloadTextFile("wpa-protocol-score-share.txt", fullText);
      }
    });

    const liLink = mount.querySelector("#quizShareLinkedIn");
    if (liLink) liLink.href = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(shareUrl);
    const twLink = mount.querySelector("#quizShareTwitter");
    if (twLink) twLink.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText) + "&url=" + encodeURIComponent(shareUrl);
    const retake = mount.querySelector("#quizRetake");
    const download = mount.querySelector("#quizDownload");
    if (retake) retake.addEventListener("click", () => {
      quiz.index = 0; quiz.answers = []; quiz.done = false; renderQuizQuestion();
    });
    if (download) download.addEventListener("click", () => downloadScoreCard(profile, score, maxScore));
  }

  function downloadScoreCard(profile, score, maxScore) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 560;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-2d-context");

    ctx.fillStyle = "#0D1F3C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = "#C9A84C";
    ctx.font = "bold 22px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(t("СВЕТСКА ПРОТОКОЛАРНА АКАДЕМИЈА", "WORLD PROTOCOL ACADEMY"), canvas.width / 2, 90);

    ctx.font = "bold 44px Georgia";
    ctx.fillStyle = "#F5F0E0";
    ctx.fillText(`${profile.icon} ${t(profile.mk, profile.en)}`, canvas.width / 2, 200);

    ctx.font = "20px Georgia";
    ctx.fillStyle = "#ece4cd";
    wrapCanvasText(ctx, t(profile.mkDesc, profile.enDesc), canvas.width / 2, 250, 760, 28);

    ctx.font = "bold 26px Georgia";
    ctx.fillStyle = "#C9A84C";
    ctx.fillText(`${score} / ${maxScore} · ${Math.round((score / maxScore) * 100)}%`, canvas.width / 2, 340);

    ctx.font = "16px Georgia";
    ctx.fillStyle = "#ece4cd";
    ctx.fillText(t("WPA Protocol Score · worldprotocolacademy.org", "WPA Protocol Score · worldprotocolacademy.org"), canvas.width / 2, 500);

    const link = document.createElement("a");
    link.download = "wpa-protocol-score.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    } catch (err) {
      // Fallback for browsers/environments without canvas/2D-context support:
      // still let the person keep their result, as plain text.
      downloadTextFile(
        "wpa-protocol-score.txt",
        `WPA Protocol Score\n${profile.icon} ${t(profile.mk, profile.en)}\n${t(profile.mkDesc, profile.enDesc)}\n${score} / ${maxScore}`
      );
    }
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let curY = y;
    words.forEach((word) => {
      const test = line + word + " ";
      if (ctx.measureText(test).width > maxWidth && line !== "") {
        ctx.fillText(line, x, curY);
        line = word + " ";
        curY += lineHeight;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, x, curY);
  }

  /* ------------------------------------------------------------------
     2. Protocol Scenario Simulator
     ------------------------------------------------------------------ */
  const SCENARIOS = [
    {
      mk: "Вие сте домаќин на билатерална средба. Делегацијата на гостинот пристигнува 10 минути порано.",
      en: "You are hosting a bilateral meeting. The guest delegation arrives 10 minutes early.",
      choices: [
        {
          mk: "Ги пуштам веднаш во салата, иако домаќинот сè уште не е таму",
          en: "I let them into the room immediately, even though the host is not there yet",
          outcome: "caution",
          mkOut: "Ризично: гостите чекаат без домаќин во просторија, што може да создаде непријатна асиметрија.",
          enOut: "Risky: guests wait without the host present, which can create an awkward asymmetry."
        },
        {
          mk: "Ги примам во соседна просторија за кафе додека домаќинот не е подготвен",
          en: "I receive them in an adjoining room for coffee until the host is ready",
          outcome: "correct",
          mkOut: "Точно: гостите се пречекани веднаш, но влегувањето во главната сала се усогласува со подготвеноста на домаќинот.",
          enOut: "Correct: guests are welcomed immediately, but entry to the main room is aligned with the host's readiness."
        },
        {
          mk: "Ги замолувам да почекаат надвор без објаснување",
          en: "I ask them to wait outside without explanation",
          outcome: "caution",
          mkOut: "Ризично: недостаток на објаснување може да се доживее како невнимание.",
          enOut: "Risky: lack of explanation can be perceived as inattentiveness."
        }
      ]
    },
    {
      mk: "На меѓународна конференција добивте подарок пред останатите делегации да ги отворат своите.",
      en: "At an international conference, you receive a gift before other delegations open theirs.",
      choices: [
        {
          mk: "Го отворам веднаш и коментирам гласно за квалитетот",
          en: "I open it immediately and comment loudly on its quality",
          outcome: "caution",
          mkOut: "Ризично: во повеќето протоколарни традиции, подароците се отвораат подоцна, насамо.",
          enOut: "Risky: in most protocol traditions, gifts are opened later, in private."
        },
        {
          mk: "Учтиво заблагодарувам и го одложувам отворањето за подоцна",
          en: "I thank them courteously and set it aside to open later",
          outcome: "correct",
          mkOut: "Точно: одложеното отворање е стандардна и безбедна пракса во меѓународен протокол.",
          enOut: "Correct: delayed opening is a standard and safe practice in international protocol."
        },
        {
          mk: "Го одбивам подарокот пред сите",
          en: "I decline the gift in front of everyone",
          outcome: "caution",
          mkOut: "Ризично: јавно одбивање без причина може да се доживее како навреда.",
          enOut: "Risky: publicly declining without reason can be perceived as an insult."
        }
      ]
    },
    {
      mk: "На потпишување договор, министерот-гостин седи лево наместо десно од домаќинот според планот.",
      en: "At a signing ceremony, the visiting minister is seated to the left instead of the right of the host, contrary to plan.",
      choices: [
        {
          mk: "Го игнорирам, деталот е неважен",
          en: "I ignore it, the detail is unimportant",
          outcome: "caution",
          mkOut: "Ризично: позиционирањето на церемонија на потпишување носи симболично значење и се забележува.",
          enOut: "Risky: positioning at a signing ceremony carries symbolic weight and will be noticed."
        },
        {
          mk: "Дискретно го исправам распоредот пред почетокот на церемонијата",
          en: "I discreetly correct the arrangement before the ceremony begins",
          outcome: "correct",
          mkOut: "Точно: тивка корекција пред почетокот е најдобрата опција — избегнува јавна забелешка.",
          enOut: "Correct: a quiet correction before the start is the best option — it avoids a public remark."
        },
        {
          mk: "Јавно го посочувам проблемот пред гостите",
          en: "I point out the problem publicly in front of guests",
          outcome: "caution",
          mkOut: "Ризично: јавно посочување создава непријатност и за домаќинот и за гостинот.",
          enOut: "Risky: pointing it out publicly creates discomfort for both host and guest."
        }
      ]
    },
    {
      mk: "Добивте визит-карта од партнер во азиски деловен контекст токму додека сте зафатени со телефон.",
      en: "You receive a business card from a partner in an Asian business context while your hands are occupied with a phone.",
      choices: [
        {
          mk: "Ја земам со една рака, продолжувам да пишувам на телефонот",
          en: "I take it with one hand, keep typing on the phone",
          outcome: "caution",
          mkOut: "Ризично: се доживува како невнимание кон идентитетот на партнерот.",
          enOut: "Risky: perceived as inattentiveness toward the partner's identity."
        },
        {
          mk: "Го оставам телефонот, ја земам картата со две раце и ја разгледувам",
          en: "I set the phone aside, take the card with both hands and examine it",
          outcome: "correct",
          mkOut: "Точно: целосно внимание кон размената е стандардна пракса во азиски деловен протокол.",
          enOut: "Correct: full attention to the exchange is standard practice in Asian business protocol."
        },
        {
          mk: "Замолувам партнерот да почека додека завршам со телефонот",
          en: "I ask the partner to wait while I finish with the phone",
          outcome: "caution",
          mkOut: "Ризично: чекањето на партнерот поради телефон се чита како непочит кон рангот.",
          enOut: "Risky: making the partner wait for a phone call reads as disrespect toward rank."
        }
      ]
    },
    {
      mk: "Организирате мултилатерална средба со 15 делегации и треба да одлучите редослед на седење.",
      en: "You are organizing a multilateral meeting with 15 delegations and must decide the seating order.",
      choices: [
        {
          mk: "Седење по стратешка важност на земјата за домаќинот",
          en: "Seating by the country's strategic importance to the host",
          outcome: "caution",
          mkOut: "Ризично: субјективна рангирачка логика може да се толкува како политичка изјава.",
          enOut: "Risky: a subjective ranking logic can be read as a political statement."
        },
        {
          mk: "Азбучен редослед по официјалното име на земјата, договорен однапред",
          en: "Alphabetical order by the country's official name, agreed in advance",
          outcome: "correct",
          mkOut: "Точно: азбучниот принцип е стандардна неутрална практика за мултилатерални средби.",
          enOut: "Correct: alphabetical order is the standard neutral practice for multilateral meetings."
        },
        {
          mk: "Седење по датум на пристигнување на потврдата за учество",
          en: "Seating by the date each delegation confirmed attendance",
          outcome: "caution",
          mkOut: "Ризично: непризнаен принцип кој делегациите нема да го очекуваат или прифатат.",
          enOut: "Risky: an unrecognized principle that delegations will neither expect nor accept."
        }
      ]
    },
    {
      mk: "Веднаш по инцидент на настан (техничка грешка со озвучување за време на говор), новинарите бараат изјава.",
      en: "Immediately after an incident at an event (a technical sound failure during a speech), journalists request a statement.",
      choices: [
        {
          mk: "Веднаш изнесувам целосно објаснување со сите технички детали",
          en: "I immediately give a full explanation with all technical details",
          outcome: "caution",
          mkOut: "Ризично: брзање со детали пред потврда може да создаде контрадикторни изјави подоцна.",
          enOut: "Risky: rushing details before confirmation can create contradictory statements later."
        },
        {
          mk: "Кратка смирувачка изјава, а деталите следат по официјална потврда",
          en: "A brief calming statement, with details to follow after official confirmation",
          outcome: "correct",
          mkOut: "Точно: смирувачки тон плус потврдени факти е стандардниот прв чекор во кризна комуникација.",
          enOut: "Correct: a calming tone plus confirmed facts is the standard first step in crisis communication."
        },
        {
          mk: "Одбивам каков било коментар додека не помине настанот",
          en: "I refuse any comment until the event is over",
          outcome: "caution",
          mkOut: "Ризично: целосно молчење во присуство на новинари може да се толкува како прикривање.",
          enOut: "Risky: total silence in front of journalists can be interpreted as concealment."
        }
      ]
    },
    {
      mk: "На државна посета, домаќинот планира менито без да провери верски рестрикции на гостинската делегација.",
      en: "At a state visit, the host plans the menu without checking the guest delegation's religious dietary restrictions.",
      choices: [
        {
          mk: "Продолжувам со стандардното мени, ќе се снајдат гостите",
          en: "I proceed with the standard menu, the guests will manage",
          outcome: "caution",
          mkOut: "Ризично: игнорирање верски рестрикции директно нанесува штета на домаќинскиот кредибилитет.",
          enOut: "Risky: ignoring religious restrictions directly damages the host's credibility."
        },
        {
          mk: "Контактирам со протоколарниот тим на гостинот однапред за верски и диететски барања",
          en: "I contact the guest's protocol team in advance about religious and dietary requirements",
          outcome: "correct",
          mkOut: "Точно: проверката однапред е стандардна и очекувана протоколарна пракса.",
          enOut: "Correct: checking in advance is standard and expected protocol practice."
        },
        {
          mk: "Додавам алтернативно јадење во последен момент без консултација",
          en: "I add an alternative dish at the last minute without consultation",
          outcome: "caution",
          mkOut: "Ризично: импровизацијата во последен момент носи ризик од нов пропуст.",
          enOut: "Risky: last-minute improvisation carries the risk of a new oversight."
        }
      ]
    }
  ];

  const scenario = { index: 0, chosen: null };

  function renderScenarioStep() {
    const mount = document.getElementById("scenarioMount");
    if (!mount) return;
    const s = SCENARIOS[scenario.index];
    const isLast = scenario.index === SCENARIOS.length - 1;

    mount.innerHTML = `
      <div class="scenario-context">${t("Сценарио", "Scenario")} ${scenario.index + 1} / ${SCENARIOS.length}</div>
      <div class="scenario-step">
        <h4>${t(s.mk, s.en)}</h4>
        <div class="scenario-choices" role="group" aria-label="${t("Избори", "Choices")}">
          ${s.choices.map((c, i) => `<button type="button" class="quiz-option" data-choice="${i}">${t(c.mk, c.en)}</button>`).join("")}
        </div>
        <div id="scenarioOutcome"></div>
      </div>
    `;

    mount.querySelectorAll("[data-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = s.choices[parseInt(btn.getAttribute("data-choice"), 10)];
        const outcomeEl = mount.querySelector("#scenarioOutcome");
        outcomeEl.innerHTML = `
          <div class="scenario-outcome ${choice.outcome}">${t(choice.mkOut, choice.enOut)}</div>
          <div class="quiz-nav">
            <span></span>
            <button type="button" class="primary" id="scenarioNext">${isLast ? t("Почни одново", "Restart") : t("Следно сценарио", "Next scenario")}</button>
          </div>
        `;
        outcomeEl.querySelector("#scenarioNext").addEventListener("click", () => {
          scenario.index = isLast ? 0 : scenario.index + 1;
          renderScenarioStep();
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     3. Protocol Risk Meter
     ------------------------------------------------------------------ */
  function initRiskMeter() {
    const mount = document.getElementById("riskMount");
    if (!mount) return;

    mount.innerHTML = `
      <div class="risk-form">
        <label>${t("Ниво на настанот", "Event level")}
          <select id="riskLevel">
            <option value="1">${t("Внатрешен / деловен", "Internal / business")}</option>
            <option value="2">${t("Национален / институционален", "National / institutional")}</option>
            <option value="3">${t("Меѓународен / државен", "International / state-level")}</option>
          </select>
        </label>
        <label>${t("Број на вклучени земји/делегации", "Number of countries/delegations involved")}
          <select id="riskDelegations">
            <option value="1">1</option>
            <option value="2">2–4</option>
            <option value="3">5+</option>
          </select>
        </label>
        <label>${t("Присуство на медиуми", "Media presence")}
          <select id="riskMedia">
            <option value="1">${t("Нема", "None")}</option>
            <option value="2">${t("Ограничени", "Limited")}</option>
            <option value="3">${t("Целосно покривање", "Full coverage")}</option>
          </select>
        </label>
        <label>${t("Времето за подготовка", "Preparation time")}
          <select id="riskPrep">
            <option value="3">${t("Помалку од 48 часа", "Less than 48 hours")}</option>
            <option value="2">${t("1–2 недели", "1–2 weeks")}</option>
            <option value="1">${t("Повеќе од месец", "More than a month")}</option>
          </select>
        </label>
        <p style="font-size:0.78rem;color:var(--wpa-gold-soft);margin:0;">${t("Резултатот се ажурира автоматски.", "The result updates automatically.")}</p>
        <div id="riskReadout"></div>
      </div>
    `;

    const levelEl = mount.querySelector("#riskLevel");
    const delegEl = mount.querySelector("#riskDelegations");
    const mediaEl = mount.querySelector("#riskMedia");
    const prepEl = mount.querySelector("#riskPrep");
    const readout = mount.querySelector("#riskReadout");

    function calc() {
      const level = parseInt(levelEl.value, 10);
      const deleg = parseInt(delegEl.value, 10);
      const media = parseInt(mediaEl.value, 10);
      const prep = parseInt(prepEl.value, 10);
      const total = level + deleg + media + prep;

      let band, label, advice;
      if (total <= 6) {
        band = "low"; label = t("ЕДУКАТИВЕН СТАТУС: СТАНДАРДНА ПОДГОТВЕНОСТ", "EDUCATIONAL STATUS: STANDARD READINESS");
        advice = t("Основната подготовка може да биде доволна, но задолжително проверете ги клучните протоколарни чекори според конкретниот контекст.", "Basic preparation may be sufficient, but always verify the key protocol steps according to the specific context.");
      } else if (total <= 9) {
        band = "medium"; label = t("ЕДУКАТИВЕН СТАТУС: ЗАСИЛЕНА ПОДГОТВЕНОСТ", "EDUCATIONAL STATUS: ENHANCED READINESS");
        advice = t("Препорачлива е дополнителна протоколарна проверка и репетиција на клучните моменти.", "An additional protocol review and rehearsal of key moments is advisable.");
      } else {
        band = "high"; label = t("ЕДУКАТИВЕН СТАТУС: КОМПЛЕКСНА ПОДГОТВЕНОСТ", "EDUCATIONAL STATUS: COMPLEX READINESS");
        advice = t("Потребна е целосна протоколарна репетиција, резервен план и назначено лице за координација во реално време.", "A full protocol rehearsal, a contingency plan, and a designated real-time coordination point are needed.");
      }

      readout.innerHTML = `
        <div class="risk-readout ${band}">${label}</div>
        <p style="margin-top:0.8rem;font-size:0.88rem;">${advice}</p>
        <p class="not-this-note" style="margin-top:0.8rem;">${t("Ова е едукативна проценка, не официјален протоколарен или безбедносен сертификат.", "This is an educational assessment, not an official protocol or security certificate.")}</p>
        <button type="button" class="secondary" id="riskExport" style="margin-top:0.8rem;">${t("Преземи резултат (TXT)", "Download result (TXT)")}</button>
      `;

      readout.querySelector("#riskExport").addEventListener("click", () => {
        const lines = [
          "WPA Protocol Risk Meter — " + new Date().toISOString().slice(0, 10),
          "",
          t("Ниво на настанот", "Event level") + ": " + levelEl.selectedOptions[0].textContent,
          t("Делегации", "Delegations") + ": " + delegEl.selectedOptions[0].textContent,
          t("Присуство на медиуми", "Media presence") + ": " + mediaEl.selectedOptions[0].textContent,
          t("Времето за подготовка", "Preparation time") + ": " + prepEl.selectedOptions[0].textContent,
          "",
          label,
          advice,
          "",
          t("Ова е едукативна проценка, не официјален протоколарен или безбедносен сертификат.", "This is an educational assessment, not an official protocol or security certificate.")
        ];
        downloadTextFile("wpa-risk-meter-result.txt", lines.join("\n"));
      });
    }

    [levelEl, delegEl, mediaEl, prepEl].forEach((el) => el.addEventListener("change", calc));
    calc();
  }

  /* ------------------------------------------------------------------
     4. Global Protocol Reference Map — WPA Master List REV2 (160 records)
     ------------------------------------------------------------------ */
  let institutionsData = [];
  let mapActiveContinent = "";

  const GROUP_LABELS = {
    A: { mk: "A · Протоколарни академии и училишта", en: "A · Protocol academies & schools" },
    B: { mk: "B · Независни think tank-ови", en: "B · Independent think tanks" },
    C: { mk: "C · Тренинг центри на организации", en: "C · Organization-affiliated training centers" },
    D: { mk: "D · Универзитетски програми", en: "D · University programmes" },
    G: { mk: "G · УН агенции и тела", en: "G · UN agencies & bodies" },
    H: { mk: "H · НВО, судови и меѓ. тела", en: "H · NGOs, courts & international bodies" },
    I: { mk: "I · Финансиски институции", en: "I · Financial institutions" },
    R: { mk: "R · WPA (внатрешен запис)", en: "R · WPA (internal record)" }
  };

  function initReferenceMap() {
    const mount = document.getElementById("mapMount");
    if (!mount) return;

    mount.innerHTML = `<p>${t("Се вчитува...", "Loading...")}</p>`;

    fetch("data/institutions-master-rev2.json")
      .then((r) => r.json())
      .then((json) => {
        institutionsData = json.institutions || [];
        renderReferenceMap(mount, json);
      })
      .catch(() => {
        mount.innerHTML = `<p>${t("Податоците не можеа да се вчитаат. Провери дали data/institutions-master-rev2.json е поставен на истата патека.", "Data could not be loaded. Check that data/institutions-master-rev2.json is deployed at the matching path.")}</p>`;
      });
  }

  function renderReferenceMap(mount, json) {
    const continents = [...new Set(institutionsData.map((i) => i.continent))].sort();
    const groups = [...new Set(institutionsData.map((i) => i.group))].sort();
    const continentCounts = {};
    institutionsData.forEach((i) => { continentCounts[i.continent] = (continentCounts[i.continent] || 0) + 1; });

    // Read initial filter state from URL query params, e.g. ?continent=Europe&group=A&q=diplomacy
    const initialParams = new URLSearchParams(window.location.search);
    if (initialParams.has("continent")) mapActiveContinent = initialParams.get("continent");
    const initialGroup = initialParams.get("group") || "";
    const initialSearch = initialParams.get("q") || "";

    mount.innerHTML = `
      <p class="map-note">${json.version} · ${json.total_records} ${t("записи", "records")} · ${json.unique_external_institutions} ${t("дистинктни институции", "distinct institutions")} · ${t("статус", "status")}: ${json.dataset_status}</p>
      <div class="map-continent-grid" id="mapContinentGrid">
        ${continents.map((c) => `<button type="button" class="map-continent-card${mapActiveContinent === c ? " active" : ""}" data-continent="${c}"><span class="map-continent-count">${continentCounts[c]}</span><span class="map-continent-name">${c}</span></button>`).join("")}
        <button type="button" class="map-continent-card${mapActiveContinent === "" ? " active" : ""}" data-continent=""><span class="map-continent-count">${institutionsData.length}</span><span class="map-continent-name">${t("Сите", "All")}</span></button>
      </div>
      <div class="map-filters">
        <input type="search" id="mapSearch" placeholder="${t("Пребарај институција или земја...", "Search institution or country...")}" value="${initialSearch.replace(/"/g, "&quot;")}" />
        <select id="mapGroup"><option value="">${t("Сите групи", "All groups")}</option>${groups.map((g) => `<option value="${g}"${g === initialGroup ? " selected" : ""}>${t(GROUP_LABELS[g] ? GROUP_LABELS[g].mk : g, GROUP_LABELS[g] ? GROUP_LABELS[g].en : g)}</option>`).join("")}</select>
        <button type="button" class="secondary" id="mapExport">${t("Преземи филтрирано (CSV)", "Download filtered (CSV)")}</button>
        <button type="button" class="secondary" id="mapCopyLink">${t("Копирај линк од филтерот", "Copy filter link")}</button>
      </div>
      <div class="map-table-wrap">
        <table class="map-table">
          <thead><tr><th>ID</th><th>${t("Институција", "Institution")}</th><th>${t("Земја", "Country")}</th><th>${t("Група", "Group")}</th><th>${t("Тип", "Type")}</th></tr></thead>
          <tbody id="mapTbody"></tbody>
        </table>
      </div>
      <p class="map-note">${t("Записите A005, A010 и B008 се пријавени соработнички/филијални набљудувања, не потврдени независни институции. Верификацијата на изворите останува во тек за целиот сет.", "Records A005, A010 and B008 are reported cooperation-model / affiliated-branch observations, not verified independent institutions. Source verification remains pending across the full set.")}</p>
    `;

    const tbody = mount.querySelector("#mapTbody");
    const searchEl = mount.querySelector("#mapSearch");
    const groupEl = mount.querySelector("#mapGroup");
    const grid = mount.querySelector("#mapContinentGrid");
    const exportBtn = mount.querySelector("#mapExport");
    const copyLinkBtn = mount.querySelector("#mapCopyLink");
    let currentRows = [];

    function updateURLState() {
      const params = new URLSearchParams();
      if (mapActiveContinent) params.set("continent", mapActiveContinent);
      if (groupEl.value) params.set("group", groupEl.value);
      if (searchEl.value.trim()) params.set("q", searchEl.value.trim());
      const qs = params.toString();
      const newUrl = window.location.pathname + (qs ? "?" + qs : "") + "#reference-map";
      window.history.replaceState(null, "", newUrl);
    }

    function draw() {
      const q = searchEl.value.trim().toLowerCase();
      const group = groupEl.value;
      const rows = institutionsData.filter((i) => {
        return (!q || i.name.toLowerCase().includes(q) || i.country.toLowerCase().includes(q))
          && (!mapActiveContinent || i.continent === mapActiveContinent)
          && (!group || i.group === group);
      });
      currentRows = rows;
      tbody.innerHTML = rows.slice(0, 400).map((i) => `
        <tr><td>${i.id}</td><td>${i.name}${i.type.indexOf("Reported") > -1 ? " ⚠️" : ""}</td><td>${i.country}</td><td>${i.group}</td><td>${i.type}</td></tr>
      `).join("") || `<tr><td colspan="5">${t("Нема резултати.", "No results.")}</td></tr>`;
      updateURLState();
    }

    exportBtn.addEventListener("click", () => {
      const header = ["id", "name", "country", "continent", "group", "type"].map(toCSVValue).join(",");
      const csvRows = currentRows.map((r) => [r.id, r.name, r.country, r.continent, r.group, r.type].map(toCSVValue).join(","));
      downloadTextFile("wpa-reference-map-filtered.csv", [header, ...csvRows].join("\n"), "text/csv");
    });

    copyLinkBtn.addEventListener("click", () => {
      const fullUrl = window.location.href;
      const doFallback = () => downloadTextFile("wpa-reference-map-link.txt", fullUrl);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullUrl).then(() => {
          copyLinkBtn.textContent = t("Копирано ✓", "Copied ✓");
          setTimeout(() => { copyLinkBtn.textContent = t("Копирај линк од филтерот", "Copy filter link"); }, 1800);
        }).catch(doFallback);
      } else {
        doFallback();
      }
    });

    grid.querySelectorAll(".map-continent-card").forEach((card) => {
      card.addEventListener("click", () => {
        mapActiveContinent = card.getAttribute("data-continent");
        grid.querySelectorAll(".map-continent-card").forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        draw();
      });
    });

    [searchEl].forEach((el) => el.addEventListener("input", debounce(draw, 200)));
    groupEl.addEventListener("input", draw);
    draw();
  }

  /* ------------------------------------------------------------------
     5. WPA Precedence Builder
     ------------------------------------------------------------------ */
  const PRECEDENCE_RANKS = [
    { key: "head_of_state", mk: "Шеф на држава", en: "Head of State", weight: 1 },
    { key: "head_of_government", mk: "Шеф на влада", en: "Head of Government", weight: 2 },
    { key: "deputy_pm", mk: "Заменик-претседател на влада", en: "Deputy Prime Minister", weight: 3 },
    { key: "minister", mk: "Министер", en: "Minister", weight: 4 },
    { key: "ambassador", mk: "Амбасадор", en: "Ambassador", weight: 5 },
    { key: "deputy_minister", mk: "Заменик-министер", en: "Deputy Minister", weight: 6 },
    { key: "director_general", mk: "Генерален директор / секретар", en: "Director-General / Secretary", weight: 7 },
    { key: "other_official", mk: "Друг официјален претставник", en: "Other official representative", weight: 8 }
  ];

  let precedenceEntries = [];

  function initPrecedenceBuilder() {
    const mount = document.getElementById("precedenceMount");
    if (!mount) return;
    renderPrecedenceBuilder();
  }

  function renderPrecedenceBuilder() {
    const mount = document.getElementById("precedenceMount");
    if (!mount) return;

    mount.innerHTML = `
      <div class="precedence-row">
        <input type="text" id="precName" placeholder="${t("Име и функција", "Name and function")}" />
        <select id="precRank">
          ${PRECEDENCE_RANKS.map((r) => `<option value="${r.key}">${t(r.mk, r.en)}</option>`).join("")}
        </select>
        <button type="button" class="secondary" id="precAdd">${t("Додади", "Add")}</button>
      </div>
      <p style="font-size:0.8rem;color:var(--wpa-gold-soft);margin:0.4rem 0 0.8rem;">
        ${t("Ова е основна логика, не заменува протоколарна проверка на терен за конкретен настан.", "This is a baseline logic, not a substitute for on-the-ground protocol verification for a specific event.")}
      </p>
      <ol class="precedence-list" id="precList"></ol>
      <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
        ${precedenceEntries.length ? `<button type="button" class="secondary" id="precClear">${t("Исчисти листа", "Clear list")}</button>` : ""}
        ${precedenceEntries.length ? `<button type="button" class="secondary" id="precExport">${t("Преземи листа (TXT)", "Download list (TXT)")}</button>` : ""}
      </div>
    `;

    const exportBtn = mount.querySelector("#precExport");
    if (exportBtn) exportBtn.addEventListener("click", () => {
      const lines = [
        "WPA Precedence Builder — " + new Date().toISOString().slice(0, 10),
        t("Ова е основна логика, не заменува протоколарна проверка на терен.", "This is a baseline logic, not a substitute for on-the-ground protocol verification."),
        "",
        ...precedenceEntries.map((e, i) => `${i + 1}. ${e.name} — ${t(e.rank.mk, e.rank.en)}`)
      ];
      downloadTextFile("wpa-precedence-order.txt", lines.join("\n"));
    });

    mount.querySelector("#precAdd").addEventListener("click", () => {
      const nameEl = mount.querySelector("#precName");
      const rankEl = mount.querySelector("#precRank");
      const name = nameEl.value.trim();
      if (!name) return;
      const rank = PRECEDENCE_RANKS.find((r) => r.key === rankEl.value);
      precedenceEntries.push({ name, rank });
      precedenceEntries.sort((a, b) => a.rank.weight - b.rank.weight);
      renderPrecedenceBuilder();
    });

    const clearBtn = mount.querySelector("#precClear");
    if (clearBtn) clearBtn.addEventListener("click", () => { precedenceEntries = []; renderPrecedenceBuilder(); });

    const list = mount.querySelector("#precList");
    list.innerHTML = precedenceEntries.map((e) => `<li>${e.name} <span class="rank-tag">${t(e.rank.mk, e.rank.en)}</span></li>`).join("");
  }

  /* ------------------------------------------------------------------
     6. Flag & Symbol Check Tool
     ------------------------------------------------------------------ */
  const FLAG_CHECKLIST = [
    { mk: "Домаќинското знаме е поставено на heraldic right (лево од гледачот кон подиумот).", en: "The host flag is placed on the heraldic right (viewer's left facing the podium)." },
    { mk: "Сите знамиња се со идентична големина, доколку протоколот не бара поинаку.", en: "All flags are of identical size, unless protocol specifically requires otherwise." },
    { mk: "Знамињата се чисти, испеглани и без оштетувања.", en: "Flags are clean, unwrinkled, and undamaged." },
    { mk: "Редоследот на повеќе знамиња следи договорен принцип (азбучен, ротирачки или ранг).", en: "Multi-flag order follows an agreed principle (alphabetical, rotating, or rank-based)." },
    { mk: "Амблемите и грбовите се точни и ажурирани верзии.", en: "Emblems and coats of arms are accurate, up-to-date versions." },
    { mk: "Химната на гостинската држава е проверена во точна и официјална верзија.", en: "The guest state's anthem has been verified in the correct, official version." },
    { mk: "Редоследот на изведба на химни е договорен однапред со двете страни.", en: "The order of anthem performance is agreed in advance by both sides." },
    { mk: "Сите визуелни материјали (банери, беџеви) се проверени за точност на имиња и титули.", en: "All visual materials (banners, badges) are checked for accuracy of names and titles." }
  ];

  function initFlagCheck() {
    const mount = document.getElementById("flagMount");
    if (!mount) return;

    mount.innerHTML = `
      <div class="flag-checklist">
        ${FLAG_CHECKLIST.map((item, i) => `
          <label><input type="checkbox" data-flag="${i}" /> <span>${t(item.mk, item.en)}</span></label>
        `).join("")}
      </div>
      <div class="flag-summary" id="flagSummary"></div>
      <button type="button" class="secondary" id="flagExport" style="margin-top:0.8rem;">${t("Преземи контролна листа (TXT)", "Download checklist (TXT)")}</button>
    `;

    mount.querySelector("#flagExport").addEventListener("click", () => {
      const boxes = mount.querySelectorAll("input[data-flag]");
      const lines = [
        "WPA Flag & Symbol Check — " + new Date().toISOString().slice(0, 10),
        ""
      ];
      boxes.forEach((cb, i) => {
        const mark = cb.checked ? "[x]" : "[ ]";
        lines.push(`${mark} ${t(FLAG_CHECKLIST[i].mk, FLAG_CHECKLIST[i].en)}`);
      });
      downloadTextFile("wpa-flag-symbol-check.txt", lines.join("\n"));
    });

    function updateSummary() {
      const checked = mount.querySelectorAll("input[data-flag]:checked").length;
      mount.querySelector("#flagSummary").textContent = `${checked} / ${FLAG_CHECKLIST.length} ${t("проверено", "verified")}`;
    }
    mount.querySelectorAll("input[data-flag]").forEach((cb) => cb.addEventListener("change", updateSummary));
    updateSummary();
  }

  /* ------------------------------------------------------------------
     7. WPA Daily Protocol Minute
     ------------------------------------------------------------------ */
  let dailyData = null;
  let dailyIndex = 0;

  function initDailyMinute() {
    const mount = document.getElementById("dailyMount");
    if (!mount) return;
    mount.innerHTML = `<p>${t("Се вчитува...", "Loading...")}</p>`;

    fetch("data/daily-protocol-minute-30-days.json")
      .then((r) => r.json())
      .then((json) => {
        dailyData = json;
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        dailyIndex = dayOfYear % json.days.length;
        renderDailyMinute();
      })
      .catch(() => {
        mount.innerHTML = `<p>${t("Содржината не можеше да се вчита. Провери дали data/daily-protocol-minute-30-days.json е поставен на истата патека.", "Content could not be loaded. Check that data/daily-protocol-minute-30-days.json is deployed at the matching path.")}</p>`;
      });
  }

  function icsEscape(text) {
    return String(text).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  function buildDailyMinuteICS(data) {
    const now = new Date();
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//World Protocol Academy//WPA Daily Protocol Minute//EN",
      "CALSCALE:GREGORIAN"
    ];

    data.days.forEach((entry, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() + i);
      const dateStamp = day.toISOString().slice(0, 10).replace(/-/g, "");
      const summary = t(`WPA Daily Protocol Minute — ${entry.theme.mk}`, `WPA Daily Protocol Minute — ${entry.theme.en}`);
      const desc = [
        t(entry.golden_thought.mk, entry.golden_thought.en),
        "",
        t(entry.mistake_pattern.mk, entry.mistake_pattern.en)
      ].join("\\n");

      lines.push(
        "BEGIN:VEVENT",
        `UID:wpa-daily-minute-day-${entry.day}-${dateStamp}@worldprotocolacademy`,
        `DTSTAMP:${dateStamp}T080000Z`,
        `DTSTART;VALUE=DATE:${dateStamp}`,
        `SUMMARY:${icsEscape(summary)}`,
        `DESCRIPTION:${icsEscape(desc)}`,
        "END:VEVENT"
      );
    });

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  function renderDailyMinute() {
    const mount = document.getElementById("dailyMount");
    if (!mount || !dailyData) return;
    const entry = dailyData.days[dailyIndex];

    mount.innerHTML = `
      <div class="daily-card">
        <div class="daily-day">${t("Ден", "Day")} ${entry.day} / ${dailyData.days.length} · ${t(entry.theme.mk, entry.theme.en)}</div>
        <p class="daily-body"><strong>🌅 ${t("Златна протоколна мисла", "Golden protocol thought")}:</strong> ${t(entry.golden_thought.mk, entry.golden_thought.en)}</p>
        <p class="daily-body"><strong>⚠️ ${t("Чест шаблон на грешка", "Common failure pattern")}:</strong> ${t(entry.mistake_pattern.mk, entry.mistake_pattern.en)}</p>
        <p style="font-size:0.78rem;color:var(--wpa-gold-soft);">${entry.mistake_pattern.note}</p>
        <p class="daily-body">${t(entry.cta.mk, entry.cta.en)}</p>
      </div>
      <div class="daily-nav">
        <button type="button" class="secondary" id="dailyPrev">${t("← Претходен", "← Previous")}</button>
        <button type="button" class="secondary" id="dailyExport">${t("Преземи (TXT)", "Download (TXT)")}</button>
        <button type="button" class="secondary" id="dailyNext">${t("Следен →", "Next →")}</button>
      </div>
      <button type="button" class="secondary" id="dailyCalendarSync" style="margin-top:0.8rem;">${t("📅 Додади 30 дена во календар (.ics)", "📅 Add 30 days to calendar (.ics)")}</button>
    `;

    mount.querySelector("#dailyCalendarSync").addEventListener("click", () => {
      downloadTextFile("wpa-daily-protocol-minute.ics", buildDailyMinuteICS(dailyData), "text/calendar");
    });

    mount.querySelector("#dailyExport").addEventListener("click", () => {
      const lines = [
        `WPA Daily Protocol Minute — ${t("Ден", "Day")} ${entry.day}/${dailyData.days.length} — ${t(entry.theme.mk, entry.theme.en)}`,
        "",
        `🌅 ${t(entry.golden_thought.mk, entry.golden_thought.en)}`,
        "",
        `⚠️ ${t(entry.mistake_pattern.mk, entry.mistake_pattern.en)}`,
        entry.mistake_pattern.note,
        "",
        t(entry.cta.mk, entry.cta.en)
      ];
      downloadTextFile(`wpa-daily-minute-day-${entry.day}.txt`, lines.join("\n"));
    });

    mount.querySelector("#dailyPrev").addEventListener("click", () => {
      dailyIndex = (dailyIndex - 1 + dailyData.days.length) % dailyData.days.length;
      renderDailyMinute();
    });
    mount.querySelector("#dailyNext").addEventListener("click", () => {
      dailyIndex = (dailyIndex + 1) % dailyData.days.length;
      renderDailyMinute();
    });
  }

  /* ------------------------------------------------------------------
     8. WPA Insights Engine — factual-taxonomy analysis template
     ------------------------------------------------------------------ */
  function initInsightsEngine() {
    const mount = document.getElementById("insightsMount");
    if (!mount) return;

    mount.innerHTML = `
      <div class="insight-form">
        <div>
          <span class="insight-tag verified">VERIFIED</span>
          <span class="insight-tag reported">WIDELY REPORTED</span>
          <span class="insight-tag observation">VISUAL OBSERVATION</span>
          <span class="insight-tag interpretation">ANALYTICAL INTERPRETATION</span>
        </div>
        <label style="font-size:0.85rem;color:var(--wpa-parchment-dim);display:block;margin-bottom:0.3rem;">${t("Настан / контекст", "Event / context")}</label>
        <textarea id="insightContext" rows="2" placeholder="${t("пр. Билатерална средба, Женева, јуни 2026", "e.g. Bilateral meeting, Geneva, June 2026")}"></textarea>
        <label style="font-size:0.85rem;color:var(--wpa-parchment-dim);display:block;margin-bottom:0.3rem;">${t("Потврден факт (VERIFIED)", "Confirmed fact (VERIFIED)")}</label>
        <textarea id="insightVerified" rows="2"></textarea>
        <label style="font-size:0.85rem;color:var(--wpa-parchment-dim);display:block;margin-bottom:0.3rem;">${t("Пренесено, но непотврдено (WIDELY REPORTED)", "Reported but unconfirmed (WIDELY REPORTED)")}</label>
        <textarea id="insightReported" rows="2"></textarea>
        <label style="font-size:0.85rem;color:var(--wpa-parchment-dim);display:block;margin-bottom:0.3rem;">${t("Визуелно набљудување (VISUAL OBSERVATION)", "Visual observation (VISUAL OBSERVATION)")}</label>
        <textarea id="insightVisual" rows="2"></textarea>
        <label style="font-size:0.85rem;color:var(--wpa-parchment-dim);display:block;margin-bottom:0.3rem;">${t("Аналитичка интерпретација на WPA (ANALYTICAL INTERPRETATION)", "WPA analytical interpretation (ANALYTICAL INTERPRETATION)")}</label>
        <textarea id="insightInterp" rows="3"></textarea>
        <button type="button" class="primary" id="insightBuild">${t("Генерирај структуриран текст", "Generate structured text")}</button>
        <div id="insightOut"></div>
      </div>
    `;

    mount.querySelector("#insightBuild").addEventListener("click", () => {
      const ctx = mount.querySelector("#insightContext").value.trim();
      const v = mount.querySelector("#insightVerified").value.trim();
      const r = mount.querySelector("#insightReported").value.trim();
      const vis = mount.querySelector("#insightVisual").value.trim();
      const interp = mount.querySelector("#insightInterp").value.trim();

      const lines = [];
      if (ctx) lines.push(`${t("Контекст", "Context")}: ${ctx}`);
      if (v) lines.push(`[VERIFIED] ${v}`);
      if (r) lines.push(`[WIDELY REPORTED] ${r}`);
      if (vis) lines.push(`[VISUAL OBSERVATION] ${vis}`);
      if (interp) lines.push(`[ANALYTICAL INTERPRETATION — WPA] ${interp}`);

      const out = mount.querySelector("#insightOut");
      out.className = "insight-output";
      const finalText = lines.length
        ? lines.join("\n\n")
        : t("Пополни барем едно поле пред генерирање.", "Fill in at least one field before generating.");
      out.textContent = finalText;

      let exportBtn = mount.querySelector("#insightExport");
      let copyBtn = mount.querySelector("#insightCopy");
      if (lines.length) {
        if (!exportBtn) {
          exportBtn = document.createElement("button");
          exportBtn.type = "button";
          exportBtn.className = "secondary";
          exportBtn.id = "insightExport";
          exportBtn.style.marginTop = "0.6rem";
          exportBtn.style.marginRight = "0.5rem";
          out.insertAdjacentElement("afterend", exportBtn);
        }
        if (!copyBtn) {
          copyBtn = document.createElement("button");
          copyBtn.type = "button";
          copyBtn.className = "secondary";
          copyBtn.id = "insightCopy";
          copyBtn.style.marginTop = "0.6rem";
          exportBtn.insertAdjacentElement("afterend", copyBtn);
        }
        exportBtn.textContent = t("Преземи (TXT)", "Download (TXT)");
        exportBtn.onclick = () => downloadTextFile("wpa-insights-analysis.txt", finalText);
        copyBtn.textContent = t("Копирај", "Copy");
        copyBtn.onclick = () => {
          const doCopyFallback = () => downloadTextFile("wpa-insights-analysis.txt", finalText);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(finalText).then(() => {
              copyBtn.textContent = t("Копирано ✓", "Copied ✓");
              setTimeout(() => { copyBtn.textContent = t("Копирај", "Copy"); }, 1800);
            }).catch(doCopyFallback);
          } else {
            doCopyFallback();
          }
        };
      } else {
        if (exportBtn) exportBtn.remove();
        if (copyBtn) copyBtn.remove();
      }
    });
  }

  /* ------------------------------------------------------------------
     9. Readiness Review form → mailto:
     ------------------------------------------------------------------ */
  function initReadinessReview() {
    const form = document.getElementById("reviewForm");
    if (!form) return;
    const resultBox = document.getElementById("reviewResult");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const org = (data.get("org") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const eventType = (data.get("eventType") || "").toString().trim();
      const note = (data.get("note") || "").toString().trim();

      const subject = `WPA Protocol Readiness Review — ${org || name}`;
      const bodyLines = [
        `Name: ${name}`,
        `Organization: ${org}`,
        `Email: ${email}`,
        `Event type: ${eventType}`,
        `Description: ${note}`,
        "",
        "This is a voluntary request for an educational / advisory protocol review.",
        "It does not constitute an official institutional assessment."
      ];
      const mailto = `mailto:worldprotocolacademy@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

      resultBox.hidden = false;
      resultBox.innerHTML = `
        <p>${t("Твојата порака е подготвена. Кликни за да ја отвориш во твојот е-пошта клиент:", "Your message is ready. Click to open it in your email client:")}</p>
        <p><a class="primary" href="${mailto}" style="text-decoration:none;display:inline-block;">${t("Отвори е-пошта", "Open email")}</a></p>
      `;
    });
  }

  /* ------------------------------------------------------------------
     10. Corporate Seal Waitlist — mailto-based, no backend, no payment
     ------------------------------------------------------------------ */
  function initWaitlist() {
    const mount = document.getElementById("waitlistMount");
    if (!mount) return;

    mount.innerHTML = `
      <h3 style="margin-top:0;">${t("Пријави се за известување", "Get notified")}</h3>
      <p style="font-size:0.88rem;">${t(
        "Оваа секција сè уште не наплаќа и не издава сертификати. Остави е-пошта и ќе бидеш известен кога Corporate Diplomatic Seal ќе биде официјално активиран — по правна регистрација.",
        "This section does not yet charge or issue certificates. Leave your email and you'll be notified once the Corporate Diplomatic Seal is officially activated — after legal registration."
      )}</p>
      <form id="waitlistForm" class="smart-form">
        <label class="wide"><span>${t("Е-пошта", "Email")}</span><input type="email" name="waitlistEmail" required /></label>
        <label class="wide"><span>${t("Организација (опционално)", "Organization (optional)")}</span><input type="text" name="waitlistOrg" /></label>
        <button type="submit" class="primary">${t("Пријави се", "Notify me")}</button>
      </form>
      <div id="waitlistResult" class="result-card" hidden></div>
    `;

    const form = mount.querySelector("#waitlistForm");
    const resultBox = mount.querySelector("#waitlistResult");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const email = (data.get("waitlistEmail") || "").toString().trim();
      const org = (data.get("waitlistOrg") || "").toString().trim();

      const subject = "WPA Corporate Diplomatic Seal — Waitlist";
      const bodyLines = [
        `Email: ${email}`,
        `Organization: ${org || "—"}`,
        "",
        "Please notify me when the Corporate Diplomatic Seal is officially activated."
      ];
      const mailto = `mailto:worldprotocolacademy@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

      resultBox.hidden = false;
      resultBox.innerHTML = `
        <p>${t("Твојата пријава е подготвена. Кликни за да ја испратиш:", "Your signup is ready. Click to send it:")}</p>
        <p><a class="primary" href="${mailto}" style="text-decoration:none;display:inline-block;">${t("Испрати пријава", "Send signup")}</a></p>
      `;
    });
  }

  /* ------------------------------------------------------------------
     11. Jump Nav — sticky section navigator with scroll-based progress
     ------------------------------------------------------------------ */
  const JUMP_SECTIONS = [
    { id: "protocol-score", mk: "Score", en: "Score" },
    { id: "scenario-simulator", mk: "Симулатор", en: "Simulator" },
    { id: "risk-meter", mk: "Ризик", en: "Risk" },
    { id: "reference-map", mk: "Мапа", en: "Map" },
    { id: "precedence-builder", mk: "Предимство", en: "Precedence" },
    { id: "flag-check", mk: "Знамиња", en: "Flags" },
    { id: "daily-minute", mk: "Дневна порака", en: "Daily" },
    { id: "insights-engine", mk: "Insights", en: "Insights" },
    { id: "readiness-review", mk: "Review", en: "Review" },
    { id: "premium-future", mk: "Иднина", en: "Future" }
  ];

  function initJumpNav() {
    const track = document.getElementById("jumpNavTrack");
    if (!track) return;

    track.innerHTML = JUMP_SECTIONS.map((s) => `<a class="jump-nav-link" href="#${s.id}" data-target="${s.id}">${t(s.mk, s.en)}</a>`).join("");

    const links = track.querySelectorAll(".jump-nav-link");
    const sections = JUMP_SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    if (!("IntersectionObserver" in window) || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("active"));
            const active = track.querySelector(`[data-target="${entry.target.id}"]`);
            if (active) {
              active.classList.add("active");
              active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
            }
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initLanguageSwitcher();
    renderQuizQuestion();
    renderScenarioStep();
    initRiskMeter();
    initReferenceMap();
    initPrecedenceBuilder();
    initFlagCheck();
    initDailyMinute();
    initInsightsEngine();
    initReadinessReview();
    initWaitlist();
    initJumpNav();
    applyLanguage(state.lang);
  });
})();
