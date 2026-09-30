# 999921.com — Phase-Wise Build Prompt

Use each phase as a prompt (for an AI builder or developer). Complete and QA each phase before the next.

---

## Phase 0 — Brief & constraints
> Build **999921.com**, a static, free-to-host (GitHub Pages free plan) gold price & purity hub centred on **9999 fine gold (99.99%)** and **21K gold (87.5%)**, with Chinese gold culture (久久久久爱你 “love you forever”) as the differentiator. Pure HTML/CSS/vanilla JS, no backend, no build dependencies beyond Python 3. Mobile-first, Lighthouse 90+, WCAG AA. Relative links so it works on `username.github.io/repo/` and the custom domain.
> Every page shows a red top bar: “Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership” linking to https://web.works/contact.
> All forms send to ONE inbox (the owner’s email), which must never appear in HTML — store it encoded in JS and assemble at submit time for a FormSubmit AJAX endpoint.
> Include a trademark/copyright disclosure: “999921” is used generically/descriptively; no trademark rights claimed; third-party marks nominative only.

## Phase 1 — Design system & layout
> Create `assets/css/style.css`: tokens (charcoal #16140f, gold gradient #f3dc84→#c9a227→#8a6d12, Chinese red #c8102e, cream #fbf8f1), Playfair Display + Noto Serif SC headings, Inter body, tabular numbers. Components: buttons, cards, “seal” number badges, tables (horizontal scroll + sticky first column), forms, choice tiles, multi-step wizard, calculator result panel, FAQ accordions, newsletter band, countdown, donation tiers, ad-slot placeholders, cookie banner, modal, toast, sticky mobile CTA bar, back-to-top, scroll-reveal.
> Create `build.py` that wraps `src/*.html` bodies with a shared layout: top bar, live ticker, sticky header + nav + “Get Free Quotes” CTA, footer (4 link columns + legal disclosure), cookie consent, lead-magnet modal, SEO meta, Open Graph, canonical, JSON-LD (WebSite, Organization, BreadcrumbList), and generates `sitemap.xml`.

## Phase 2 — Live data engine (`assets/js/app.js`, `config.js`)
> 1. Fetch spot gold `https://api.gold-api.com/price/XAU`, silver `/XAG`, FX `https://open.er-api.com/v6/latest/USD`; cache 60 s in sessionStorage; refresh every 2 min; fall back to last-known values in config and label “Last known”.
> 2. Price per gram = spot ÷ 31.1034768 × purity × FX.
> 3. Purities: 9999, 999, 995, 22K, 21K, 20K, 18K, 14K, 10K, 9K. Units: g, 10 g, oz t, kg, HK tael 37.429 g, 市两 50 g, tola, baht, mithqal, dwt. 20 currencies (USD, CNY, HKD, TWD, SGD, MYR, INR, AED, SAR, KWD, QAR, EGP, EUR, GBP, CAD, AUD, JPY, THB, TRY, PKR).
> 4. Data-driven ticker, `[data-gold="purity,grams,currency"]` bindings, karat×unit table, currency grid, % change since last visit, global currency selector saved in localStorage.

## Phase 3 — Tools
> - Gold value calculator (melt / sell with spread / buy with spread + making + tax, weight presets).
> - Scrap gold calculator (multi-line, per-line karat, payout %).
> - Jewellery price calculator (% or per-gram making, wastage, stones, tax).
> - Karat ↔ purity ↔ hallmark converter.
> - Wedding gold budget planner (龙凤镯, 四点金 pieces, gold pig, 21K shabka) at live prices.
> - Chinese number decoder (digit homophones, 30+ known codes, luck score, share, “engrave in gold” CTA deep-linking to the quote form).
> - Sentiment poll (“Will gold rise this week?”).

## Phase 4 — Content pages
> Home, Gold Price (live table, TradingView chart, 20 currencies, 12 cities, methodology), Calculators, 9999 Gold, 21K Gold, China Gold (WGC data), Purity Guide, Wedding Gold, Lucky Numbers, 999921 Meaning, Guides hub + 4 guides (Sell gold, Test gold, Hallmarks, Investing). Each guide: quick answer → contents → tables → in-content ad → CTA to quote form → sources → Article/HowTo schema.

## Phase 5 — Lead generation (priority)
> - **/get-quotes**: 4-step wizard — (1) intent tiles: Sell / Buy bullion / Wedding / Engrave / Investment / Business (auto-advance), (2) gold details, (3) location, timeline, budget, (4) contact + consent. Query-string prefill (`?intent=Sell%20gold&number=520`). Partner/dealer application form.
> - Home quick 3-step quote, wedding quote form, price-alert forms (sidebar, hero, newsletter band), exit-intent + mobile-timer modal with free “9999 Gold Buyer’s Checklist” unlocked on /buyers-checklist after email capture, sticky mobile bar.
> - All forms: honeypot, AJAX submit, inline success/error, subject `[999921.com] <form>`.

## Phase 6 — Monetisation & community
> - AdSense: `config.adsense` (client, slots, enabled); load only after “Accept all”; reserved slot space to avoid CLS; `ads.txt`.
> - YouTube: video hub with click-to-load youtube-nocookie facades; curated topic cards until IDs are set; creator submission form.
> - Donations (/support): tiers $5 / $21 / $99 / $999 mapped to Operations / Promotion & Marketing / Hiring Talent / Contests & Prizes; Ko-fi, BMC, PayPal, Stripe, GitHub Sponsors, Patreon links from config, fallback pledge form.
> - Contests (/contests): Guess the Gold Price with countdown + entry form, upcoming contests, rules summary, sponsor form.
> - Careers (/careers): 9 roles + application form. Advertise (/advertise): 6 products, package table, media-kit form.
> - Legal: About, Contact, Privacy (AdSense cookie language), Terms, Disclaimer & Trademark/Copyright, 404.

## Phase 7 — QA & launch
> 1. All pages 200, all internal links/anchors resolve, no horizontal scroll at 390 px.
> 2. grep the built HTML: inbox address must not appear anywhere.
> 3. Test wizard submit against a mocked endpoint.
> 4. Push to GitHub → Settings → Pages → Deploy from branch `main` / root.
> 5. Submit one form, click FormSubmit activation email.
> 6. Custom domain: A records 185.199.108–111.153, CNAME `www` → `webworksa1.github.io`, add `CNAME` file `999921.com`, enforce HTTPS.
> 7. Submit sitemap to Google Search Console; apply for AdSense.

## Phase 8 — Growth (expandable)
> Programmatic pages `/gold-price/<city>` (60+ cities), `/karat/<k>`, `/number/<n>` (100+ codes), daily price archive; 简体/繁體/العربية versions with hreflang; embeddable price widget (backlinks); GitHub Action cron that snapshots daily prices to JSON for history charts; dealer directory with paid featured listings; weekly email digest.
