# AI Deal Finder — Requirements Document

**Date:** May 14, 2026  
**Author:** Solo Developer  
**Status:** Ready for Planning

---

## Problem

เมื่อคนช็อปออนไลน์ พวกเขาต้องเปิดหลายแท็บเพื่อเปรียบเทียบราคา อ่าน review ยาวๆ และไม่มีทางรู้ว่าราคานี้ดีพอหรือยัง AI Deal Finder แก้ปัญหานี้ใน 1 คลิก

---

## Primary Users

นักช็อปออนไลน์ที่ใช้ Chrome และต้องการ:
- มั่นใจว่าซื้อของในราคาดีที่สุด
- เข้าใจ review อย่างรวดเร็วโดยไม่ต้องอ่านทั้งหมด

---

## Core Value Proposition

**"รู้ทันที ว่าของชิ้นนี้ราคาดีไหม และ review จริงหรือเปล่า"**

---

## Features (MVP)

### Chrome Extension

| Feature | Description | Priority |
|---|---|---|
| Product Page Detection | ตรวจจับ URL ของ Amazon, Shopee, Lazada, Tokopedia | P0 |
| AI Review Summary | สรุป pros/cons จาก reviews ด้วย AI | P0 |
| Price Comparison | แสดงราคาจากเว็บอื่นอย่างน้อย 2-3 แห่ง | P0 |
| Price History Chart | กราฟราคาย้อนหลัง 90 วัน | P1 |
| Fake Review Detector | score ความน่าเชื่อถือของ reviews | P1 |
| "Best Time to Buy" | AI แนะนำว่าควรซื้อตอนนี้หรือรอ | P2 |

### Companion Website

| Feature | Description | Priority |
|---|---|---|
| Product Detail Page | หน้าเปรียบเทียบราคา + reviews แบบละเอียด | P0 |
| Google AdSense | ads บน header, sidebar, in-content | P0 |
| Affiliate Links | link ซื้อสินค้าผ่าน affiliate program | P0 |
| Deal Blog | บทความ buying guides และ top deals (SEO) | P1 |
| Price Alert | email แจ้งเตือนเมื่อราคาลด | P2 |

---

## Revenue Model

1. **Affiliate Commission** (primary) — Amazon Associates, Shopee Affiliate, Lazada Affiliate
   - Commission: 2-10% ต่อ sale
   - เป้าหมาย: $500-2,000/เดือน ใน 6 เดือนแรก

2. **Google AdSense** (secondary) — บน companion website
   - CPM: $3-8 (shopping niche)
   - เป้าหมาย: $100-500/เดือน ใน 6 เดือนแรก

---

## Success Criteria

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Extension Users | 1,000 | 5,000 | 20,000 |
| Website Monthly Visitors | 5,000 | 20,000 | 80,000 |
| Monthly Revenue | $100 | $500 | $2,000+ |

---

## Tech Stack

- **Extension:** Manifest V3, React, Tailwind CSS
- **Website:** Next.js 15, Tailwind CSS, shadcn/ui
- **Backend/API:** Next.js API routes + Supabase
- **AI:** OpenAI API (GPT-4o-mini สำหรับ cost efficiency)
- **Price Data:** Scraping API หรือ third-party price API
- **Deploy:** Vercel (extension + website) + Supabase

---

## Scope Boundaries

### In Scope (MVP)
- Chrome Extension เท่านั้น (ไม่รวม Firefox ในตอนนี้)
- รองรับ: Amazon, Shopee Thailand, Lazada Thailand
- AI summary ภาษาอังกฤษ + ไทย

### Out of Scope (MVP)
- Mobile app
- Subscription/paid tier
- Browser อื่นนอกจาก Chrome
- Product categories นอกจาก physical goods

---

## Key Assumptions

- OpenAI API cost ต่อ query ≈ $0.001-0.003 (ใช้ gpt-4o-mini) — ยังไม่ verified
- Chrome Web Store อนุมัติ extension ที่มี affiliate links — ต้อง verify policy
- Price comparison data หาได้จาก third-party API หรือ scraping ที่ถูก TOS

---

## Next Step

→ **ce-plan:** วางแผน implementation แบบละเอียด (milestones, tech decisions, file structure)
