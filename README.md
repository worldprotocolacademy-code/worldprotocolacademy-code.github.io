# 🏛️ World Protocol Academy

> **Научни монографии за дипломатија, протокол и безбедност**  
> *Доц. д-р Санде Смиљанов • 25 години научна извонредност*

🌐 **Live**: https://worldprotocolacademy-code.github.io  
🧪 **Test Modals**: https://worldprotocolacademy-code.github.io/test-modals.html

---

## ✨ Карактеристики

- 🌐 Билингвална поддршка (МК / EN) со localStorage
- 🪟 Функционални модали за сите 4 книги (уникатни IDs)
- 📋 Копирање на BibTeX цитати со Clipboard API
- 🛒 Кошничка за дигитални производи (localStorage)
- 📧 Newsletter интеграција преку FormSubmit.co
- ♿ Accessibility: ARIA атрибути, keyboard навигација, skip links
- 📱 Mobile-first responsive дизајн
- 🔍 SEO оптимизиран со Schema.org structured data
- 🔄 Авто-деплој преку GitHub Actions со cache-busting

---

## 🚀 Како да деплоирате

### Опција 1: GitHub Web Interface (Најлесен)
1. Овој репозиториум е веќе конфигуриран за GitHub Pages
2. Одете во **Settings → Pages**
3. Под "Build and deployment", изберете:
   - Source: `Deploy from a branch`
   - Branch: `main` / `(root)`
4. Зачувајте — сајтот ќе биде достапен за ~1-2 минути

### Опција 2: Локално тестирање
```bash
# Клонирате го репозиториумот
git clone https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io.git
cd worldprotocolacademy-code.github.io

# Отворете го index.html директно во браузер
# Или користете локален Python сервер:
python3 -m http.server 8000
# Потоа одете на: http://localhost:8000
