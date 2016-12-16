#!/bin/bash

set -e

BASE=${BASE:-$HOME}

python "$BASE"/acme-tiny/acme_tiny.py --account-key "$BASE"/tls/user.key --csr "$BASE"/tls/request.csr --acme-dir /var/www/.well-known/acme-challenge > "$BASE"/tls/certificate.pem

cat "$BASE"/tls/certificate.pem /etc/pki/tls/certs/lets-encrypt-x3-cross-signed.pem > /etc/pki/tls/certs/chained_cert.pem
