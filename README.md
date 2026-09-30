# 999921.com — 9999 Fine Gold & 21K Gold Price Hub

Static, GitHub-Pages-ready (free plan) website: live gold prices for 10 purities × 10 units × 20 currencies, calculators, Chinese number decoder, wedding gold planner, guides, lead-generation wizard, AdSense slots, YouTube hub, contests, donations, careers and advertising pages.

- **Research, idea & 30-site competitor audit:** [`docs/RESEARCH.md`](docs/RESEARCH.md)
- **Phase-wise build prompt:** [`docs/BUILD-PROMPT.md`](docs/BUILD-PROMPT.md)
- **Pages (28):** Home, Gold Price, Calculators, 9999 Gold, 21K Gold, China Gold, Purity Guide, Wedding Gold, Lucky Numbers, 999921 Meaning, Guides + 4 guides, Get Quotes, Buyer’s Checklist, Videos, Contests, Support, Careers, Advertise, Contact, About, Privacy, Terms, Disclaimer, 404.

## Edit
```bash
python3 extract_src.py   # recreates editable page bodies in src/*.html from the live pages (exact round trip)
# edit src/*.html (page bodies) or build.py (shared header/footer/top bar)
python3 build.py         # regenerates root *.html, assets/js/layout.js and sitemap.xml
```
Commit the regenerated files. The shared footer, newsletter band, lead modal and cookie banner are built into `assets/js/layout.js`.

## Go-live checklist (`assets/js/config.js`)
1. **Forms** — every form posts via FormSubmit to one inbox, stored encoded in code (never visible in HTML). Submit any form once → open the FormSubmit activation email → click **Activate**. Optionally paste the random alias into `formAlias`.
2. **AdSense** — after approval set `adsense.enabled: true`, `client`, `slots`, and update `ads.txt`.
3. **Donations** — paste Ko-fi / Buy Me a Coffee / PayPal / Stripe / GitHub Sponsors / Patreon links (empty buttons fall back to the pledge form).
4. **YouTube** — set `youtube.channelUrl` and `featured` video IDs.

## Publish
Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
Live: `https://webworksa1.github.io/999921-com/`

**Custom domain 999921.com:** A records `@` → 185.199.108.153 / .109.153 / .110.153 / .111.153, CNAME `www` → `webworksa1.github.io`, then add a `CNAME` file containing `999921.com` and enable *Enforce HTTPS*.

## Legal
Original content and code. “999921” is used only in its generic, descriptive sense (99.99% gold purity, 21 karat) and cultural number-meaning sense; no trademark rights are claimed. See `disclaimer.html`.

Interested in this website or domain? https://web.works/contact
