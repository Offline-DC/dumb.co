"""The site's editable content: src/content/*.json.

These are the files Pages CMS edits (forms in /.pages.yml). build.py reads
them through load() and bakes them into the page, so an edit in the CMS is a
commit and the next build ships it.

Nothing here should make a build fail over content. A CMS user can't see a
build log, and a failed build means their edit silently never appears. So:

  - a field that is missing or the wrong type falls back to the shipped
    value in DEFAULTS (for the handful of fields the page can't do without)
    or to empty (everything else just doesn't render);
  - a press item or memory photo whose image file isn't there is skipped,
    with a warning in the build output;
  - the checkout link is only ever an https URL, or the default.
"""
import json, pathlib, re

REPO = pathlib.Path(__file__).resolve().parents[2]
CONTENT = REPO / "src" / "content"

# only what the page would be broken without; the rest may legitimately be blank
DEFAULTS = {
    "shop.checkout_url": "https://buy.stripe.com/00w3cocK48f87HBakE8N20D",
    "shop.buy_button": "click here to buy",
    "shop.product_name": "dumbphone 2",
    "settings.support_email": "support@dumb.co",
    "press.heading": "Press",
    "memories.heading": "Memories",
    "home.button": "shop dumbphone 2 →",
    "settings.site_title": "dumb.co",
    "settings.site_description": ("Buy the \"world's best dumb phone\" for only $20. The dumbphone 2 "
                                  "syncs w/ ur smartphone --contacts, messages, Rideshare, Maps."),
    "settings.share_title": "dumb.co — Dumbphone 2",
    "faq.heading": "FAQ",
    "faq.general_tab": "General",
    "faq.tech_tab": "Tech Help",
    "faq.videos_tab": "Phone Demo",
}

warnings = []


def _read(name):
    p = CONTENT / f"{name}.json"
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
        warnings.append(f"{p.name} is not an object -- ignored")
    except FileNotFoundError:
        warnings.append(f"{p.name} is missing")
    except json.JSONDecodeError as e:
        warnings.append(f"{p.name} is not valid JSON ({e}) -- ignored")
    return {}


def text(d, key, file=None):
    v = d.get(key)
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        v = str(v)
    if isinstance(v, str) and v.strip():
        return v.strip()
    return DEFAULTS.get(f"{file}.{key}", "") if file else ""


def items(d, key):
    v = d.get(key)
    return [x for x in v if x is not None] if isinstance(v, list) else []


def hidden(x):
    return x.get("hidden") in (True, "true") if isinstance(x, dict) else False


def find_image(path, folder):
    """A CMS image path ("/src/Press/images/bi.jpg") to the file on disk.
    The CMS writes the path it uploaded to; hand-edited files might give just
    the filename. Matched by name, ignoring case (a Mac doesn't care, the
    Linux build server does)."""
    if not isinstance(path, str) or not path.strip():
        return None
    p = REPO / path.strip().lstrip("/")
    if p.is_file():
        return p
    base = path.strip().split("/")[-1].lower()
    if folder.is_dir():
        for c in folder.iterdir():
            if c.is_file() and c.name.lower() == base:
                return c
    return None


def https_or_default(v, key):
    return v if re.match(r"^https://\S+$", v or "") else DEFAULTS[key]


def link(v):
    """Something safe to put in an href, or ''."""
    v = (v or "").strip()
    if re.match(r"^(https?://|mailto:|tel:)\S+$", v, re.I):
        return v
    if re.match(r"^[\w.-]+\.[a-z]{2,}(/\S*)?$", v, re.I):
        return "https://" + v
    return ""


def vimeo_id(v):
    v = (v or "").strip()
    m = re.search(r"(?:vimeo\.com/(?:video/)?)?(\d{5,})", v)
    return m.group(1) if m else None


def load():
    """Everything the page needs, as plain dicts and lists."""
    home, about, shop = _read("home"), _read("about"), _read("shop")
    community, settings = _read("community"), _read("settings")
    press, memories, faq = _read("press"), _read("memories"), _read("faq")

    copy = {
        "home": {k: text(home, k, "home") for k in ("kicker", "headline", "body", "button")},
        "about": {k: text(about, k) for k in ("heading", "body", "sign_off")},
        "shop": {
            **{k: text(shop, k, "shop") for k in (
                "product_name", "buy_button", "price", "plan_line", "quiz_link",
                "what_is_title", "what_is", "included_title", "essentials_title",
                "specs_title", "specs_intro", "plans_title", "plans_sub", "plans_note", "quiz_button",
                "reviews_heading", "end_heading", "end_line")},
            "checkout_url": https_or_default(text(shop, "checkout_url"), "shop.checkout_url"),
            "hero_lines": [s for s in (str(x).strip() for x in items(shop, "hero_lines")) if s],
            "highlights": [s for s in (str(x).strip() for x in items(shop, "highlights")) if s],
            "included": [s for s in (str(x).strip() for x in items(shop, "included")) if s],
            "essentials": [s for s in (str(x).strip() for x in items(shop, "essentials")) if s],
            "specs": [{"label": text(x, "label"), "value": text(x, "value")}
                      for x in items(shop, "specs")
                      if isinstance(x, dict) and text(x, "label")],
        },
        "community": {
            **{k: text(community, k) for k in (
                "heading", "lede", "footer_text", "footer_email")},
            "programs": [
                {"kicker": text(x, "kicker"), "name": text(x, "name"), "body": text(x, "body"),
                 "link_label": text(x, "link_label"), "link_url": link(text(x, "link_url"))}
                for x in items(community, "programs")
                if isinstance(x, dict) and not hidden(x) and text(x, "name")],
        },
        "contact": {
            **{k: text(settings, k, "settings") for k in (
                "support_email", "support_phone", "contact_heading", "support_heading",
                "support_tagline", "social_line")},
            "hours": [{"days": text(x, "days"), "hours": text(x, "hours")}
                      for x in items(settings, "hours")
                      if isinstance(x, dict) and (text(x, "days") or text(x, "hours"))],
        },
        "site": {k: text(settings, k, "settings") for k in (
            "site_title", "site_description", "share_title", "share_image_alt")},
        "press": {k: text(press, k, "press") for k in ("heading", "contact_email")},
        "memories": {"heading": text(memories, "heading", "memories")},
        "faq": {
            **{k: text(faq, k, "faq") for k in ("heading", "sub", "general_tab", "tech_tab", "videos_tab")},
            "questions": [
                {"question": text(x, "question"), "answer": text(x, "answer"),
                 "category": "tech" if text(x, "category").lower() == "tech" else "general"}
                for x in items(faq, "questions")
                if isinstance(x, dict) and not hidden(x) and text(x, "question") and text(x, "answer")],
            "videos": [
                {"title": text(x, "title"), "vimeoId": vimeo_id(text(x, "link"))}
                for x in items(faq, "videos")
                if isinstance(x, dict) and text(x, "title") and vimeo_id(text(x, "link"))],
        },
    }

    press_dir = REPO / "src" / "Press" / "images"
    press_items, seen = [], set()
    for x in items(press, "items"):
        if not isinstance(x, dict) or hidden(x):
            continue
        title, href = text(x, "title"), link(text(x, "link"))
        img = find_image(x.get("image"), press_dir)
        if not (title and href and img):
            warnings.append(f"press: skipped {title or x!r} "
                            + ("(no title)" if not title else "(no usable link)" if not href
                               else f"(image not found: {x.get('image')})"))
            continue
        pid = text(x, "id") or re.sub(r"[^A-Z0-9]+", "-", title.upper()).strip("-")
        while pid in seen:
            pid += "-2"
        seen.add(pid)
        press_items.append({"id": pid, "title": title, "source": text(x, "source"),
                            "href": href, "image": img})

    mem_dir = REPO / "redesign_2026" / "assets" / "memories"
    events = []
    for x in items(memories, "events"):
        if not isinstance(x, dict) or hidden(x) or not text(x, "name"):
            continue
        photos = []
        for ph in items(x, "photos"):
            if not isinstance(ph, dict):
                continue
            img = find_image(ph.get("image"), mem_dir)
            if not img:
                warnings.append(f"memories: {text(x, 'name')}: photo not found: {ph.get('image')}")
                continue
            photos.append({"image": img, "caption": text(ph, "caption")})
        events.append({"name": text(x, "name"), "when": text(x, "when"),
                       "where": text(x, "where"), "blurb": text(x, "blurb"),
                       "vimeoId": vimeo_id(text(x, "video")), "photos": photos})

    return copy, press_items, events


def js(value):
    """JSON that is safe inside an inline <script>."""
    return (json.dumps(value, ensure_ascii=False)
            .replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029"))
