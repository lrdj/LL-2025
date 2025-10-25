codex
I read the briefing — it’s clear, compelling, and actionable. Below are
pragmatic ways to turn it into a roadmap, with a few viable routes depending on
risk, funding, and speed.

Route Options

- Route A — Overlay-First MVP: Add a lightweight “I’m going / interested” +
counts + simple chat overlay to the existing listings. Fastest to learn, minimal
backend, easy to pilot.
- Route B — Partner Pilot: Build the overlay with one or two anchor institutions
(e.g., Conway Hall) and run real events end-to-end (RSVP, chat, follow-up) to
validate organiser value.
- Route C — Data-First Core: Prioritise robust aggregation/search (Eventbrite +
universities) and launch overlay later. De-risks content scarcity; slower social
validation.
- Route D — Online-First Social: Start with online/hybrid lectures and async
“watch-together” plus chat. Lower logistics friction; strong fit for remote
users.

My recommendation: A → B hybrid. Ship a small overlay on your current site, run
a 6–8 week partner pilot, then expand features based on usage.

MVP Scope (Phase 1)

- Accounts: Email-based sign-in (magic link) + consented profile basics (name,
city, interest tags).
- RSVP Overlay: “Going / Interested” with counts; per-event attendees list gated
by visibility settings.
- Chat Light: Pre/post event thread; basic moderation/flag; per-event channel;
no DMs yet.
- Calendar + Reminders: Add-to-calendar (ICS), email reminders (online/IRL
variants).
- Hybrid Toggle: Attending in person vs online; per-mode reminders.
- Admin: Minimal staff panel to view/clear reports and freeze threads.
- Analytics: Event views, RSVPs, chat activity, conversion to “Going”, reminder
open rate.

Phase 2 (Social Layer)

- Interest Graph: Tags on profile; lightweight matchmaking prompts (“People with
X tags going”).
- 1–2–1 and Groups: Opt-in for coffee chat or group meetups; safe defaults;
consent flows.
- Membership: Freemium paywall for 1–2–1 and group creation; supporter tier.

Phase 3 (Sustainability)

- Organiser Tools: Verified profiles, broadcast updates, basic analytics.
- Sponsorship/Supporter: Featured partners; “Friends of Public Lectures”
patronage.
- Replays: Embed and post-event discussion; watch-together scheduling.

Backlog Epics

- Identity & Privacy: Auth, profile settings, visibility controls, GDPR basics,
ToS/CoC.
- Events & RSVP: Overlay widget, counts, attendees list with privacy, calendar,
reminders.
- Chat & Moderation: Per-event threads, rate limits, report/ban, staff tools.
- Interests & Discovery: Tags, topic-based suggestions, “similar events/
attendees”.
- Hybrid UX: In-person vs online flows; distinct reminders; join links;
post-event follow-up.
- Integrations: Eventbrite import (read), Zoom/YT embeds, calendar, maps/travel
snippets.
- Payments: Membership checkout, receipts, entitlements.
- Analytics: Event funnel (view→RSVP→attend), DAU/WAU/MAU, retention, safety
metrics.

Milestones & Timeline (example 12–16 weeks)

- M0 (1–2 weeks): Research sprints with 10–15 users + 2 organisers; architecture
spike; safety policy draft.
- M1 (3–4 weeks): Accounts, RSVP overlay, counts, ICS, basic reminders,
per-event chat, staff report handling; soft launch on 10–20 events.
- M2 (3–4 weeks): Interest tags, privacy controls, hybrid toggle UX, pilot
analytics; partner pilot.
- M3 (4–6 weeks): 1–2–1/group opt-in, freemium membership, improved moderation;
broader launch.

Tech Approach (pragmatic, low ops)

- Frontend: Overlay widget loaded on event pages (small JS bundle) + pages using
the pattern we’ve started (guarded, baseurl-aware).
- Backend: BaaS (Supabase/Firebase) or lightweight Node/Django + Postgres; start
with Supabase for auth, DB, RLS, realtime chat.
- Chat: Realtime channels per event via Supabase Realtime or a managed pub/sub;
strict rate-limits, profanity filter.
- Email: Managed provider (Postmark/SES) for magic links + reminders; ICS
generation server-side.
- Moderation: Simple admin UI; abuse reports; content retention limits.
- Privacy: Opt-in attendee visibility; pseudonyms allowed; blocklist; per-event
mute.

Data & Integrations (phased)

- Phase 1: Manual + CSV/Google Sheet import; start with your existing listings.
- Phase 2: Eventbrite read-only import (organiser token), Zoom/YouTube embeds,
basic calendar.
- Phase 3: University feeds; institutional onboarding flow; featured/sponsored
events.

Safety & Governance

- Code of Conduct + report flows visible in overlay.
- Visibility defaults: show counts to all; attendees list restricted (friends/
public/hidden).
- Abuse handling: report → triage SLA → freeze/delete thread; audit trail.
- Data: GDPR-compliant consent and retention; DPIA-lite; minimal PII.

KPIs & Experiment Plan

- Activation: % event viewers who click RSVP; % who join chat.
- Retention: 4-week retention of RSVPers; repeat events attended.
- Social Lift: Messages per event; replies per message; % opting into 1–2–
1/groups.
- Conversion: Free → supporter/membership; partner satisfaction (NPS-like).
- Safety: Reports per 100 users; average resolution time.

Team & Budget (ballpark)

- MVP (12–16 weeks): 1 PM/UX, 1 FE, 1 BE (or full-stack), 0.25 designer, 0.25
community/moderation; £90–140k depending on rates.
- Run costs: BaaS + email + monitoring + moderation (~£400–1k/mo to start,
excluding staff time).

Practical Routes Forward

- Conservative (A→B): Ship overlay MVP in 6–8 weeks; pilot with a partner;
expand social features if KPIs are healthy.
- Organiser-First (B→A): Start with partner tooling + overlay tightly
integrated; slower, but stronger B2B case early.
- Online-First: Focus on Zoom/YT lectures + chat + watch-together; de-risk IRL
safety/logistics early.

Near-Term Next Steps

- I can draft a detailed MVP spec (user stories, acceptance criteria) and a
sprint plan for Route A.
- If you have target partners, I’ll tailor the pilot plan and organiser
onboarding flow.
- I can produce a data model and a simple overlay widget technical design
(events, RSVPs, chat, privacy).

Tell me which route fits your funding/comfort level, and I’ll turn this into a
concrete backlog with estimates and a sprint-by-sprint plan.

user
Thanks - I'll need to digest this! Chat tomorrow

thinking
Planning concise response

I need to craft a friendly and concise response. It’s important to acknowledge
the user's needs while keeping things light and approachable. I can propose
creating a one-page roadmap or backlog document tomorrow as an option for the
next step. Since the developer persona prefers brevity, I’ll ensure the message
is short and straightforward. No tool calls are necessary for this. Let’s keep
it simple and efficient!

codex
Sounds good — sleep on it. If helpful for tomorrow, I can:

- Turn Route A → B into a 1-page roadmap with milestones, KPIs, and budget
bands.
- Draft user stories + acceptance criteria for the MVP overlay.
- Sketch a simple data model (events, RSVPs, chat, privacy) and an overlay
widget tech outline.

Ping me which you'd like first.