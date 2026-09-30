#!/usr/bin/env python3
"""999921.com static site builder.
Page bodies live in src/<slug>.html. Optional first line: <!--meta {json}--> (title, desc, hero, schema, band).
Run: python3 build.py  -> writes <slug>.html at repo root + sitemap.xml
"""
import json, os, re, datetime, html

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
DOMAIN = 'https://999921.com'
VER = datetime.date.today().strftime('%Y%m%d')
INTEREST = 'https://web.works/contact'

NAV = [
    ('gold-price.html', 'Gold Price'), ('calculators.html', 'Calculators'), ('gold-9999.html', '9999 Gold'),
    ('21k-gold.html', '21K Gold'), ('wedding-gold.html', 'Wedding Gold'),
    ('lucky-numbers.html', 'Lucky Numbers'), ('guides.html', 'Guides'),
]

FOOT = {
    'Prices & Tools': [('gold-price.html', 'Live gold price'), ('calculators.html', 'Gold calculators'), ('purity-guide.html', 'Karat & purity converter'), ('wedding-gold.html#planner', 'Wedding gold planner'), ('lucky-numbers.html', 'Number decoder'), ('get-quotes.html', 'Get free quotes')],
    'Learn': [('gold-9999.html', 'What is 9999 gold?'), ('21k-gold.html', '21K gold guide'), ('china-gold.html', 'China gold market'), ('999921-meaning.html', 'Meaning of 999921'), ('guides.html', 'All guides'), ('buyers-checklist.html', 'Free buyer’s checklist')],
    'Community': [('contests.html', 'Contests & prizes'), ('videos.html', 'Video hub'), ('support.html', 'Support / donate'), ('careers.html', 'Careers & talent'), ('advertise.html', 'Advertise & sponsor')],
    'Company': [('about.html', 'About'), ('contact.html', 'Contact'), ('privacy.html', 'Privacy'), ('terms.html', 'Terms'), ('disclaimer.html', 'Disclaimer & trademark')],
}

ORG = {"@context": "https://schema.org", "@graph": [
    {"@type": "WebSite", "@id": DOMAIN + "/#site", "url": DOMAIN + "/", "name": "999921.com", "description": "9999 fine gold & 21K gold prices, purity calculators and Chinese gold culture.",
     "potentialAction": {"@type": "SearchAction", "target": DOMAIN + "/lucky-numbers.html?n={n}", "query-input": "required name=n"}},
    {"@type": "Organization", "@id": DOMAIN + "/#org", "name": "999921.com", "url": DOMAIN + "/", "logo": DOMAIN + "/assets/img/icon.svg"}]}


def header():
    items = ''.join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)
    return f'''<a class="skip" href="#main">Skip to content</a>
<div class="topbar">Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership — <a href="{INTEREST}" data-interest target="_blank" rel="noopener">web.works/contact</a></div>
<div class="ticker" aria-label="Live gold prices"><div class="ticker-inner" id="ticker"><span><i class="live-dot"></i><b>GOLD</b> loading live prices…</span></div></div>
<header class="site-header"><div class="wrap nav">
<a class="brand" href="index.html" aria-label="999921.com home"><span class="brand-mark">9999<br>21</span><span>999921<small>Gold · Purity · Prosperity</small></span></a>
<button class="nav-toggle" aria-expanded="false" aria-controls="menu">☰ Menu</button>
<ul class="menu" id="menu">{items}<li><a class="cta-link" href="get-quotes.html">Get Free Quotes</a></li></ul>
</div></header>'''


def footer():
    cols = ''.join('<div><h4>%s</h4><ul>%s</ul></div>' % (k, ''.join(f'<li><a href="{h}">{t}</a></li>' for h, t in v)) for k, v in FOOT.items())
    return f'''<footer class="site-footer"><div class="wrap">
<div class="foot-grid"><div><a class="brand" href="index.html"><span class="brand-mark">9999<br>21</span><span>999921</span></a>
<p class="mt2">Free live gold prices in 20 currencies, purity calculators and plain-English guides to 9999 fine gold, 21K gold and the Chinese gold tradition.</p>
<p><a class="btn btn-sm btn-gold" href="get-quotes.html">Get free quotes</a> <a class="btn btn-sm btn-ghost" href="support.html" style="color:#e9dfc3">Support us</a></p></div>{cols}</div>
<div class="legal"><p><b>Interested in this website, the 999921.com domain name, sponsorship, advertising or partnership?</b> <a href="{INTEREST}" data-interest target="_blank" rel="noopener">Contact us at web.works/contact</a>.</p>
<p>Prices are indicative mid-market spot values derived from public data feeds and may be delayed; they are not offers to buy or sell. Nothing on this site is financial advice. “999921” is used here as a generic numeric string describing gold purity (99.99%) and karat (21K) and in its cultural number-meaning sense; no trademark rights are claimed in it. All third-party names and marks belong to their owners and are used for identification only — see <a href="disclaimer.html">Disclaimer &amp; Trademark/Copyright Notice</a>.</p>
<p>© <span data-year>2026</span> 999921.com · Original content and code. All rights reserved.</p></div>
</div></footer>
<div class="mobile-cta"><a class="btn btn-sm btn-gold" href="get-quotes.html">Free quote</a><a class="btn btn-sm btn-red" href="#" data-open-modal>Price alerts</a></div>
<button class="to-top" aria-label="Back to top">↑</button>
<div class="toast" id="toast" role="status"></div>
<div class="cookie" id="cookie" role="dialog" aria-label="Cookie consent"><b>Cookies & ads</b><p class="mb0 small">We use essential storage for your settings. With your OK, Google AdSense may use cookies to show and measure ads. See our <a href="privacy.html" style="color:var(--gold-2)">Privacy Policy</a>.</p><div class="btns"><button class="btn btn-sm btn-gold" data-consent="all">Accept all</button><button class="btn btn-sm btn-ghost" data-consent="essential" style="color:#e9dfc3">Essential only</button></div></div>
<div class="modal" id="lead-modal" aria-modal="true" role="dialog" aria-labelledby="lm-title"><div class="modal-box"><button class="modal-close" aria-label="Close">×</button>
<div class="leadbox-head"><span class="eyebrow" style="color:#5a1010">Free · 2-minute read</span><h3 id="lm-title">Get the 9999 Gold Buyer’s Checklist + price-drop alerts</h3></div>
<div class="leadbox-body"><p class="small muted">17 checks that stop you overpaying for gold: hallmarks, spreads, making charges, 9999 vs 999, 21K resale and more.</p>
<form class="form" data-form="Lead magnet: buyer checklist + alerts" data-unlock="guide" data-redirect="buyers-checklist.html" data-ok="Done! Opening your checklist…">
<div class="hp"><input name="_hp" tabindex="-1" autocomplete="off"></div>
<div><label for="lm-name">First name</label><input id="lm-name" type="text" name="name" required autocomplete="given-name"></div>
<div><label for="lm-email">Email</label><input id="lm-email" type="email" name="email" required autocomplete="email"></div>
<div class="row"><div><label for="lm-target">Alert me when 24K is below (/g)</label><input id="lm-target" type="number" step="0.01" name="alert_price"></div><div><label for="lm-cur">Currency</label><select id="lm-cur" name="currency" data-cur></select></div></div>
<label class="check"><input type="checkbox" name="consent" value="yes" required> I agree to receive emails from 999921.com. Unsubscribe anytime.</label>
<button class="btn btn-gold btn-block" type="submit">Send me the checklist</button><div class="form-msg" role="status"></div></form></div></div></div>'''


BAND = '''<section><div class="wrap"><div class="band reveal"><div><span class="eyebrow" style="color:#5a1010">Price alerts · Weekly digest</span><h2>Never overpay for gold again.</h2><p class="mb0">Get a price-drop alert for 9999, 22K or 21K in your currency, plus one smart weekly email. Free.</p></div>
<form class="form" data-form="Newsletter + price alert" style="display:flex;gap:10px;flex-wrap:wrap"><div class="hp"><input name="_hp" tabindex="-1" autocomplete="off"></div>
<input type="email" name="email" placeholder="you@email.com" required aria-label="Email" style="flex:1;min-width:200px">
<select name="karat" aria-label="Karat" style="max-width:130px"><option>9999 / 24K</option><option>22K</option><option>21K</option><option>18K</option></select>
<button class="btn btn-dark" type="submit">Get alerts</button><div class="form-msg" role="status" style="flex-basis:100%"></div></form></div></div></section>'''


def page(slug, meta, body):
    title = meta.get('title', '999921.com')
    desc = meta.get('desc', '')
    canon = DOMAIN + '/' + ('' if slug == 'index' else slug + '.html')
    schema = [ORG] + meta.get('schema', [])
    crumbs = ''
    if slug != 'index' and not meta.get('nocrumb'):
        crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": DOMAIN + "/"},
            {"@type": "ListItem", "position": 2, "name": meta.get('crumb', title.split(' — ')[0].split(' | ')[0]), "item": canon}]}
        schema.append(crumbs)
    ld = ''.join('<script type="application/ld+json">%s</script>' % json.dumps(s, ensure_ascii=False) for s in schema)
    band = '<div id="band-slot"></div>' if meta.get('band', True) else ''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canon}"><meta name="robots" content="{meta.get('robots','index,follow,max-image-preview:large')}">
<meta property="og:type" content="website"><meta property="og:site_name" content="999921.com"><meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}"><meta property="og:url" content="{canon}"><meta property="og:image" content="{DOMAIN}/assets/img/og.svg">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#16140f">
<link rel="icon" href="assets/img/icon.svg" type="image/svg+xml"><link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&family=Noto+Serif+SC:wght@600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v={VER}">
<link rel="preconnect" href="https://api.gold-api.com"><link rel="preconnect" href="https://open.er-api.com">
{ld}
</head><body>
{header()}
<!--src-meta {json.dumps(meta, ensure_ascii=False)}-->
<main id="main">
{body}
<!--/src-body-->{band}
</main>
<div id="layout-foot"></div>
<noscript><p style="text-align:center;padding:20px">Interested in this website/domain? <a href="{INTEREST}">web.works/contact</a> · <a href="disclaimer.html">Disclaimer &amp; Trademark</a> · <a href="privacy.html">Privacy</a></p></noscript>
<script src="assets/js/config.js?v={VER}"></script><script src="assets/js/layout.js?v={VER}"></script><script src="assets/js/app.js?v={VER}" defer></script>
</body></html>
'''


def main():
    urls = []
    for fn in sorted(os.listdir(SRC)):
        if not fn.endswith('.html'):
            continue
        slug = fn[:-5]
        raw = open(os.path.join(SRC, fn), encoding='utf-8').read()
        meta = {}
        m = re.match(r'\s*<!--meta\s+(\{.*?\})\s*-->', raw, re.S)
        if m:
            meta = json.loads(m.group(1))
            raw = raw[m.end():]
        out = page(slug, meta, raw.strip())
        open(os.path.join(ROOT, slug + '.html'), 'w', encoding='utf-8').write(out)
        if meta.get('robots', '').startswith('noindex'):
            continue
        urls.append((DOMAIN + '/' + ('' if slug == 'index' else slug + '.html'), '1.0' if slug == 'index' else meta.get('priority', '0.7')))
    lj = '/* generated by build.py — shared footer, band, modal, cookie */\n(function(){var F=%s,B=%s;var f=document.getElementById(\"layout-foot\");if(f)f.outerHTML=F;var b=document.getElementById(\"band-slot\");if(b)b.outerHTML=B;})();\n' % (json.dumps(footer(), ensure_ascii=False), json.dumps(BAND, ensure_ascii=False))
    open(os.path.join(ROOT, 'assets', 'js', 'layout.js'), 'w', encoding='utf-8').write(lj)
    today = datetime.date.today().isoformat()
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        f'  <url><loc>{u}</loc><lastmod>{today}</lastmod><priority>{p}</priority></url>\n' for u, p in urls) + '</urlset>\n'
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write(sm)
    print('built', len(urls), 'indexed pages')


if __name__ == '__main__':
    main()
