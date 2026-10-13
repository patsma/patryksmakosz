#!/bin/sh
# Compare the answers of two nameservers for every record of patryksmakosz.com.
# Usage: compare-zones.sh dns1.p07.nsone.net chad.ns.cloudflare.com
set -u
a="$1"; b="$2"; fail=0
ask() { dig +norecurse +noall +answer "$2" "$3" "@$1" | awk '{ $1=tolower($1); print }' | sort; }
for q in "patryksmakosz.com A" "www.patryksmakosz.com A" "patryksmakosz.com MX" \
         "patryksmakosz.com TXT" "devil._domainkey.patryksmakosz.com TXT" \
         "_dmarc.patryksmakosz.com TXT" "patryksmakosz.com AAAA" "patryksmakosz.com CAA" \
         "zzz-probe.patryksmakosz.com A"; do
  set -- $q
  ra=$(ask "$a" "$1" "$2"); rb=$(ask "$b" "$1" "$2")
  if [ "$ra" = "$rb" ]; then echo "same  $1 $2"; else echo "DIFF  $1 $2"; echo "  $a: $ra"; echo "  $b: $rb"; fail=1; fi
done
spf=$(dig +short TXT patryksmakosz.com "@$b" | grep -c 'v=spf1')
[ "$spf" = "1" ] || { echo "DIFF  apex carries $spf SPF records on $b, want exactly 1"; fail=1; }
exit $fail
