# Mail before the zone move

Taken on 2026-10-13 while `patryksmakosz.com` was still delegated to the Netlify nameservers
(`dns1-4.p07.nsone.net`). Task 5 of the phase 5 plan repeats both tests after the move.

## Inbound

- 12:22 CEST: 0 files in the mailbox newer than 2026-10-13 00:00
- 12:24:48 CEST: sent from the Gmail account to `me@patryksmakosz.com`, subject `dns-move before`
- 12:25 CEST: delivered on MyDevil as
  `new/1791887105.M25612P18754.s18.mydevil.net` (8348 bytes), headers match sender, recipient
  and subject. Under one minute from send to delivery

## Outbound

- 12:25:35 CEST: sent from `me@patryksmakosz.com` (Gmail "Send mail as") to mail-tester, subject
  `dns-move before`, two sentences plus the normal signature
- Received by mail-tester at 10:25:51 UTC from `cache18.mydevil.net [85.194.241.97]`
- Result id: `test-uf7923wiz`
- Score: 8.9/10

| Check | Verdict | Detail |
|---|---|---|
| SPF | pass | mailfrom `me@patryksmakosz.com`, client 85.194.241.97 |
| DKIM | pass | `d=patryksmakosz.com`, selector `devil`, rsa-sha256, 1024-bit key |
| DMARC | pass | `p=none`, `header.from=patryksmakosz.com` |

The 1.1 points off are all content, none DNS: SpamAssassin `HTML_IMAGE_ONLY_24` (1.3, a short body
next to the signature image). The 10/10 on 2026-10-09 was a longer message. The after-test uses
the same body so the two scores compare like for like.
