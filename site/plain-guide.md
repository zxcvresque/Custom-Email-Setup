## Before you start

This guide is for someone who owns a domain, can change its DNS settings at the registrar, and has a personal <img src="assets/gmail.png" alt="" height="14"> Gmail account. The recommended setup uses one Gmail inbox with a custom address.

<details>
<summary>Don’t have these yet? See what to prepare</summary>

- **A domain:** Register one with a registrar such as <img src="assets/namecheap.png" alt="" height="14"> [Namecheap](https://www.namecheap.com/domains/). The domain can have a yearly cost. You need access to its DNS settings. Ask its owner or administrator for access if needed.
- **A protected registrar account:** Turn on two-step verification in the registrar’s security settings before changing DNS.
- **Cloudflare:** Create a free <img src="assets/cloudflare.png" alt="" height="14"> [Cloudflare account](https://dash.cloudflare.com), add your domain, then follow [Connect your domain](#connect-your-domain) below to update nameservers and check DNS.
- **A personal Gmail inbox:** Use your current <img src="assets/gmail.png" alt="" height="14"> Gmail account, or [create one](https://accounts.google.com/) with **Create account → For my personal use**. This is where forwarded messages will arrive.

</details>

## What’s the benefit?

- **Use your business name in your email.** For example, `hello@yourbusiness.com`.
- **Use several addresses.** Try `hello@`, `info@`, and `support@` for different needs.
- **Read everything in one place.** Send all those messages to the inbox you already use.
- **Reply as your business.** Customers see your business address in your reply.
- **Keep your personal email private.** Use your business address on your website and invoices.
- **Keep your address if you switch services.** It belongs to your domain.
- **Use free email plans.** You may pay nothing extra within the limits. Your domain renewal can still cost money.

## How it works

| Service | What it does |
| --- | --- |
| <img src="assets/cloudflare.png" alt="" height="16"> **Cloudflare Email Routing** | Forwards mail sent to your domain into your inbox. |
| <img src="assets/smtp2go.png" alt="" height="16"> **SMTP2GO** | Sends replies from your custom address. |
| <img src="assets/gmail.png" alt="" height="16"> **Gmail** or <img src="assets/outlook.png" alt="" height="16"> **Outlook** | Your inbox. Gmail is used in this guide to send from your custom address. |

**Incoming:** mail goes to your address, then to your inbox.

**Outgoing:** your inbox sends through the relay to the recipient.

Think of DNS as the internet’s phone book. Its records tell services where your website and email should go. Changing nameservers tells the internet which DNS provider to ask.

Have your domain login, your inbox, and an SMTP2GO account ready. You do not need to run a server.

## Why keep Gmail?

<img src="assets/gmail.png" alt="" height="14"> **Gmail stays your familiar inbox.** Cloudflare forwards your custom addresses there, so you can read mail in one place. Gmail includes spam filtering, search, and the tools you already know. People see your custom address when you reply through the relay.

## Free SMTP relay plans

This guide uses <img src="assets/smtp2go.png" alt="" height="14"> **SMTP2GO**. The table lists other free options too.

| SMTP relay | Daily cap | Monthly allowance | Notes |
| --- | --- | --- | --- |
| <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO](https://support.smtp2go.com/hc/en-gb/articles/223087947-Free-Plan) | 200 | 1,000 | Used in this guide |
| <img src="assets/resend.png" alt="" height="14"> [Resend](https://resend.com/pricing) | 100 | 3,000 | Inbound mail through its own service shares the transactional quota |
| <img src="assets/mailjet.png" alt="" height="14"> [Mailjet](https://www.mailjet.com/pricing/) | 200 | 6,000 | Free plan has a 1,000-contact limit |
| <img src="assets/mailgun.png" alt="" height="14"> [Mailgun](https://www.mailgun.com/pricing/) | 100 | About 2,800 to 3,100 | Based on daily use. No separate monthly limit listed |
| <img src="assets/brevo.png" alt="" height="14"> [Brevo](https://www.brevo.com/products/transactional-email/) | 300 | About 8,400 to 9,300 | Based on daily use. Transactional sending may require activation |
| <img src="assets/mailersend.svg" alt="" height="14"> [MailerSend](https://www.mailersend.com/help/plans-features-and-limits) | 100 | 500 | Free sending requires approval |

Daily and monthly limits both apply. Prices and rules can change, so check each provider's current plan.

Other relays follow similar steps: confirm your domain, add the DNS records, then enter the SMTP login in your inbox. Check the provider's instructions for its exact values.

### When you need more volume

| Volume | Services to compare | Estimated monthly cost |
| --- | --- | --- |
| Up to 1,000 | <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO Free](https://www.smtp2go.com/pricing/) | $0 |
| Up to 10,000 | <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO Starter](https://www.smtp2go.com/pricing/) | About $15 |
| Up to 50,000 | <img src="assets/resend.png" alt="" height="14"> [Resend](https://resend.com/pricing) or <img src="assets/brevo.png" alt="" height="14"> [Brevo](https://www.brevo.com/pricing/) | Check current pricing for your volume |
| 100,000 or more | <img src="assets/Postmark.svg" alt="" height="14"> [Postmark](https://postmarkapp.com/pricing) or <img src="assets/sendgrid.png" alt="" height="14"> [SendGrid](https://sendgrid.com/pricing/) | Check current pricing for your volume |

**Prices can change.** Check the linked pages for current rates. You can keep your address and incoming mail setup if you switch relays.

## Connect your domain

1. Sign in to <img src="assets/cloudflare.png" alt="" height="14"> [Cloudflare](https://dash.cloudflare.com), add your domain, and choose the Free plan.
2. Check the copied records. Keep the ones your website still needs.
3. At your domain registrar, replace the nameservers with the two shown in Cloudflare.

   <img src="assets/godaddy.png" alt="" height="14"> **GoDaddy**: My Products → DNS → Nameservers → Change → Enter my own nameservers

   <img src="assets/namecheap.png" alt="" height="14"> **Namecheap**: Domain List → Manage → Nameservers → Custom DNS

4. Wait until Cloudflare says the domain is active. This can take a while.

## Route incoming mail

1. In <img src="assets/cloudflare.png" alt="" height="14"> **Cloudflare**, open **Email → Email Routing**. Add your inbox and confirm the email it sends you.
2. Under **Routing rules**, add `hello@yourdomain.com` and choose **Send to an email** with your confirmed inbox.
3. Turn on Email Routing and add the shown DNS records. If another service handles your mail now, check its MX records first.
4. Send a test email to `hello@yourdomain.com` from another account.

Add more rules for `info@` or `support@`. A **catch-all** receives mail sent to any other address too. See the <img src="assets/cloudflare.png" alt="" height="14"> [Cloudflare Email Routing docs](https://developers.cloudflare.com/email-routing/).

## Set up the SMTP relay

1. Create an <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO account](https://app.smtp2go.com). Open **Sending → Verified Senders → Sender Domains**.
2. Add your domain. Copy the CNAME records shown into your DNS settings. The tracking record is optional.
3. Set the mail records to **DNS only**. Return to **Sender Domains** and wait for **Verified**.
4. Open **SMTP Users**, create a login, and save its username and password.

Copy the exact DNS values shown in your account. See the <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO setup guide](https://support.smtp2go.com/hc/en-gb/articles/12747932085145-Quick-Start-Guide).

## Send from your inbox

### <img src="assets/gmail.png" alt="" height="16"> Gmail on the web

1. Go to **Settings → See all settings → Accounts and Import → Send mail as → Add another email address**.
2. Enter your name and `hello@yourdomain.com`. For this one-person, one-inbox setup, keep **Treat as an alias** selected.
3. Enter the settings below. Open the confirmation email in your inbox and confirm the address.
4. When writing an email, choose your custom address from **From**.

### <img src="assets/outlook.png" alt="" height="16"> Outlook, Apple Mail, or another email client

Some email apps support these settings too. Forwarding gives you the inbox; it does not create a separate mailbox login.

```text
SMTP server  mail.smtp2go.com
Port         587 with STARTTLS, or 465 with implicit TLS
Username     SMTP user created in the relay dashboard
Password     Password for that SMTP user
```

Use the password you made in the relay. See <img src="assets/gmail.png" alt="" height="14"> [Gmail's Send mail as instructions](https://support.google.com/mail/answer/22370).

**A change to know about (checked November 11, 2026):** Google says Gmail will end **Send as** for third-party addresses in January 2027, and may limit new setups before then. This Gmail route may be affected. Forwarding to Gmail is separate; Google recommends a desktop mail client for sending through third-party accounts. Read [Google’s official notice](https://support.google.com/mail/answer/17101213).

**Optional desktop alternative — Thunderbird:** Add Gmail with **Sign in with Google**, then add `hello@yourdomain.com` as a Thunderbird identity and choose SMTP2GO for outgoing mail. Read forwarded messages in Thunderbird and reply or compose as your custom address; mail goes directly through SMTP2GO, so it does not rely on Gmail’s third-party **Send as** feature. Gmail still stores the incoming mail. See [Mozilla’s Gmail setup](https://support.mozilla.org/en-US/kb/thunderbird-and-gmail) and [identity guide](https://support.mozilla.org/en-US/kb/using-identities).

**Alias setting:** Keep **Treat as an alias** selected when you own both addresses and use the same <img src="assets/gmail.png" alt="" height="14"> Gmail inbox. That is our recommended one-Gmail setup. Uncheck it when sending on behalf of another account that receives mail separately. This setting changes how Gmail treats the address and replies; the SMTP server details stay the same. See [Google’s explanation](https://knowledge.workspace.google.com/admin/users/should-i-uncheck-treat-as-an-alias-in-gmail), then test which address appears on replies.

## Add DMARC

**Optional, but recommended.** DMARC helps stop others from pretending to send as your domain. Some large email providers require it for bulk sending, including [Gmail](https://support.google.com/mail/answer/81126) and [Yahoo](https://senders.yahooinc.com/best-practices/).

1. In <img src="assets/cloudflare.png" alt="" height="14"> **Cloudflare**, open **DNS → Records** and search for `_dmarc`. If one exists, review it before changing anything.
2. If it is missing, choose **Add record**, enter the values below, leave **TTL** as **Auto**, and save.

| DNS field | Example |
| --- | --- |
| Type | `TXT` |
| Name | `_dmarc` |
| Value | `v=DMARC1; p=none` |

3. **Optional reports.** To receive reports, first create an address such as `dmarc@yourdomain.com`. Add `; rua=mailto:dmarc@yourdomain.com` to the TXT value, using your own domain.
4. Send a test email. In its full headers, check for `dmarc=pass`.

`p=none` only monitors failures. If everything is working later, you can choose `p=quarantine` or `p=reject` for stricter protection. See <img src="assets/cloudflare.png" alt="" height="14"> [Cloudflare's DMARC guide](https://www.cloudflare.com/learning/dns/dns-records/dns-dmarc-record/).

## Test both directions

1. **Receive.** Send an email to your custom address and make sure it reaches your inbox.
2. **Send.** Reply from your custom address and make sure the recipient sees it in **From**.
3. **Check delivery.** Look for SPF, DKIM, and DMARC in the message details. You can also use [Mail Tester](https://www.mail-tester.com/), [MXToolbox](https://mxtoolbox.com/SuperTool.aspx), or [LearnDMARC](https://www.learndmarc.com/) to understand DMARC results.

## Add a profile picture

**Optional for <img src="assets/gmail.png" alt="" height="14"> Gmail.** You can associate your custom address with a Google profile in either of these ways:

- **Recommended: add it to your existing Google Account.** Open [Google Account settings](https://myaccount.google.com/), go to **Personal info → Email → Alternate emails**, add `hello@yourdomain.com`, and verify it from your inbox. This keeps one Google account for the Gmail inbox and custom address.
- **Choose a separate Google Account** if you want a separate Google identity. Go to [Google Accounts](https://accounts.google.com/), choose **Create account → For my personal use → Use your existing email**, enter `hello@yourdomain.com`, and finish verification. Then add a photo at [My Google Account](https://myaccount.google.com/).

Both options use the same mail setup; neither creates another inbox. Keep reading and sending mail in the <img src="assets/gmail.png" alt="" height="14"> Gmail inbox configured earlier. Choose one profile route: a custom address can’t be linked as an alternate email to two Google Accounts, and an address already linked to an account can’t be added again. Picture visibility can vary or take time. See [Google’s alternate-email instructions](https://support.google.com/accounts/answer/176347), [profile picture instructions](https://support.google.com/accounts/answer/27442), and [profile visibility settings](https://support.google.com/accounts/answer/6304920).

## DNS reference

| Record | Where to get its value | Purpose |
| --- | --- | --- |
| MX | <img src="assets/cloudflare.png" alt="" height="14"> **Cloudflare Email Routing** dashboard | Deliver inbound mail to the forwarding service |
| TXT / SPF | <img src="assets/cloudflare.png" alt="" height="14"> **Cloudflare Email Routing** dashboard | SPF record managed for routing |
| CNAME | <img src="assets/smtp2go.png" alt="" height="14"> **SMTP2GO** verified sender dashboard | Sender authentication, DKIM, and optional tracking |
| TXT at `_dmarc` | Your DMARC policy | Report or enforce alignment |

Keep email records DNS only. Copy account-specific DNS values from the relevant dashboard. If your root domain already publishes SPF, review the existing policy before making changes. A hostname should have only one SPF policy.

## Troubleshooting

<details>
<summary>Can I set up a custom email address for free?</summary>
<p>Yes, if you already own a domain. Free forwarding brings mail to your inbox, and a free relay lets you reply from your custom address within its limits. The domain can still cost money.</p>
</details>

<details>
<summary>Routing shows missing DNS records</summary>
<p>Open <strong>Email Routing → Settings</strong> and copy the needed records. Check for mail records from your old service before switching.</p>
</details>

<details>
<summary>Forwarded messages are missing</summary>
<p>Make sure routing is on, your inbox is confirmed, and the address matches a rule. Check Spam too.</p>
</details>

<details>
<summary>The SMTP relay rejects the sender address</summary>
<p>In <img src="assets/smtp2go.png" alt="" height="14"> <strong>SMTP2GO</strong>, make sure your domain is verified and matches the address you send from.</p>
</details>

<details>
<summary>The send-as verification email never arrived</summary>
<p>First confirm that incoming mail works. Then try again and check Spam.</p>
</details>

<details>
<summary>The sender CNAMEs will not verify</summary>
<p>Compare the records with the relay dashboard, choose DNS only, and give the changes time to work.</p>
</details>
