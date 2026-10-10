# Email setup and verification

CareerFound sends account email (verification, password reset, request confirmations) through Resend. This page is what has to be true for those emails to arrive, how to read a failure, and how to test it.

## Why people saw "We could not send the verification email"

The API refuses to send when production is not configured for email. In production with `EMAIL_PROVIDER=console` (the default) it logs `EMAIL NOT SENT` and returns an error, because the alternative is telling people an email was sent when it was not. Resend also refuses to send from a domain it has not verified. Both are configuration, not a bug in the signup flow.

## What to set on the API service

| Variable | Value |
| --- | --- |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | A "Sending access" API key created in Resend. Keep it in the host's secret store only. |
| `EMAIL_FROM_NAME` | `CareerFound` |
| `EMAIL_FROM_ADDRESS` | An address on a domain verified in Resend, for example `no-reply@mycareerfound.com` |
| `EMAIL_REPLY_TO` | A mailbox someone reads, for example `hello@mycareerfound.com` |
| `PUBLIC_APP_URL` | The public site, for example `https://www.mycareerfound.com`. Emailed links are built from it. |
| `FRONTEND_ORIGIN` | The same site(s), comma separated, for CORS |

On startup the API logs `CONFIGURATION PROBLEM: ...` for each missing or wrong value, so check the deploy log after changing anything.

## Verify the sending domain

1. In Resend, open Domains, add the domain, and copy the DNS records it shows (SPF, DKIM and the return path).
2. Publish them where the domain's DNS is hosted. The domain must be using working nameservers. If the registrar shows a verification hold, finish the registrar's contact verification first, or no DNS record can be published.
3. Wait until Resend shows the domain as Verified, then redeploy or restart the API.

Until the domain is verified, Resend answers every send with a 403 "domain is not verified". The API logs this as `EMAIL NOT SENT [sender_domain_unverified]`.

## Reading the logs

Every failure is logged once with a reason in square brackets and the recipient masked:

| Reason | Meaning | Fix |
| --- | --- | --- |
| `not_configured` | Provider is `console`, or the API key is empty | Set the variables above |
| `invalid_api_key` | Key is wrong, revoked or restricted | Create a new Sending access key |
| `sender_domain_unverified` | `EMAIL_FROM_ADDRESS` is on a domain Resend has not verified | Verify the domain |
| `recipient_restricted` | Resend is in testing mode and only delivers to the account owner | Verify a domain |
| `rate_limited` | Resend plan limit reached | Slow down or upgrade |
| `address_rejected` | Resend rejected the recipient or payload | Person should check the address |
| `provider_unavailable`, `network_error` | Passing outage | Retry later |

A successful send logs `Email accepted by Resend (id=...)`. Accepted means Resend took the message. It does not mean it reached an inbox, and the app never says it did.

## What people see

- The banner and the Verify your email page (`/verify-pending`) show the address masked, where to look (inbox, spam, Promotions), a Resend button with a 60 second cooldown, and a way to change a mistyped address (needs the current password).
- If the service is not set up, the page says so plainly and says the address is fine. Retrying stays possible.
- A failed send does not start the cooldown, and does not invalidate a link that already reached the person. A successful resend replaces older links.
- Links last 48 hours. An expired, replaced, already used or invalid link each gets its own message on `/verify-email`.
- Accounts can use CareerFound before verifying. Verification does not gate access.

## Test it

1. Sign up with an address you can read. The API log should show `Email accepted by Resend`.
2. Open the email, check the sender name and address, and click the button. It must land on `/verify-email` on the real domain and show "Email verified".
3. Open the same link again: "Already verified". Sign in again: no warning on the dashboard.
4. Request a resend twice in a row: the second is refused with a countdown.
