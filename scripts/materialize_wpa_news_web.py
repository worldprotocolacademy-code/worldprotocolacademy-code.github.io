#!/usr/bin/env python3
import argparse, json, shutil
from pathlib import Path

def cli():
    p=argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--input-dir", default="wpa-media-output")
    p.add_argument("--output-dir", default="media/news/production")
    return p.parse_args()

def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def write(path, text):
    path=Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")

def jwrite(path, obj):
    write(path, json.dumps(obj, ensure_ascii=False, indent=2) + "\n")

def main():
    a=cli()
    root=Path(a.repo_root).resolve()
    inp=Path(a.input_dir)
    if not inp.is_absolute():
        inp=root/inp
    out=Path(a.output_dir)
    if not out.is_absolute():
        out=root/out

    pack=read_json(inp/"daily"/"latest.json")
    date=str(pack.get("product_date") or "").strip()
    if not date:
        raise SystemExit("WPA NEWS product_date missing")
    boundaries=pack.get("boundaries") or {}
    if boundaries.get("automatic_external_publication") is not False:
        raise SystemExit("Automatic external publication boundary drift")
    if boundaries.get("human_gate_required") is not True:
        raise SystemExit("Human Gate boundary drift")

    dated=inp/"daily"/date
    required={
        "teleprompter.md": dated/"teleprompter.md",
        "captions.vtt": dated/"captions-draft.vtt",
        "video-description.md": dated/"video-description.md",
    }
    for label,path in required.items():
        if not path.exists():
            raise SystemExit(f"Missing generated {label}: {path}")

    out.mkdir(parents=True, exist_ok=True)
    jwrite(out/"latest.json", pack)
    shutil.copyfile(required["teleprompter.md"], out/"teleprompter.md")
    shutil.copyfile(required["captions.vtt"], out/"captions.vtt")
    shutil.copyfile(required["video-description.md"], out/"video-description.md")
    jwrite(out/"shorts.json", pack.get("shorts") or [])

    transcript=["# WPA NEWS · Full transcript — "+date, ""]
    for x in pack.get("script_lines") or []:
        speaker=str(x.get("speaker") or "WPA").strip()
        text=str(x.get("text") or "").strip()
        if not text:
            continue
        transcript += [f"**{speaker}:** {text}", ""]
        if x.get("source_url"):
            transcript += [f"_Source: {x.get('source') or 'Original source'} · {x['source_url']}_", ""]
    transcript += ["## Human Gate", "", "PENDING. This transcript is a production master, not an automatically released broadcast.", ""]
    write(out/"transcript.md", "\n".join(transcript))

    source_lines=[]
    seen=set()
    for x in pack.get("script_lines") or []:
        u=str(x.get("source_url") or "").strip()
        if u and u not in seen:
            seen.add(u)
            source_lines.append(f"- {x.get('source') or 'Source'}: {u}")
    social=[
        f"# WPA NEWS · Social copy draft — {date}",
        "",
        "WPA NEWS · Дневни вести",
        "",
        "Денешниот двоен production pack со Дипломатка и Дипломат е подготвен за Human Gate.",
        "Изворните факти и WPA анализата се одделени; оригиналните извори остануваат авторитативни.",
        "",
        "Протокол · Дипломатија · Односи со јавност · Безбедност · Комуникологија",
        "",
        "Original sources:",
        *source_lines,
        "",
        "DRAFT · NOT RELEASED · HUMAN GATE REQUIRED",
        ""
    ]
    write(out/"social-copy.md", "\n".join(social))

    status={
        "schema":"wpa-news-web-production-status/1.0",
        "product_date":date,
        "generated_at":pack.get("generated_at"),
        "programme_id":pack.get("programme_id"),
        "title":pack.get("title"),
        "pack_status":pack.get("status"),
        "release_state":"PENDING_HUMAN_GATE",
        "runtime_estimate_minutes":pack.get("runtime_estimate_minutes"),
        "word_count":pack.get("word_count"),
        "source_count":len(seen),
        "presenters":{
            "female":((pack.get("presenters") or {}).get("female") or {}).get("public_alias"),
            "male":((pack.get("presenters") or {}).get("male") or {}).get("public_alias")
        },
        "outputs":{
            "manifest":"/media/news/production/latest.json",
            "teleprompter":"/media/news/production/teleprompter.md",
            "transcript":"/media/news/production/transcript.md",
            "captions":"/media/news/production/captions.vtt",
            "shorts":"/media/news/production/shorts.json",
            "video_description":"/media/news/production/video-description.md",
            "social_copy":"/media/news/production/social-copy.md"
        },
        "boundaries":{
            "automatic_external_publication":False,
            "human_gate_required":True,
            "voice_video_render_pending":True,
            "external_platform_delivery_pending":True
        }
    }
    jwrite(out/"status.json", status)
    print(f"WPA NEWS WEB PACK MATERIALIZED: {date} · {len(seen)} sources · Human Gate pending")

if __name__=="__main__":
    main()
