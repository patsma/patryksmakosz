# Phase 5 outcome: site gone from Netlify, zone still there

2026-10-13. The plan is `docs/superpowers/plans/2026-10-13-leave-netlify.md`.

## Done

- Mail proven on the Netlify nameservers (`2026-10-13-mail-before.md`)
- Netlify site `tasty-sites-2025` deleted, its GitHub webhook and deploy key removed, `netlify.toml` removed
- Checked after the delete: the Netlify DNS zone still holds its six records, `patryksmakosz.com` answers 200
  from MyDevil, `node scripts/deploy.mjs production --check` is 13/13

## Not done, and why

The plan assumed the domain sits in a name.com account. It does not: it was registered through Netlify
(`uses_netlify_registrar: true`, 2025-08-21), and name.com is only the registrar Netlify resells. The Netlify
dashboard shows the four nameservers read-only. Its "Transfer domain" section gives the only way out:

1. Have a name.com account with verified contact details (Account Contacts, Update)
2. Contact Netlify support with the name.com Account Code; they move the domain into that account
3. Change the nameservers there

Cloudflare Registrar cannot take the domain directly, it wants an active zone first.

## Decision, 2026-10-13: the domain stays at Netlify

No support request is sent and the nameservers do not change. The renewal through Netlify is cheap and
editing records in the Netlify zone is enough. Tasks 4 and 5 of the plan are dropped. The three steps
above stay here only as the way out if that ever changes.

## Left in place

- A Cloudflare zone for the domain, status pending, with the same six records (compared with
  `compare-zones.sh`: all four Netlify nameservers against both Cloudflare ones, no difference). It serves
  nobody and has no purpose after the decision above. It is left for Cloudflare to remove
- The Netlify DNS zone. Do not delete it: the domain is delegated to it
- About a hundred other sites in the same Netlify account, many linked from `content/projects/`
