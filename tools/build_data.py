# -*- coding: utf-8 -*-
"""portfolio.html -> data/portfolio.json

포트폴리오 페이지에서 내용만 추출해 대시보드가 읽을 구조화 데이터를 만든다.
페이지를 고친 뒤 이 스크립트를 다시 돌리면 데이터가 갱신된다.

사용:  python tools/build_data.py
필요:  pip install beautifulsoup4
"""
import io, json, os, re, sys

from bs4 import BeautifulSoup, NavigableString

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "portfolio.html")
OUT = os.path.join(ROOT, "data", "portfolio.json")


def flat(el):
    """<br>을 공백으로 바꾸고 공백을 정리한 순수 텍스트."""
    if el is None:
        return ""
    c = BeautifulSoup(str(el), "html.parser")
    for br in c.find_all("br"):
        br.replace_with(" ")
    return re.sub(r"\s+", " ", c.get_text()).strip()


def own_text(el):
    """자식 요소를 뺀, 해당 요소의 직계 텍스트만."""
    if el is None:
        return ""
    parts = [str(x) for x in el.children if isinstance(x, NavigableString)]
    return re.sub(r"\s+", " ", "".join(parts)).strip()


def direct(el, name, cls=None):
    """직계 자식만 선택 (:scope > 선택자 대응)."""
    if el is None:
        return []
    out = []
    for ch in el.find_all(name, recursive=False):
        if cls is None or cls in (ch.get("class") or []):
            out.append(ch)
    return out


def build(soup):
    d = {}

    h1 = soup.find("h1")
    d["role"] = flat(h1.find("span")) if h1 else ""
    d["name"] = own_text(h1)
    who = soup.select_one("header .who")
    d["affiliation"] = flat(who)
    d["lead"] = flat(soup.select_one(".lead"))
    d["contacts"] = [
        {"label": flat(a), "href": a.get("href")} for a in soup.select(".links a")
    ]

    d["summary"] = [
        {"title": flat(li.find("h3")), "body": flat(li.find("p"))}
        for li in soup.select(".sum li")
    ]

    d["metrics"] = [
        {"value": flat(b.select_one(".v")), "label": flat(b.select_one(".l"))}
        for b in direct(soup.select_one(".metrics"), "div")
    ]

    d["stack"] = []
    for t in soup.select(".tier"):
        d["stack"].append({
            "tier": flat(t.find("h3")),
            "note": flat(direct(t, "p")[0]) if direct(t, "p") else "",
            "groups": [{
                "name": flat(g.find("h4")),
                "tech": [flat(s) for s in g.select(".chips span")],
                "points": [flat(li) for li in g.select("ul li")],
            } for g in t.select(".grp")],
        })

    d["projects"] = []
    for i, btn in enumerate(soup.select("[data-open]")):
        dlg = soup.find(id=btn["data-open"])
        if dlg is None:
            continue

        kpi = btn.select_one(".kpi")
        kpi_sub = kpi.find("small") if kpi else None
        img_card = btn.find("img")
        img_doc = dlg.select_one("img.panel-full")

        meta = {}
        for row in direct(dlg.select_one(".d-meta"), "div"):
            meta[flat(row.find("dt"))] = flat(row.find("dd"))

        sections = []
        for sec in dlg.select(".d-sec"):
            h4 = sec.find("h4")
            own = h4.select_one(".own") if h4 else None
            title = flat(h4)
            if own:
                title = title.replace(flat(own), "").strip()
            sections.append({
                "title": title,
                "ownWork": own is not None,
                "paragraphs": [flat(p) for p in direct(sec, "p")],
                "steps": [flat(li) for li in sec.select("ol > li")],
                "results": [
                    {"value": flat(e.select_one(".rv")), "label": flat(e.select_one(".rl"))}
                    for e in direct(sec.select_one(".res"), "div")
                ],
            })

        d["projects"].append({
            "id": re.sub(r"^d-", "", btn["data-open"]),
            "featured": i == 0,
            "category": flat(dlg.select_one(".d-head .cat")),
            "title": flat(dlg.select_one(".d-head h3")),
            "card": {
                "subtitle": flat(btn.select_one(".sub")) or None,
                "tagline": flat(btn.select_one(".one")),
                "kpi": own_text(kpi) if kpi else "",
                "kpiNote": flat(kpi_sub) if kpi_sub else "",
                "chips": [flat(s) for s in btn.select(".chips span")],
                "thumbnail": img_card.get("src") if img_card else None,
            },
            "image": img_doc.get("src") if img_doc else None,
            "meta": meta,
            "sections": sections,
        })

    d["principles"] = []
    for a in soup.select(".philo article"):
        h3 = a.find("h3")
        d["principles"].append({
            "label": flat(h3.find("span")) if h3 else "",
            "title": own_text(h3),
            "body": flat(a.find("p")),
        })

    d["faq"] = [
        {"question": flat(q.find("h3")), "answer": [flat(p) for p in q.find_all("p")]}
        for q in soup.select(".qa")
    ]

    d["footer"] = [flat(s) for s in soup.select("footer span")]
    return d


def main():
    if not os.path.exists(SRC):
        sys.exit("원본을 찾을 수 없습니다: " + SRC)
    soup = BeautifulSoup(io.open(SRC, encoding="utf-8").read(), "html.parser")
    data = build(soup)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("생성: %s" % os.path.relpath(OUT, ROOT))
    print("  프로젝트 %d · 지표 %d · 스택 티어 %d · 원칙 %d · 질문 %d"
          % (len(data["projects"]), len(data["metrics"]), len(data["stack"]),
             len(data["principles"]), len(data["faq"])))


if __name__ == "__main__":
    main()
