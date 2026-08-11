/* WPA Symbols National Days Runtime Bridge v1.0 — 2026-08-11
   Purpose: make the visible Upcoming National Days calendar use the same
   active-runtime national-day records used by the Symbols expert assistant.

   Why this exists:
   - the legacy page calendar reads nationalHolidays[].date
   - the older MFA integration normalizes seed items mainly to month/day and
     relies on a static fallback mapping, so valid active-runtime dates can be
     absent from the visible 30-day list
   - this bridge merges active-runtime-197.json into nationalHolidays by
     country+date, preserves existing entries, and re-renders the calendar

   Safety:
   - no destructive replacement of existing holiday data
   - dedupe by country/date
   - hard fallback for North Macedonia, 8 September, if runtime loading fails
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_ND_RUNTIME_BRIDGE_V1__) return;
  window.__WPA_SYMBOLS_ND_RUNTIME_BRIDGE_V1__ = true;

  function s(v){ return String(v == null ? '' : v); }

  function parseDate(v){
    var x = s(v).trim();
    var m = x.match(/^(\d{2})-(\d{2})$/);
    if(!m) return null;
    var month = parseInt(m[1],10), day = parseInt(m[2],10);
    if(month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { date: m[1] + '-' + m[2], month: month, day: day };
  }

  function dayDate(d){
    if(!d) return null;
    return parseDate(d.date || d.date_iso || d.iso || d.mm_dd || d.national_day_date_iso || '');
  }

  function dayTitle(d){
    if(!d) return 'Национален ден';
    return s(d.title_mk || d.titleMk || d.name_mk || d.national_day_name_mk || d.title || d.name || d.title_en || 'Национален ден').trim() || 'Национален ден';
  }

  function hasDate(arr,id,date){
    return arr.some(function(h){
      if(s(h.countryId).toLowerCase() !== id) return false;
      var hd = parseDate(h.date || '');
      if(hd && hd.date === date) return true;
      if(!hd && Number(h.month) && Number(h.day)){
        var mm = String(Number(h.month)).padStart(2,'0');
        var dd = String(Number(h.day)).padStart(2,'0');
        return mm + '-' + dd === date;
      }
      return false;
    });
  }

  function ensureDateShape(h){
    if(!h || h.date) return;
    if(Number(h.month) && Number(h.day)){
      h.date = String(Number(h.month)).padStart(2,'0') + '-' + String(Number(h.day)).padStart(2,'0');
    }
  }

  function mkFallback(){
    return {
      countryId: 'mk',
      countryName: 'Северна Македонија',
      date: '09-08',
      month: 9,
      day: 8,
      title: 'Ден на независноста',
      titleMk: 'Ден на независноста',
      source: 'WPA active runtime / national day correction',
      verificationStatus: 'wpa_active_runtime'
    };
  }

  function rerender(){
    try { if(typeof initUpcomingNd === 'function') initUpcomingNd(); } catch(e){}
    try { if(typeof initTodayHolidays === 'function') initTodayHolidays(); } catch(e){}
    try { if(typeof renderGrid === 'function') renderGrid(); } catch(e){}
  }

  function mergeRuntime(runtime){
    if(typeof nationalHolidays === 'undefined' || !Array.isArray(nationalHolidays)) return false;

    nationalHolidays.forEach(ensureDateShape);
    var before = nationalHolidays.length;
    var added = 0;

    if(runtime && Array.isArray(runtime.records)){
      runtime.records.forEach(function(r){
        var id = s(r && r.id).toLowerCase().trim();
        if(!id) return;
        var days = Array.isArray(r.national_days) ? r.national_days : [];
        days.forEach(function(d){
          var pd = dayDate(d);
          if(!pd || hasDate(nationalHolidays,id,pd.date)) return;
          var title = dayTitle(d);
          nationalHolidays.push({
            countryId: id,
            countryName: s(r.name_mk || r.name_en || id),
            date: pd.date,
            month: pd.month,
            day: pd.day,
            title: title,
            titleMk: title,
            source: 'WPA active-runtime-197',
            verificationStatus: 'wpa_active_runtime'
          });
          added++;
        });
      });
    }

    if(!hasDate(nationalHolidays,'mk','09-08')){
      nationalHolidays.push(mkFallback());
      added++;
    }

    window.WPA_NATIONAL_DAYS_RUNTIME_BRIDGE_STATUS = {
      loaded: true,
      before: before,
      added: added,
      total: nationalHolidays.length,
      northMacedoniaSep8: hasDate(nationalHolidays,'mk','09-08')
    };

    rerender();
    return true;
  }

  function run(){
    if(typeof nationalHolidays === 'undefined' || !Array.isArray(nationalHolidays)) return false;
    fetch('./data/active-runtime-197.json?v=20260811-ndbridge1', {
      cache: 'no-store', credentials: 'omit', headers: {Accept:'application/json'}
    })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){ mergeRuntime(data); })
      .catch(function(){ mergeRuntime(null); });
    return true;
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run, {once:true});
  } else {
    run();
  }

  setTimeout(run,700);
  setTimeout(function(){
    if(typeof nationalHolidays !== 'undefined' && Array.isArray(nationalHolidays)){
      if(!hasDate(nationalHolidays,'mk','09-08')){
        nationalHolidays.push(mkFallback());
        rerender();
      }
    }
  },1800);
})();
