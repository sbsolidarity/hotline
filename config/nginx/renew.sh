#!/bin/bash

set -e

BASE="/home/snake"

python "$BASE"/acme-tiny/acme_tiny.py --account-key "$BASE"/tls/user.key --csr "$BASE"/tls/sbsolidarity.csr --acme-dir /var/www/.well-known/acme-challenge > "$BASE"/tls/sbsolidarity.crt

cat "$BASE"/tls/sbsolidarity.crt /etc/pki/tls/certs/lets-encrypt-x3-cross-signed.pem > /etc/pki/tls/certs/sbsolidarity.pem
