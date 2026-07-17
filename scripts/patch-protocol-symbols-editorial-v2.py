from pathlib import Path

path = Path("wpaws/protocol-symbols/index.html")
text = path.read_text(encoding="utf-8")

replacements = {
    "Кастриис": "Кастрис",
    "Кула Лумпур": "Куала Лумпур",
    "Шри Џајаварденепура": "Шри Џајаварденепура Коте",
    "Аквимарин": "Аквамарин",
    "Трозабо": "Трозабец",
    '<span class="wpa-cotd-label">Country of the Day</span>': '<span class="wpa-cotd-label">Држава на денот / Country of the Day</span>',
    '>Upcoming National Days<': '>Претстојни национални денови / Upcoming National Days<',
    'No national holidays today. Check the calendar below.': 'Денес нема национален ден / No national day is recorded for today. Check the calendar below.',
    'placeholder="Search country, capital, organization..."': 'placeholder="Пребарај држава, главен град или организација / Search country, capital or organization..."',
    '<span style="display:inline;">Compare</span>': '<span style="display:inline;">Спореди / Compare</span>',
    '<div class="wpa-stats-title">Analytics</div>': '<div class="wpa-stats-title">Аналитика / Analytics</div>',
    '<div class="wpa-stats-label">Total Entities</div>': '<div class="wpa-stats-label">Вкупно ентитети / Total Entities</div>',
    '<div class="wpa-stats-label">Continents</div>': '<div class="wpa-stats-label">Континенти / Continents</div>',
    '<div class="wpa-stats-label">Largest by Area</div>': '<div class="wpa-stats-label">Најголема по површина / Largest by Area</div>',
    '<div class="wpa-stats-value" style="color:var(--green);font-size:14px;">Russia</div>': '<div class="wpa-stats-value" style="color:var(--green);font-size:14px;">Русија</div>',
    '<div class="wpa-stats-title">International Organizations</div>': '<div class="wpa-stats-title">Меѓународни организации / International Organizations</div>',
    '<div class="wpa-stats-title">Diplomatic Protocol Quiz</div>': '<div class="wpa-stats-title">Протоколарен квиз / Diplomatic Protocol Quiz</div>',
    '<div class="wpa-quiz-idle-sub">20 questions covering flags, anthems and protocol</div>': '<div class="wpa-quiz-idle-sub">20 прашања за знамиња, химни и протокол / 20 questions covering flags, anthems and protocol<br><span style="font-size:11px;color:var(--text3);">5 поени го отклучуваат нивото Explorer / A score of 5 unlocks the Explorer level.</span></div>',
    'Click to filter countries by continent': 'Кликни за филтрирање по континент / Click to filter countries by continent',
    'Click a continent card to filter the 197-country grid.': 'Кликни на континент за филтрирање на мрежата од 197 ентитети / Click a continent card to filter the 197-entity grid.',
    'Click any country to open its full protocol card.': 'Кликни на држава за да го отвориш целосниот протоколарен профил / Click any country to open its full protocol profile.',
    'Interactive dashboard: click a country row to open its protocol card.': 'Интерактивен дашборд: кликни на држава за протоколарен профил / Interactive dashboard: click a country row to open its protocol profile.',
}

for old, new in replacements.items():
    text = text.replace(old, new)

capital_replacements = {
    'id:"bo",n:"Боливија",cap:"Сукре"': 'id:"bo",n:"Боливија",cap:"Сукре (уставен); Ла Паз (седиште на Владата)"',
    'id:"nl",n:"Холандија",cap:"Амстердам"': 'id:"nl",n:"Холандија",cap:"Амстердам (уставен); Хаг (седиште на Владата)"',
    'id:"tz",n:"Танзанија",cap:"Додома"': 'id:"tz",n:"Танзанија",cap:"Додома (официјален); Дар ес Салам (главен економски и дипломатски центар)"',
    'id:"ci",n:"Брег на Слонова Коска",cap:"Јамусукро"': 'id:"ci",n:"Брег на Слонова Коска",cap:"Јамусукро (официјален); Абиџан (главен административен и дипломатски центар)"',
    'id:"il",n:"Израел",cap:"Ерусалим"': 'id:"il",n:"Израел",cap:"Ерусалим (седиште на државните институции; меѓународниот статус е предмет на различни позиции)"',
    'id:"ps",n:"Палестина",cap:"Рамала"': 'id:"ps",n:"Палестина",cap:"Рамала (административен центар; конечниот статус на Ерусалим е предмет на меѓународни позиции)"',
}
for old, new in capital_replacements.items():
    text = text.replace(old, new)

resource_replacements = {
    'id:"om",n:"Оман"': ('r:"Нафта, бакар,",', 'r:"Нафта, бакар, азбест",'),
    'id:"sz",n:"Есватини"': ('r:"Јаглен,",', 'r:"Јаглен, азбест",'),
    'id:"sl",n:"Сиера Леоне"': ('r:"Дијаманти, рутил,",', 'r:"Дијаманти, рутил, боксит",'),
    'id:"au",n:"Австралија"': ('r:"Железна руда, злато, уран,",', 'r:"Железна руда, злато, уран, боксит",'),
    'id:"br",n:"Бразил"': ('r:"Железна руда, манган, нафта",', 'r:"Железна руда, боксит, манган, нафта",'),
}
for marker, pair in resource_replacements.items():
    pos = text.find(marker)
    if pos != -1:
        end = text.find("\n", pos)
        if end == -1:
            end = len(text)
        segment = text[pos:end]
        text = text[:pos] + segment.replace(pair[0], pair[1]) + text[end:]

path.write_text(text, encoding="utf-8")
print("Protocol symbols editorial corrections applied.")
