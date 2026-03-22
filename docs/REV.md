# Vehicle Contact App - Revenue Model

## 1. Revenue Streams Overview

| Stream | Type | Priority |
|--------|------|----------|
| Physical Tags | One-time | P0 |
| Subscriptions | Recurring | P0 |
| Enterprise Plans | Recurring | P1 |

---

## 2. Pricing Tiers

### 2.1 Individual Plans

#### FREE PLAN
**Price:** Free forever

**Includes:**
- 1 vehicle registration
- Downloadable printable eTag
- 5 masked calls/month
- In-app messaging (unlimited)
- Push notifications
- 7-day contact history

**Limitations:**
- No WhatsApp masking
- No SMS notifications
- No multiple vehicles

---

#### PREMIUM PLAN
**Price:** AED 29/month or AED 290/year (save 17%)

**Includes Everything in Free +**
- Up to 3 vehicles
- Unlimited masked calls
- SMS notifications
- WhatsApp Business relay
- 90-day contact history
- Emergency profile (advanced)
- Ad-free experience

---

#### FAMILY PLAN
**Price:** AED 49/month or AED 490/year

**Includes Everything in Premium +**
- Up to 10 vehicles
- 5 family member accounts
- Shared vehicle management

---

### 2.2 Enterprise Plans

#### STARTER FLEET
**Price:** AED 599/month (billed annually)

- Up to 25 vehicles
- 10 driver accounts
- 3 supervisor accounts
- Fleet dashboard
- Email support

---

#### BUSINESS FLEET
**Price:** AED 1,999/month (billed annually)

- Up to 100 vehicles
- Unlimited drivers
- 10 supervisors
- Advanced analytics
- Dedicated account manager

---

## 3. Physical Tag Pricing

| Tag Type | Price | Cost | Margin |
|----------|-------|------|--------|
| Printable eTag (PDF) | Free | AED 0 | N/A |
| Laminated Sticker | AED 49 | AED 12 | 75% |
| Premium Holographic | AED 99 | AED 25 | 75% |

**Tag Ordering Flow:**
1. User completes vehicle registration
2. Prompt: "Activate your vehicle with a tag"
3. Show tag options
4. One-click checkout
5. Delivery in 3-5 days

---

## 4. Payment Gateway Integration

### 4.1 Recommended: Stripe

**Why Stripe:**
- Excellent Middle East support (UAE, KSA)
- Subscription management built-in
- 135+ currencies
- PCI compliance handled

**Checkout Flow:**

```
1. User selects plan
2. App calls: POST /payments/create-checkout
3. Backend creates Stripe Checkout Session
4. App opens Stripe checkout (web view)
5. User completes payment
6. Stripe webhook → Backend provisions subscription
7. App shows success
```

### 4.2 Supported Payment Methods

| Method | Provider | Priority |
|--------|----------|----------|
| Credit/Debit Cards | Stripe | P0 |
| Apple Pay | Stripe | P0 |
| Google Pay | Stripe | P1 |
| Tabby (BNPL) | Tabby | P1 |

### 4.3 Subscription Billing States

```
TRIAL_ACTIVE → ACTIVE → PAST_DUE → CANCELED
                  ↓
               PAUSED
```

**Failed Payment Retry:**
- Day 0: Retry immediately
- Day 3: Retry + email notification
- Day 7: Final retry + SMS warning
- Day 10: Cancel subscription

---

## 5. Regional Pricing

| Country | Premium/Month | Premium/Year |
|---------|---------------|--------------|
| UAE | AED 29 | AED 290 |
| Saudi Arabia | SAR 29 | SAR 290 |
| Qatar | QAR 29 | QAR 290 |

**Tax Compliance:**

| Country | VAT Rate |
|---------|----------|
| UAE | 5% |
| Saudi Arabia | 15% |
| Qatar | 0% |

---

## 6. Key Metrics

### Target KPIs

| Metric | Target |
|--------|--------|
| Free-to-paid conversion | 10-15% |
| Monthly churn (paid) | < 5% |
| Tag purchase rate | 30% of users |
| LTV:CAC ratio | 3:1 |

### Unit Economics

**Per Premium User (Year 1):**
```
Revenue: AED 290
Costs:
- Payment processing (3%): AED 9
- Masked calls (10 calls × AED 2): AED 20
- SMS (20 × AED 0.50): AED 10
- Infrastructure: AED 5
Total Costs: AED 44
Gross Profit: AED 246
Gross Margin: 85%
```

---

## 7. Implementation Roadmap

### Phase 1: MVP (Month 1-3)
- Free plan with limitations
- Premium individual plan
- Stripe integration
- Basic eTag ordering

### Phase 2: Growth (Month 4-6)
- Family plan
- Enterprise starter
- Apple Pay / Google Pay
- Laminated tag ordering

### Phase 3: Scale (Month 7-12)
- Full enterprise features
- BNPL integration
- Volume discounts

---

## 8. Freemium Strategy

**Goal:** Maximize user acquisition, convert 10-15% to paid

**Free Plan Purpose:**
- Build user base
- Prove product value
- Create network effects (more tags = more scanners)

**Conversion Triggers:**
- Need 2nd vehicle → Upgrade prompt
- Hit 5 call limit → Paywall
- Want WhatsApp masking → Premium feature

**Best Practice:**
- Don't paywall too early (let users experience value first)
- Show clear upgrade benefits at friction points
- Offer 14-day free trial for Premium (no credit card required)
