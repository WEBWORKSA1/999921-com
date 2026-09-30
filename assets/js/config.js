/* 999921.com — site configuration. Edit this file to go live. */
window.SITE = {
  name: '999921.com',
  domain: 'https://999921.com',
  interestUrl: 'https://web.works/contact',

  /* Inbox for ALL forms — stored encoded (never rendered in HTML). */
  _k: ['bW9jLmxp', 'YW1nQDFh', 'c2tyb3di', 'ZXc='],
  /* Optional: after activating FormSubmit, paste the random alias it emails you (e.g. 'a1b2c3...') */
  formAlias: '',

  /* Google AdSense — set enabled:true after approval. Ads load only after cookie consent. */
  adsense: {
    enabled: false,
    client: 'ca-pub-0000000000000000',
    slots: { leaderboard: '', incontent: '', sidebar: '', footer: '' }
  },

  /* Donations — paste your live links. Empty buttons fall back to the pledge form. */
  donate: {
    kofi: '', buymeacoffee: '', paypal: '', stripe: '', githubSponsors: '', patreon: ''
  },

  /* YouTube — channel + featured video IDs (11-char IDs). Leave empty to show curated topic playlists. */
  youtube: {
    channelUrl: '',
    featured: [] /* e.g. ['xxxxxxxxxxx','yyyyyyyyyyy'] */
  },

  /* Affiliates & socials */
  amazonTag: '',
  social: { youtube: '', x: '', instagram: '', facebook: '', tiktok: '', wechat: '', whatsapp: '' },

  /* Market data (free, keyless). Fallback values used if APIs are unreachable. */
  api: {
    gold: 'https://api.gold-api.com/price/XAU',
    silver: 'https://api.gold-api.com/price/XAG',
    fx: 'https://open.er-api.com/v6/latest/USD'
  },
  fallback: {
    xau: 4158.5, xag: 48.5, updated: '2026-09-29T11:19:08Z',
    rates: { USD:1, CNY:6.7179, HKD:7.846, TWD:30.4, SGD:1.28, MYR:4.2, INR:96.06, AED:3.6725, SAR:3.75, KWD:0.305, QAR:3.64, EGP:52.09, EUR:0.8815, GBP:0.75, CAD:1.4185, AUD:1.52, JPY:148, THB:32.5, TRY:41, PKR:282 }
  }
};
