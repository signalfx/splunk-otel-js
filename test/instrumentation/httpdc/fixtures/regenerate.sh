#!/usr/bin/env sh
#
# Certs are generated with a one year expiry, so periodic regen is required.
#
# Usage: npm run maint:regenerate-test-certs

openssl req -x509 -nodes -newkey rsa -keyout server-key.pem -out server-cert.pem -days 3650 -subj "/C=CL/ST=RM/L=OpenTelemetryTest/O=Root/OU=Test/CN=ca"
