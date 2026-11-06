#!/usr/bin/env bash
# Uso: BASE_URL=https://<app>.azurewebsites.net ./run-concurrent.sh [function] [nth] [concurrencia]
set -u
cd "$(dirname "$0")"

FUNCTION_NAME=${1:-Fibonacci}
NTH=${2:-1000000}
CONCURRENCY=${3:-10}
OUT="results/${FUNCTION_NAME}-${NTH}-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"

pids=()
for i in $(seq 1 "$CONCURRENCY"); do
    npx --yes newman run Fibonacci.postman_collection.json \
        --env-var "baseUrl=$BASE_URL" \
        --env-var "functionName=$FUNCTION_NAME" \
        --env-var "nth=$NTH" \
        --timeout-request 300000 \
        --reporters json --reporter-json-export "$OUT/run-$i.json" \
        > "$OUT/run-$i.log" 2>&1 &
    pids+=($!)
done

failed=0
for pid in "${pids[@]}"; do
    wait "$pid" || failed=$((failed + 1))
done

echo "$CONCURRENCY ejecuciones, $failed fallidas. Resultados en postman/$OUT"
node summarize.js "$OUT"
