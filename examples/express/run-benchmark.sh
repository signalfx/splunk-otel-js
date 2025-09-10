#!/bin/bash

# Default number of repetitions
REPEAT=${1:-15}
RESULT_FILE="benchmark-results.txt"
TMP_FILE="tmp-benchmark-output.txt"

# Clear result files
> "$RESULT_FILE"
> "$TMP_FILE"

echo "🔁 Running benchmark $REPEAT times..."

for ((i=1; i<=REPEAT; i++)); do
  echo -e "\nIteration $i:" | tee -a "$RESULT_FILE"
  
  # Run benchmark.js and save only the result lines
  node benchmark.js > "$TMP_FILE"

  grep -E "Total duration|Throughput|Avg per request" "$TMP_FILE" | tee -a "$RESULT_FILE"

  sleep 3
done

echo -e "\n📊 Analyzing results..."

# Initialize empty arrays
durations=()
throughputs=()
avgs=()

# Parse the result file
while read -r line; do
  if [[ $line == Total\ duration:* ]]; then
    val=$(echo $line | awk '{print $3}' | sed 's/ms//')
    durations+=("$val")
  elif [[ $line == Throughput:* ]]; then
    val=$(echo $line | awk '{print $2}')
    throughputs+=("$val")
  elif [[ $line == Avg\ per\ request:* ]]; then
    val=$(echo $line | awk '{print $4}' | sed 's/ms//')
    avgs+=("$val")
  fi
done < "$RESULT_FILE"

# Function to calculate min, max, avg
calculate_stats() {
  local arr=("$@")
  local min=${arr[0]}
  local max=${arr[0]}
  local sum=0

  for val in "${arr[@]}"; do
    (( $(echo "$val < $min" | bc -l) )) && min=$val
    (( $(echo "$val > $max" | bc -l) )) && max=$val
    sum=$(echo "$sum + $val" | bc -l)
  done

  local count=${#arr[@]}
  local avg=$(echo "$sum / $count" | bc -l)

  printf "Min: %.2f\tMax: %.2f\tAvg: %.2f\n" "$min" "$max" "$avg" | tee -a "$RESULT_FILE"
}

echo -e "\nFinal Results:" | tee -a "$RESULT_FILE"

echo -e "\nTotal duration (ms):" | tee -a "$RESULT_FILE"
calculate_stats "${durations[@]}"

echo -e "\nThroughput (req/s):" | tee -a "$RESULT_FILE"
calculate_stats "${throughputs[@]}"

echo -e "\nAvg per request (ms):" | tee -a "$RESULT_FILE"
calculate_stats "${avgs[@]}"
