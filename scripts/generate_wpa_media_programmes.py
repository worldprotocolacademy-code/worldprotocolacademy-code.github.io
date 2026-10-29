#!/usr/bin/env python3
import argparse, importlib.util, json, math, re, sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from types import SimpleNamespace
from zoneinfo import ZoneInfo

SKOPJE = ZoneInfo("Europe/Skopje")
ROOT = Path(__file__).resolve().parents[1]
DAILY_SCRIPT = ROOT / "scripts" / "generate_wpa_institute_daily.py"

def load_daily_module():
    spec = importlib.util.spec_from_file_location("wpa_daily", DAILY_SCRIPT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

DAILY = load_daily_module()

def cli():
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--output-dir", default=".wpa-media-output")
    p.add_argument("--api-root", default="https://wpa-live-production-bridge.worldprotocolacademy.workers.dev")
    p.add_argument("--fixture")
    p.add_argument("--mode", choices=["daily","weekly","all"], default="all")
    p.add_argument("--self-test", action="store_true")
    return p.parse_args()

def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def write(path, text):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")

def jwrite(path, obj):
    write(path, json.dumps(obj, ensure_ascii=False, indent=2) + "\n")

def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()

def words(text):
    return len(re.findall(r"\S+", text or ""))

def runtime_minutes(lines, wpm=145):
    wc = sum(words(x.get("text")) for x in lines)
    return round(wc / float(wpm), 1), wc

def hhmmss(seconds):
    ms = int(round(seconds * 1000))
    h = ms // 3600000
    ms %= 3600000
    m = ms // 60000
    ms %= 60000
    s = ms // 1000
    ms %= 1000
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

def vtt(lines):
    out = ["WEBVTT", ""]
    t = 0.0
    idx = 1
    for line in lines:
        text = clean(line.get("text"))
        if not text:
            continue
        dur = max(2.2, min(12.0, words(text) / 2.35 + 0.8))
        out += [
            str(idx),
            f"{hhmmss(t)} --> {hhmmss(t+dur)}",
            f"{line.get('speaker','WPA')}: {text}",
            ""
        ]
        t += dur + 0.25
        idx += 1
    return "\n".join(out)

def load_context(repo_root):
    root = Path(repo_root)
    programmes = read_json(root / "media/data/programmes.json")
    presenters = read_json(root / "media/data/presenters.json")
    minutes = read_json(root / "tools/data/daily-protocol-minute-30-days.json")
    audio = read_json(root / "media/data/audio-identity.json")
    return programmes, presenters, minutes, audio

def make_daily_args(args):
    return SimpleNamespace(
        fixture=args.fixture,
        api_root=args.api_root,
        limit=120,
        max_age_hours=48,
        max_api_age_hours=8,
        min_relevance=65,
        min_confidence=65,
        max_items=10,
        min_items=3,
        min_domains=2
    )

def current_product(args, now):
    a = make_daily_args(args)
    packet = DAILY.fetch(a)
    built = DAILY.build(packet, a, now)
    return DAILY.product(packet, built, a, now)

def minute_for_date(minutes, local_date):
    days = minutes.get("days") or []
    if not days:
        raise RuntimeError("Daily Protocol Minute dataset is empty.")
    idx = (local_date.timetuple().tm_yday - 1) % len(days)
    return days[idx]

def find_flag_minute(minutes):
    for d in minutes.get("days") or []:
        theme = clean((d.get("theme") or {}).get("mk"))
        if "знам" in theme.lower():
            return d
    return (minutes.get("days") or [None])[0]

def presenter_meta(presenters):
    chars = presenters["characters"]
    return {
        "female": {
            "key": "protokolka",
            "identity_id": chars["protokolka"]["identity_id"],
            "canonical_display_name": chars["protokolka"]["display_name"],
            "public_alias": chars["protokolka"].get("public_program_alias","Виралната дипломатка"),
            "identity_continuity": chars["protokolka"]["identity_continuity"]
        },
        "male": {
            "key": "diplomat",
            "identity_id": chars["diplomat"]["identity_id"],
            "canonical_display_name": chars["diplomat"]["display_name"],
            "public_alias": chars["diplomat"].get("public_program_alias","Виралниот дипломат"),
            "identity_continuity": chars["diplomat"]["identity_continuity"]
        }
    }

def line(speaker, text, kind="speech", source_url=None, source=None):
    x = {"speaker":speaker, "text":clean(text), "kind":kind}
    if source_url:
        x["source_url"] = source_url
    if source:
        x["source"] = source
    return x

def item_spoken(item):
    title = clean(item.get("title"))
    summary = clean(item.get("summary"))
    source = clean(item.get("source"))
    if len(summary) > 520:
        summary = summary[:517].rstrip() + "..."
    return f"Според {source}, {title}. {summary}"

def angle_spoken(item):
    domain = item.get("domain")
    labels = {
        "protocol":"протокол",
        "diplomacy":"дипломатија",
        "public_relations":"јавна комуникација",
        "security":"безбедност",
        "communicology":"комуникологија"
    }
    angle = clean(item.get("wpa_working_angle"))
    return f"WPA агол за {labels.get(domain, domain)}: {angle}"

def build_daily_pack(product, programmes, presenters, minutes, audio, now):
    local = now.astimezone(SKOPJE)
    cfg = programmes["programmes"]["wpa_news_daily"]
    pm = presenter_meta(presenters)
    female = pm["female"]["public_alias"]
    male = pm["male"]["public_alias"]

    selected = list(product["items"])[:8]
    lines = [
        line(female, "Добро утро. Ова е WPA NEWS — дневниот бриф на Светската академија за протокол."),
        line(male, "Ги следиме само петте WPA дисциплини: протокол, дипломатија, односи со јавност, безбедност и комуникологија."),
        line(female, "Сите прилози се засноваат на јавни извори. Изворните факти и WPA анализата се јасно одделени, а оригиналниот извор останува авторитативен за сопствените тврдења.")
    ]

    for i, item in enumerate(selected):
        a = female if i % 2 == 0 else male
        b = male if a == female else female
        label = "Главна тема" if i == 0 else f"Тема {i+1}"
        lines.append(line(a, f"{label}. {item_spoken(item)}", "source_report", item["original_url"], item["source"]))
        lines.append(line(b, angle_spoken(item), "wpa_analysis", item["original_url"], item["source"]))

    pmn = minute_for_date(minutes, local.date())
    lines += [
        line(female, f"Протоколарна минута. Денешна тема: {pmn['theme']['mk']}. {pmn['golden_thought']['mk']}"),
        line(male, f"Типична грешка за вежба: {pmn['mistake_pattern']['mk']} Ова е генерички образовен пример, не тврдење за конкретен настан или лице."),
        line(female, "За секоја тема, оригиналните извори се дел од provenance пакетот. WPA не користи непотврдена визуелна содржина како документарен доказ."),
        line(male, "Ова беше WPA NEWS. Следното издание се подготвува од новиот Journal Live пакет и повторно поминува низ Human Gate пред надворешна објава.")
    ]

    runtime, wc = runtime_minutes(lines)
    status = "READY_FOR_HUMAN_GATE__VOICE_VIDEO_RENDER_PENDING"
    if runtime < cfg["target_runtime_minutes"][0]:
        status = "SHORT_EDITION_READY_FOR_HUMAN_GATE__VOICE_VIDEO_RENDER_PENDING"

    shorts = []
    for i, item in enumerate(selected[:3], 1):
        shorts.append({
            "id": f"SHORT-{i:02d}",
            "target_seconds":[35,50],
            "host": female if i % 2 else male,
            "hook": f"Што значи ова за {item['domain'].replace('_',' ')}?",
            "script": f"{item_spoken(item)} {angle_spoken(item)} Оригиналниот извор е наведен во описот.",
            "source_url": item["original_url"],
            "source": item["source"],
            "human_gate":"REQUIRED"
        })

    pack = {
        "schema":"wpa-news-daily-production-pack/1.0",
        "version":"1.0.0",
        "product_date":local.date().isoformat(),
        "generated_at":now.astimezone(timezone.utc).isoformat().replace("+00:00","Z"),
        "programme_id":cfg["programme_id"],
        "title":cfg["title_mk"],
        "status":status,
        "target_publication_local_time":cfg["target_publication_local_time"],
        "timezone":cfg["timezone"],
        "presenters":pm,
        "canonical_input":product["canonical_input"],
        "source_product_status":product["status"],
        "runtime_estimate_minutes":runtime,
        "word_count":wc,
        "audio_identity":{
            "name":audio.get("name"),
            "status":audio.get("status"),
            "opening_target_seconds":(audio.get("opening") or {}).get("target_seconds"),
            "closing_target_seconds":(audio.get("closing") or {}).get("target_seconds")
        },
        "script_lines":lines,
        "shorts":shorts,
        "boundaries":{
            "source_facts_and_wpa_analysis_separated":True,
            "original_sources_authoritative":True,
            "canonical_presenter_faces_locked":True,
            "automatic_external_publication":False,
            "human_gate_required":True,
            "production_voice_adapter_required":True,
            "production_avatar_render_required":True,
            "captions_must_match_approved_script":True
        }
    }
    return pack

def daily_markdown(pack):
    out = [
        f"# {pack['title']} — {pack['product_date']}",
        "",
        f"**Status:** {pack['status']}",
        f"**Runtime estimate:** {pack['runtime_estimate_minutes']} min · {pack['word_count']} words",
        "",
        "## Dual-host teleprompter",
        ""
    ]
    for x in pack["script_lines"]:
        out += [f"**{x['speaker']}:** {x['text']}", ""]
        if x.get("source_url"):
            out += [f"_Source: {x['source']} · {x['source_url']}_", ""]
    out += ["## Short-form cuts", ""]
    for s in pack["shorts"]:
        out += [f"### {s['id']} · {s['host']}", "", f"**Hook:** {s['hook']}", "", s["script"], "", f"Source: {s['source_url']}", ""]
    out += [
        "## Human Gate",
        "",
        "Ready for editorial/recording review. External publication, voice rendering, avatar rendering, visual reuse and platform delivery remain Human-Gated.",
        ""
    ]
    return "\n".join(out)

def daily_description(pack):
    sources = []
    seen = set()
    for x in pack["script_lines"]:
        u = x.get("source_url")
        if u and u not in seen:
            seen.add(u)
            sources.append(f"- {x.get('source','Source')}: {u}")
    return "\n".join([
        f"# Video description · {pack['product_date']}",
        "",
        "WPA NEWS · Дневни вести",
        "",
        "Протокол · Дипломатија · Односи со јавност · Безбедност · Комуникологија",
        "",
        "Ова издание користи јавни извори и јасно ги одделува изворните факти од WPA анализата.",
        "",
        "## Original sources",
        *sources,
        "",
        "World Protocol Academy · Human-governed public-source media.",
        ""
    ])

def source_map(items):
    return [{
        "title":x["title"],
        "domain":x["domain"],
        "source":x["source"],
        "url":x["original_url"],
        "relevance":x["relevance_score"],
        "confidence":x["source_confidence"],
        "verification_status":x.get("verification_status")
    } for x in items]

def build_weekly_pack(product, programmes, presenters, minutes, audio, now):
    local = now.astimezone(SKOPJE)
    cfg = programmes["programmes"]["wpa_protocol_tv"]
    pm = presenter_meta(presenters)
    female, male = pm["female"]["public_alias"], pm["male"]["public_alias"]
    items = product["items"]
    by_domain = {d:[x for x in items if x["domain"]==d] for d in ["protocol","diplomacy","public_relations","security","communicology"]}
    flag = find_flag_minute(minutes)
    today = minute_for_date(minutes, local.date())

    segments = []
    segments.append({
        "id":"open",
        "label":"OPEN",
        "target_minutes":[1,2],
        "script":[
            line(female, "Добредојдовте во WPA Protocol TV — емисија за протокол, дипломатија, церемонија, јавна слика и институционална комуникација."),
            line(male, "Јас сум Виралниот дипломат, а со мене е Виралната дипломатка. Денешната епизода ги поврзува актуелните јавни извори со практични протоколарни лекции."),
            line(female, "Кога зборуваме за конкретен настан, се повикуваме на оригинален јавен извор. Кога анализираме, тоа јасно го означуваме како WPA анализа.")
        ]
    })

    proto_items = by_domain["protocol"][:2]
    proto_script = [
        line(female, f"Protocol Clinic. Денешната образовна тема е {today['theme']['mk']}. {today['golden_thought']['mk']}"),
        line(male, f"Практична грешка за анализа: {today['mistake_pattern']['mk']} Ова е генерички пример, а не опис на конкретен настан.")
    ]
    for x in proto_items:
        proto_script += [
            line(female, item_spoken(x), "source_report", x["original_url"], x["source"]),
            line(male, angle_spoken(x), "wpa_analysis", x["original_url"], x["source"])
        ]
    segments.append({"id":"protocol_clinic","label":"Protocol Clinic","target_minutes":[5,6],"script":proto_script,"source_map":source_map(proto_items)})

    dip_items = by_domain["diplomacy"][:2]
    dip_script = []
    if dip_items:
        for x in dip_items:
            dip_script += [
                line(male, item_spoken(x), "source_report", x["original_url"], x["source"]),
                line(female, angle_spoken(x), "wpa_analysis", x["original_url"], x["source"])
            ]
    else:
        dip_script.append(line(male, "Оваа седмица нема доволно силен diplomacy candidate што ги поминува автоматските gates. Сегментот останува пократок наместо да се пополнува со неподдржан материјал."))
    segments.append({"id":"diplomatic_minute","label":"Diplomatic Minute","target_minutes":[4,5],"script":dip_script,"source_map":source_map(dip_items)})

    flag_script = [
        line(female, f"Flag Check. {flag['golden_thought']['mk']}"),
        line(male, f"Типична грешка: {flag['mistake_pattern']['mk']} Ова е генерички образовен модел."),
        line(female, "Во реална државна или дипломатска поставеност секогаш се проверуваат идентитетот на знамето, ориентацијата, димензиите, висината, бројот на јарболи и применливиот ред на предимство.")
    ]
    segments.append({"id":"flag_check","label":"Flag Check","target_minutes":[4,5],"script":flag_script,"source_map":[]})

    sec_items = by_domain["security"][:2]
    sec_script = []
    for x in sec_items:
        sec_script += [
            line(male, item_spoken(x), "source_report", x["original_url"], x["source"]),
            line(female, angle_spoken(x), "wpa_analysis", x["original_url"], x["source"])
        ]
    if not sec_script:
        sec_script.append(line(female, "Нема доволно силен security candidate за ова издание. WPA не пополнува безбедносен сегмент со непотврдена содржина."))
    segments.append({"id":"security_ceremony","label":"Security & Ceremony","target_minutes":[4,5],"script":sec_script,"source_map":source_map(sec_items)})

    public_items = (by_domain["public_relations"] + by_domain["communicology"])[:3]
    pub_script = []
    for x in public_items:
        pub_script += [
            line(female, item_spoken(x), "source_report", x["original_url"], x["source"]),
            line(male, angle_spoken(x), "wpa_analysis", x["original_url"], x["source"])
        ]
    if not pub_script:
        pub_script.append(line(male, "Оваа седмица нема доволно силен Public Image candidate што ги поминува автоматските gates."))
    segments.append({"id":"public_image","label":"Public Image","target_minutes":[4,5],"script":pub_script,"source_map":source_map(public_items)})

    segments.append({
        "id":"close",
        "label":"Closing synthesis",
        "target_minutes":[2,3],
        "script":[
            line(male, "Заедничката нишка е едноставна: протоколот не е декорација. Тој е видлив систем на ред, значење и институционална одговорност."),
            line(female, "Проверете ги оригиналните извори во episode provenance пакетот. Следната епизода повторно ќе ги поврзе актуелните сигнали со практични протоколарни лекции."),
            line(male, "Ова е WPA Protocol TV. Редот е стар. Науката е нова.")
        ]
    })

    all_lines = [x for seg in segments for x in seg["script"]]
    estimate, wc = runtime_minutes(all_lines)
    return {
        "schema":"wpa-protocol-tv-production-pack/1.0",
        "version":"1.0.0",
        "episode_date":local.date().isoformat(),
        "generated_at":now.astimezone(timezone.utc).isoformat().replace("+00:00","Z"),
        "programme_id":cfg["programme_id"],
        "title":cfg["title_mk"],
        "status":"EPISODE_MASTER_READY_FOR_HUMAN_LONGFORM_EXPANSION__RENDER_PENDING",
        "target_runtime_minutes":cfg["target_runtime_minutes"],
        "current_script_runtime_estimate_minutes":estimate,
        "current_script_word_count":wc,
        "presenters":pm,
        "canonical_input":product["canonical_input"],
        "segments":segments,
        "chapter_markers":[{"label":s["label"],"target_minutes":s["target_minutes"]} for s in segments],
        "short_cut_plan":[
            {"segment":s["label"],"target_seconds":[35,60],"rule":"Cut one source-locked educational moment; no unsupported hook."}
            for s in segments if s["id"] not in ("open","close")
        ],
        "boundaries":{
            "final_24_30_minute_script_requires_human_editorial_expansion":True,
            "canonical_presenter_faces_locked":True,
            "automatic_external_publication":False,
            "production_voice_adapter_required":True,
            "production_avatar_render_required":True,
            "human_gate_required_before_recording_or_release":True
        }
    }

def weekly_markdown(pack):
    out = [
        f"# {pack['title']} — Episode Master · {pack['episode_date']}",
        "",
        f"**Status:** {pack['status']}",
        f"**Target runtime:** {pack['target_runtime_minutes'][0]}–{pack['target_runtime_minutes'][1]} min",
        f"**Current deterministic script estimate:** {pack['current_script_runtime_estimate_minutes']} min · {pack['current_script_word_count']} words",
        "",
        "> The deterministic layer builds the evidence-locked episode master. Human editorial expansion is required to reach the full 24–30 minute authorial programme without padding unsupported material.",
        ""
    ]
    for s in pack["segments"]:
        out += [f"## {s['label']} · target {s['target_minutes'][0]}–{s['target_minutes'][1]} min", ""]
        for x in s["script"]:
            out += [f"**{x['speaker']}:** {x['text']}", ""]
            if x.get("source_url"):
                out += [f"_Source: {x['source']} · {x['source_url']}_", ""]
    out += ["## Human Gate", "", "Expand, author-review, rights-check, lock exact script, then render/record. No automatic external publication.", ""]
    return "\n".join(out)

def build_outputs(args, now):
    root = Path(args.repo_root).resolve()
    out = Path(args.output_dir)
    if not out.is_absolute():
        out = root / out
    programmes, presenters, minutes, audio = load_context(root)
    product = current_product(args, now)
    local_date = now.astimezone(SKOPJE).date().isoformat()

    created = []

    if args.mode in ("daily","all"):
        pack = build_daily_pack(product, programmes, presenters, minutes, audio, now)
        d = out / "daily" / local_date
        jwrite(d / "manifest.json", pack)
        write(d / "teleprompter.md", daily_markdown(pack))
        write(d / "captions-draft.vtt", vtt(pack["script_lines"]))
        write(d / "video-description.md", daily_description(pack))
        jwrite(out / "daily" / "latest.json", pack)
        created += [str(d / "manifest.json"), str(d / "teleprompter.md"), str(d / "captions-draft.vtt"), str(d / "video-description.md")]

    if args.mode in ("weekly","all"):
        pack = build_weekly_pack(product, programmes, presenters, minutes, audio, now)
        d = out / "weekly" / local_date
        jwrite(d / "episode-master.json", pack)
        write(d / "episode-master.md", weekly_markdown(pack))
        write(d / "captions-skeleton.vtt", vtt([x for s in pack["segments"] for x in s["script"]]))
        jwrite(out / "weekly" / "latest.json", pack)
        created += [str(d / "episode-master.json"), str(d / "episode-master.md"), str(d / "captions-skeleton.vtt")]

    return created

def selftest(args):
    now = datetime(2026,10,29,12,tzinfo=timezone.utc)
    fixture = {
        "generated_at":"2026-10-29T11:55:00Z",
        "items":[
            {"id":"p","title":"Official visit protocol update","summary":"An official institution published an updated ceremonial sequence for a high-level visit.","source":"Official Protocol Office","original_url":"https://example.org/protocol","published_at":"2026-10-29T09:00:00Z","primary_category":"protocol","relevance_score":96,"source_confidence":95,"source_health_status":"live","verification_status":"single_official_source"},
            {"id":"d","title":"Foreign ministers meet","summary":"Foreign ministers met to discuss bilateral and regional cooperation.","source":"MFA","original_url":"https://example.org/diplomacy","published_at":"2026-10-29T09:10:00Z","primary_category":"diplomacy","relevance_score":95,"source_confidence":95,"source_health_status":"live","verification_status":"single_official_source"},
            {"id":"s","title":"Security ceremony guidance","summary":"Authorities issued public guidance on security arrangements around a ceremonial event.","source":"Security Authority","original_url":"https://example.org/security","published_at":"2026-10-29T09:20:00Z","primary_category":"security","relevance_score":94,"source_confidence":94,"source_health_status":"live","verification_status":"single_official_source"},
            {"id":"r","title":"Public communication briefing","summary":"An institution published a public communication briefing concerning a major event.","source":"Public Office","original_url":"https://example.org/pr","published_at":"2026-10-29T09:30:00Z","primary_category":"public_relations","relevance_score":93,"source_confidence":93,"source_health_status":"live","verification_status":"single_official_source"},
            {"id":"c","title":"Communication framing study","summary":"A public report examined communication framing and audience interpretation.","source":"Research Source","original_url":"https://example.org/comm","published_at":"2026-10-29T09:40:00Z","primary_category":"communicology","relevance_score":92,"source_confidence":92,"source_health_status":"live","verification_status":"candidate"}
        ]
    }
    tmp = Path(args.repo_root).resolve() / ".wpa-media-selftest"
    fixture_path = tmp / "fixture.json"
    tmp.mkdir(parents=True, exist_ok=True)
    jwrite(fixture_path, fixture)
    old_fixture = args.fixture
    old_out = args.output_dir
    args.fixture = str(fixture_path)
    args.output_dir = str(tmp / "out")
    try:
        files = build_outputs(args, now)
        daily = read_json(tmp / "out/daily/2026-10-29/manifest.json")
        weekly = read_json(tmp / "out/weekly/2026-10-29/episode-master.json")
        assert daily["presenters"]["female"]["public_alias"] == "Виралната дипломатка"
        assert daily["presenters"]["male"]["public_alias"] == "Виралниот дипломат"
        assert len(daily["shorts"]) == 3
        assert daily["boundaries"]["automatic_external_publication"] is False
        assert weekly["boundaries"]["final_24_30_minute_script_requires_human_editorial_expansion"] is True
        assert weekly["title"] == "WPA Protocol TV"
        assert files
        print("WPA MEDIA PROGRAMMES SELF-TEST PASS")
    finally:
        args.fixture = old_fixture
        args.output_dir = old_out

def main():
    args = cli()
    if args.self_test:
        return selftest(args)
    files = build_outputs(args, datetime.now(timezone.utc))
    print("WPA MEDIA PROGRAMMES PACK GENERATED")
    for f in files:
        print(f)

if __name__ == "__main__":
    main()
