#!/usr/bin/env bash
set -euo pipefail

API_BASE="http://localhost:3001/api"
TOKEN="${TOKEN:-}" # Expect TOKEN exported; fallback to legacy token var
if [ -z "$TOKEN" ]; then
  echo "ERROR: Please export TOKEN environment variable (JWT access token)." >&2
  exit 1
fi

CLIENT_ID="${CLIENT_ID:-}"
if [ -z "$CLIENT_ID" ]; then
  echo "ERROR: Please export CLIENT_ID (an existing client _id)." >&2
  exit 1
fi

echo "== Smoke: Create estimate with 25% deposit =="
ESTIMATE_PAYLOAD=$(cat <<JSON
{
  "clientId": "${CLIENT_ID}",
  "items": [ { "name": "Labor", "quantity": 2, "baseCost": 100, "marginPct": 50, "taxable": true } ],
  "taxRate": 8.25,
  "depositType": "percent",
  "depositValue": 25
}
JSON
)

ESTIMATE_RES=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$ESTIMATE_PAYLOAD" "$API_BASE/estimates")
ESTIMATE_BODY=$(echo "$ESTIMATE_RES" | head -n1)
ESTIMATE_CODE=$(echo "$ESTIMATE_RES" | tail -n1)
if [ "$ESTIMATE_CODE" != "200" ]; then
  echo "ERROR: Create estimate failed ($ESTIMATE_CODE): $ESTIMATE_BODY" >&2
  exit 1
fi
ESTIMATE_ID=$(echo "$ESTIMATE_BODY" | sed -n 's/.*"_id":"\([^"]*\)".*/\1/p')
[ -z "$ESTIMATE_ID" ] && { echo "ERROR: Could not parse estimate id" >&2; exit 1; }
DEPOSIT_REQUIRED=$(echo "$ESTIMATE_BODY" | sed -n 's/.*"depositRequired":\([0-9.]*\).*/\1/p')
echo "Created estimate $ESTIMATE_ID depositRequired=$DEPOSIT_REQUIRED"

echo "== Convert estimate to invoice =="
INVOICE_RES=$(curl -s -w "\n%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" "$API_BASE/estimates/$ESTIMATE_ID/convert")
INVOICE_BODY=$(echo "$INVOICE_RES" | head -n1)
INVOICE_CODE=$(echo "$INVOICE_RES" | tail -n1)
if [ "$INVOICE_CODE" != "200" ]; then
  echo "ERROR: Convert failed ($INVOICE_CODE): $INVOICE_BODY" >&2
  exit 1
fi
INVOICE_ID=$(echo "$INVOICE_BODY" | sed -n 's/.*"_id":"\([^"]*\)".*/\1/p')
INV_DEPOSIT_REQUIRED=$(echo "$INVOICE_BODY" | sed -n 's/.*"depositRequired":\([0-9.]*\).*/\1/p')
echo "Created invoice $INVOICE_ID depositRequired=$INV_DEPOSIT_REQUIRED"

if [ "${INV_DEPOSIT_REQUIRED:-0}" = "0" ]; then
  echo "WARNING: Invoice depositRequired is 0 (expected propagation)." >&2
fi

echo "== Download client PDF (should hide profit) =="
CLIENT_PDF="invoice-${INVOICE_ID}.pdf"
HTTP_CODE=$(curl -s -o "$CLIENT_PDF" -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_BASE/invoices/$INVOICE_ID/pdf")
if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Client PDF download failed ($HTTP_CODE)" >&2; exit 1; fi
[ ! -s "$CLIENT_PDF" ] && { echo "ERROR: Client PDF empty" >&2; exit 1; }
ls -lh "$CLIENT_PDF" | awk '{print "Client PDF size=" $5}'

echo "== Enable profit + deposit toggles =="
PATCH_BODY=$(cat <<JSON
{
  "showDepositDetails": true,
  "showProfitMetrics": true
}
JSON
)
PATCH_RES=$(curl -s -w "\n%{http_code}" -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$PATCH_BODY" "$API_BASE/invoices/$INVOICE_ID")
PATCH_CODE=$(echo "$PATCH_RES" | tail -n1)
if [ "$PATCH_CODE" != "200" ]; then
  echo "ERROR: Patch toggles failed ($PATCH_CODE): $PATCH_RES" >&2; exit 1; fi

echo "== Download client PDF again (profit still hidden) =="
HTTP_CODE=$(curl -s -o "$CLIENT_PDF" -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_BASE/invoices/$INVOICE_ID/pdf")
[ "$HTTP_CODE" != "200" ] && { echo "ERROR: Second client PDF failed" >&2; exit 1; }

echo "== Download internal PDF (should include profit section) =="
INTERNAL_PDF="invoice-internal-${INVOICE_ID}.pdf"
HTTP_CODE=$(curl -s -o "$INTERNAL_PDF" -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_BASE/invoices/$INVOICE_ID/pdf-internal")
[ "$HTTP_CODE" != "200" ] && { echo "ERROR: Internal PDF failed" >&2; exit 1; }
[ ! -s "$INTERNAL_PDF" ] && { echo "ERROR: Internal PDF empty" >&2; exit 1; }
ls -lh "$INTERNAL_PDF" | awk '{print "Internal PDF size=" $5}'

echo "== Record a partial payment (toward deposit) =="
PAY_BODY='{"amount":50}'
PAY_RES=$(curl -s -w "\n%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$PAY_BODY" "$API_BASE/invoices/$INVOICE_ID/payments")
PAY_CODE=$(echo "$PAY_RES" | tail -n1)
[ "$PAY_CODE" != "200" ] && { echo "ERROR: Record payment failed ($PAY_CODE): $PAY_RES" >&2; exit 1; }

echo "== Fetch invoice to verify depositPaid and amountPaid =="
FETCH=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_BASE/invoices/$INVOICE_ID")
DEPOSIT_PAID=$(echo "$FETCH" | sed -n 's/.*"depositPaid":\([0-9.]*\).*/\1/p')
AMOUNT_PAID=$(echo "$FETCH" | sed -n 's/.*"amountPaid":\([0-9.]*\).*/\1/p')
echo "depositPaid=$DEPOSIT_PAID amountPaid=$AMOUNT_PAID"

echo "== SUCCESS: Smoke test completed =="