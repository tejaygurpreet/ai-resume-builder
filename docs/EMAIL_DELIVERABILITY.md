# Email deliverability (OptimaCV + Resend)

## 1. DNS & Resend (optimacv.io)

In **Resend → Domains → optimacv.io**, add and verify:

| Record | Purpose |
|--------|---------|
| **SPF** | Authorizes Resend to send on behalf of your domain. |
| **DKIM** | Cryptographic signature proving message integrity. |
| **DMARC** | Policy for how receivers handle SPF/DKIM failures; start with `p=none` or `quarantine`, then tighten. |

Until all records show **Verified**, some providers may junk or delay mail.

## 2. Code (this repo)

- **From:** `OptimaCV Support <support@optimacv.io>` by default (`RESEND_FROM` overrides).
- **Footer:** Set `COMPANY_LEGAL_ADDRESS` (multiline) in `.env` for your registered business address.
- **Transactional template:** HTML + plain text, inline brand mark (no remote image), legal block, preferences link, `List-Unsubscribe` URL → `/email-preferences`.
- **Headers:** `List-Unsubscribe`, `Auto-Submitted: auto-generated` (transactional).  
  **Do not** set `Precedence: bulk` on password-reset or other transactional mail—it signals mailing-list traffic and can hurt inbox placement. Resend sets **Date** and **Message-ID** at send time; you normally do not set these in app code.

## 3. Reputation & volume

- **Warm-up:** Increase send volume gradually on a new domain or IP.
- **Engagement:** Mail engaged users first; avoid sudden spikes to cold lists.
- **Resend dashboard:** Watch bounces and spam complaints; remove hard bounces promptly (keep bounces &lt; ~2% where possible).

## 4. Recipients (Gmail, Outlook, iCloud)

- Ask users to **add `support@optimacv.io` / `noreply@optimacv.io` to contacts** and move messages from Promotions/Spam to Primary when needed.
- **Primary tab:** There is no reliable HTML “force Primary” mechanism; reputation and user actions matter most.

## 5. Monitoring

- Use Resend analytics for delivery, bounces, and complaints.
- Optionally use [Google Postmaster Tools](https://postmaster.google.com/) for Gmail visibility once you send enough volume.
