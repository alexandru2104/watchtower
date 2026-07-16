# Watchtower — Launch Copy

## Product Hunt

**Tagline (60 char max):**
Price alerts that ping your Telegram, not your browser tab

**Description:**
Watchtower checks crypto prices every minute and messages you on Telegram the moment your threshold is crossed — no dashboard to babysit, no tab to keep open. Set a price, close your laptop, get on with your day. Free for up to 3 alerts; $9/mo for unlimited.

**First comment (post this right after launching, from your own account):**
Hey Product Hunt! I built Watchtower because I kept a trading dashboard open all day just to catch one price move, and it never felt worth the attention it demanded. So I stripped it down to one job: watch a number, tell me on Telegram when it crosses a line, then get out of the way.

It's a solo project — feedback on what to add next (forex? stocks? RSI/MACD conditions?) is genuinely welcome. Happy to answer anything about how it's built too.

---

## Reddit

### r/SideProject
**Title:** Built a price alert tool that texts you on Telegram instead of living in a browser tab

**Body:**
I got tired of keeping a trading dashboard open just to catch one price crossing a line, so I built Watchtower: you set a threshold on a coin, it checks every minute in the background, and pings your Telegram the moment it's crossed. That's the whole product.

Free plan covers 3 alerts, $9/mo removes the cap. Built with Node/Express + SQLite, deployed on Railway, payments through LemonSqueezy.

Would love feedback, especially on what conditions (RSI? volume spikes?) would make this actually useful for your workflow. Link in comments per sub rules.

### r/CryptoCurrency (check self-promo rules/day first)
**Title:** Made a minimal price alert bot — Telegram notification, no app to check

**Body:**
Wanted something that just watches a price and shuts up until it matters. Set BTC/ETH/etc above or below a number, it checks every 60s, and Telegram pings you when it crosses. No charts, no feed, no dashboard — the opposite of most of these tools.

Still early — free tier covers 3 alerts. Curious if people here would actually want RSI-based conditions too, or if plain price thresholds cover most use cases.

### r/algotrading
**Title:** Simple price-threshold alert service (Telegram delivery) — feedback wanted on what conditions matter

**Body:**
Not a strategy backtester, just a minimal alerting layer: set a price threshold per symbol, checked every minute against live data, delivered via Telegram. Built it because most existing tools bundle alerts with a full charting suite I didn't want open all day.

Genuinely asking this community: is plain price-threshold enough, or is RSI/MACD-based alerting the actual bar for something like this to be useful in your setup?

---

## Twitter / X thread

**Tweet 1:**
Spent way too long keeping a trading dashboard open just to catch one price crossing a line.

So I built the opposite: set a threshold, close everything, get pinged on Telegram the second it matters.

Watchtower — live now 🧵

**Tweet 2:**
How it works:
1. Pick a coin + a price + a direction
2. It checks every minute, silently, in the background
3. The moment your condition hits, you get a Telegram message

That's the entire product. No dashboard to open.

**Tweet 3:**
Free plan: 3 active alerts.
$9/mo: unlimited.

No credit card needed to try it — [your URL]

**Tweet 4:**
Built solo with Node/Express + SQLite, deployed on Railway, payments via LemonSqueezy. Happy to talk shop if anyone's curious about the stack or wants to compare notes on solo shipping.

---

## Notes on posting order
1. Post to Indie Hackers first (friendliest audience, good for early feedback before a bigger crowd sees it)
2. Twitter/X thread same day
3. Reddit posts spread across 2-3 days (not all subs same day — looks spammy, and some subs limit self-promo frequency)
4. Product Hunt on a day you can actually be online most of the day to answer comments (Tuesday–Thursday tend to get the most traffic)
