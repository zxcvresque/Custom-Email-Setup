## How it works

| Service | What it does |
| --- | --- |
| <img src="assets/cloudflare.png" alt="" height="16"> **Cloudflare Email Routing** | Receives mail for your domain and forwards it to your inbox. |
| <img src="assets/smtp2go.png" alt="" height="16"> **SMTP2GO** | Sends mail from your verified domain through an SMTP relay. |
| <img src="assets/gmail.png" alt="" height="16"> **Gmail** or <img src="assets/outlook.png" alt="" height="16"> **Outlook** | Your destination inbox. Use an email client that supports external SMTP to send from your custom address. |

**Incoming:** sender → your custom address → forwarding → your inbox.

**Outgoing:** your email client → authenticated SMTP relay → recipient.

Have a domain you own, your registrar login, an inbox you can verify, and an account with the sending provider ready. Domain registration or renewal may cost money. There is no server to run.

## Free SMTP relay plans

The guide uses <img src="assets/smtp2go.png" alt="" height="14"> **SMTP2GO**. Compare these free options if you need a different allowance.

| SMTP relay | Daily cap | Monthly allowance | Notes |
| --- | --- | --- | --- |
| <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO](https://support.smtp2go.com/hc/en-gb/articles/223087947-Free-Plan) | 200 | 1,000 | Used in this guide |
| <img src="assets/resend.png" alt="" height="14"> [Resend](https://resend.com/pricing) | 100 | 3,000 | Inbound mail through its own service shares the transactional quota |
| <img src="assets/mailjet.png" alt="" height="14"> [Mailjet](https://www.mailjet.com/pricing/) | 200 | 6,000 | Free plan has a 1,000-contact limit |
| <img src="assets/mailgun.png" alt="" height="14"> [Mailgun](https://www.mailgun.com/pricing/) | 100 | About 2,800 to 3,100 | Based on daily use. No separate monthly limit listed |
| <img src="assets/brevo.png" alt="" height="14"> [Brevo](https://www.brevo.com/products/transactional-email/) | 300 | About 8,400 to 9,300 | Based on daily use. Transactional sending may require activation |
| <img src="assets/mailersend.svg" alt="" height="14"> [MailerSend](https://www.mailersend.com/help/plans-features-and-limits) | 100 | 500 | Free sending requires approval |

Daily and monthly caps both apply where specified. Prices, allowances, and approval rules can change. Check the linked plans and confirm they support the kind of email you send.

The general process is similar across providers. Verify your domain, add the provider's DNS records, then enter its SMTP credentials in your client. For another relay, use its documentation or ask ChatGPT or another AI assistant to help adapt the steps. Confirm the settings in the provider's dashboard.

### When you need more volume

| Volume | Services to compare | Estimated monthly cost |
| --- | --- | --- |
| Up to 1,000 | <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO Free](https://www.smtp2go.com/pricing/) | $0 |
| Up to 10,000 | <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO Starter](https://www.smtp2go.com/pricing/) | About $15 |
| Up to 50,000 | <img src="assets/resend.png" alt="" height="14"> [Resend](https://resend.com/pricing) or <img src="assets/brevo.png" alt="" height="14"> [Brevo](https://www.brevo.com/pricing/) | Check current pricing for your volume |
| 100,000 or more | <img src="assets/Postmark.svg" alt="" height="14"> [Postmark](https://postmarkapp.com/pricing) or <img src="assets/sendgrid.png" alt="" height="14"> [SendGrid](https://sendgrid.com/pricing/) | Check current pricing for your volume |

**Pricing note.** These estimates may be out of date. Check the linked pages for current rates and sending allowances. You can keep the same address and inbound forwarding when switching your outbound relay.

## Connect your domain

1. Open the <img src="assets/cloudflare.png" alt="" height="14"> [Cloudflare dashboard](https://dash.cloudflare.com), add your domain, and choose the Free plan.
2. Review the imported DNS records. Keep the records your website or other services still need.
3. Replace your domain's nameservers at your registrar with the two nameservers shown in your dashboard.

   <img src="assets/godaddy.png" alt="" height="14"> **GoDaddy**: My Products → DNS → Nameservers → Change → Enter my own nameservers

   <img src="assets/namecheap.png" alt="" height="14"> **Namecheap**: Domain List → Manage → Nameservers → Custom DNS

4. Wait until your domain is active before continuing. Nameserver changes can take time to propagate.

## Route incoming mail

1. In the <img src="assets/cloudflare.png" alt="" height="14"> **Cloudflare** dashboard, open **Email → Email Routing**. Add your destination inbox and click the verification link sent to it.
2. Under **Routing rules**, create `hello@yourdomain.com` and choose **Send to an email** with the verified inbox as its destination.
3. Enable Email Routing and add the DNS records shown in the dashboard. If the domain already receives mail through another service, review its existing MX records before switching.
4. Send a test message from a different account to `hello@yourdomain.com`.

Repeat the rule for aliases such as `info@` or `support@`. Enable a **catch-all** if you also want to receive messages to unmatched addresses. See the <img src="assets/cloudflare.png" alt="" height="14"> [Cloudflare Email Routing docs](https://developers.cloudflare.com/email-routing/).

## Set up the SMTP relay

1. Create an <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO account](https://app.smtp2go.com) and open **Sending → Verified Senders → Sender Domains**.
2. Add your domain. Copy the CNAME names and targets shown in the dashboard into your DNS settings, including the sender and DKIM records. Add the tracking record if you plan to use it.
3. Set these email records to **DNS only**. Return to **Sender Domains** and wait for **Verified**.
4. Open **SMTP Users**, create a user, and save its username and password for your email client.

Use the exact DNS values from your account. The relay generates those values for your domain. See the <img src="assets/smtp2go.png" alt="" height="14"> [SMTP2GO setup guide](https://support.smtp2go.com/hc/en-gb/articles/12747932085145-Quick-Start-Guide).

## Send from your inbox

### <img src="assets/gmail.png" alt="" height="16"> Gmail on the web

1. Open **Settings → See all settings → Accounts and Import → Send mail as → Add another email address**.
2. Enter your display name and `hello@yourdomain.com`. Keep **Treat as an alias** selected for this setup.
3. Enter the SMTP settings below and submit. Open the confirmation email forwarded to your inbox and confirm the address.
4. In a new message, open the **From** menu and choose your custom address.

### <img src="assets/outlook.png" alt="" height="16"> Outlook, Apple Mail, or another email client

Client support varies. Use these settings if your client lets you configure an external outgoing SMTP server for your custom address. Forwarding provides an inbox destination, so the custom address itself has no IMAP credentials.

```text
SMTP server  mail.smtp2go.com
Port         587 with STARTTLS, or 465 with implicit TLS
Username     SMTP user created in the relay dashboard
Password     Password for that SMTP user
```

The SMTP password comes from the relay. For browser setup, see <img src="assets/gmail.png" alt="" height="14"> [Gmail's Send mail as instructions](https://support.google.com/mail/answer/22370).

## Add DMARC

**Optional for basic forwarding and low-volume sending, but recommended.** DMARC helps protect your address against spoofing. It checks that at least one passing SPF or DKIM check matches the domain in the visible From address, then tells receiving mail servers how to handle messages that fail. Bulk senders must publish DMARC for services such as [Gmail](https://support.google.com/mail/answer/81126) and [Yahoo](https://senders.yahooinc.com/best-practices/).

1. In the <img src="assets/cloudflare.png" alt="" height="14"> **Cloudflare** dashboard, choose your domain and open **DNS → Records**. Search for `_dmarc` first. If you already have a record, review and edit it in place only if needed. Keep your existing enforcement policy unless you intend to change it.
2. If there is no record, choose **Add record** and enter these values. Leave **TTL** on **Auto** and save.

| DNS field | Example |
| --- | --- |
| Type | `TXT` |
| Name | `_dmarc` |
| Value | `v=DMARC1; p=none` |

3. **Optional reports.** If you want aggregate reports, first create a working address such as `dmarc@yourdomain.com`. Then append `; rua=mailto:dmarc@yourdomain.com` to the same TXT record, using your own domain.
4. Send a test message from your custom address to another inbox. Open the received message's full headers and check for `dmarc=pass`.

`p=none` asks receivers to apply no additional action for DMARC failures. After you verify that all legitimate senders pass, you can tighten the policy to `p=quarantine` or `p=reject`. See <img src="assets/cloudflare.png" alt="" height="14"> [Cloudflare's DMARC guide](https://www.cloudflare.com/learning/dns/dns-records/dns-dmarc-record/).

## Test both directions

1. **Receive.** From another account, send to your custom address and confirm it reaches your destination inbox.
2. **Send.** Compose from your custom address to another inbox and confirm the visible **From** address.
3. **Check authentication.** Open the received message's full headers and look for SPF, DKIM, and DMARC results. You can also send a message to [Mail Tester](https://www.mail-tester.com/) or inspect DNS with [MXToolbox](https://mxtoolbox.com/SuperTool.aspx).

## Add a profile picture

**Optional, for <img src="assets/gmail.png" alt="" height="14"> Gmail.** Once both tests pass, create a personal Google Account using your custom address to associate it with a Google profile picture.

1. Open [Google Accounts](https://accounts.google.com/) in a private window if you're already signed in. Choose **Create account → For my personal use**.
2. Select **Use your existing email** and enter `hello@yourdomain.com`.
3. Open the verification message in the inbox that receives your forwarded mail, enter the code, and finish signup.
4. Sign in at [My Google Account](https://myaccount.google.com/) with your custom address. Click your profile picture or initial, upload a photo, and save it.

The separate Google Account manages the custom address's profile. Continue sending and receiving in the <img src="assets/gmail.png" alt="" height="14"> **Gmail** inbox configured earlier, whether you already had it or created it for this setup. Picture visibility can vary by recipient and can take time to update. See [Google Account Help](https://support.google.com/accounts/answer/27441) and [profile visibility settings](https://support.google.com/accounts/answer/6304920).

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
<p>Yes, if you already own the domain. Free forwarding can deliver mail to your existing inbox, and a free SMTP relay can send replies from your custom address within its limits. Domain registration and renewal may still cost money.</p>
</details>

<details>
<summary>Routing shows missing DNS records</summary>
<p>Open <strong>Email Routing → Settings</strong> and review the required records. Check for MX records from an old mail service before switching.</p>
</details>

<details>
<summary>Forwarded messages are missing</summary>
<p>Check that routing is active, the destination is verified, and the address matches a rule. Check Spam and review the routing activity log for rejection details.</p>
</details>

<details>
<summary>The SMTP relay rejects the sender address</summary>
<p>In the <img src="assets/smtp2go.png" alt="" height="14"> <strong>SMTP2GO</strong> dashboard, confirm that the sender domain is verified and matches the address in your client's From field.</p>
</details>

<details>
<summary>The send-as verification email never arrived</summary>
<p>Complete the inbound test first. Then retry verification and check Spam in the destination inbox.</p>
</details>

<details>
<summary>The sender CNAMEs will not verify</summary>
<p>Check the names and targets against the relay dashboard. Set the records to DNS only and allow time for DNS propagation.</p>
</details>
