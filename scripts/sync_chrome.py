#!/usr/bin/env python3
"""Keep the navigation bar and footer identical across all SVARNA pages,
and refresh the homepage counters.

Edit _partials/nav.html or _partials/footer.html, then run from the repo root:

    python scripts/sync_chrome.py

The script rewrites <nav class="navbar">…</nav> and <footer>…</footer> in every
*.html page, marks the current page as active, and recomputes the counts in
index.html (publications, datasets, software, demos) from the other pages.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
NAV = (ROOT / "_partials" / "nav.html").read_text(encoding="utf-8").strip()
FOOT = (ROOT / "_partials" / "footer.html").read_text(encoding="utf-8").strip()
RESEARCH_PAGES = {"research.html", "nli.html", "greek-nlp.html", "type-theory.html",
                  "digital-humanities.html", "distance-studies.html", "llms.html"}
TEAM_PAGES = {"team.html"}
SKIP = re.compile(r"^google[0-9a-f]+\.html$")


def nav_for(page: str) -> str:
    nav = NAV
    href = f'href="{page}"'
    if page in RESEARCH_PAGES or page in TEAM_PAGES:
        label = "Research" if page in RESEARCH_PAGES else "Team"
        nav = nav.replace(f'onclick="return false;" style="cursor: pointer;">{label}</a>',
                          f'onclick="return false;" style="cursor: pointer;" class="active">{label}</a>', 1)
    if page not in RESEARCH_PAGES and page not in TEAM_PAGES:
        nav = nav.replace(f'<li><a {href}>', f'<li><a {href} class="active">', 1)
    return nav


def count_stats() -> dict:
    def read(name):
        return (ROOT / name).read_text(encoding="utf-8")
    datasets_html = read("datasets.html")
    cut = datasets_html.find("License Information")
    datasets = len(re.findall(r"<h3[^>]*>.*?</h3>", datasets_html[:cut] if cut > 0 else datasets_html, re.S))
    return {
        "publications": len(re.findall(r'class="publication-card"', read("publications.html"))),
        "datasets": datasets,
        "software": len(re.findall(r'class="tool-item"', read("software.html"))),
        "demos": len(re.findall(r'class="demo-card"', read("demos.html"))),
    }


def main() -> int:
    changed = []
    for path in sorted(ROOT.glob("*.html")):
        if SKIP.match(path.name):
            continue
        html = path.read_text(encoding="utf-8")
        new = html
        if re.search(r'<nav class="navbar">.*?</nav>', new, re.S):
            new = re.sub(r'<nav class="navbar">.*?</nav>', lambda m: nav_for(path.name), new, count=1, flags=re.S)
        if re.search(r"<footer>.*?</footer>", new, re.S):
            new = re.sub(r"<footer>.*?</footer>", lambda m: FOOT, new, count=1, flags=re.S)
        if path.name == "index.html":
            for key, val in count_stats().items():
                new = re.sub(rf"<!--stat:{key}-->.*?<!--/stat-->", f"<!--stat:{key}-->{val}<!--/stat-->", new)
        if new != html:
            path.write_text(new, encoding="utf-8")
            changed.append(path.name)
    print(f"updated {len(changed)} page(s): {', '.join(changed) if changed else '-'}")
    print("homepage counts:", count_stats())
    return 0


if __name__ == "__main__":
    sys.exit(main())
