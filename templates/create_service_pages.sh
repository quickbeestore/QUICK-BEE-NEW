#!/bin/bash

services=(
  "plumbing"
  "electrician"
  "hvac"
  "painting"
  "carpentry"
  "roofing"
  "flooring"
  "landscaping"
  "glass"
  "mechanic"
  "cleaning"
  "laundry"
  "pest-control"
  "appliance-repair"
  "locksmith"
  "security"
  "water-purification"
  "solar"
  "it"
  "tutoring"
  "beauty"
  "fitness"
  "cooking"
)

template='{"sections": {"service_detail": {"type": "service-detail", "settings": {}}}, "order": ["service_detail"]}'

for service in "${services[@]}"; do
  filename="page.service-${service}.json"
  echo "$template" > "$filename"
  echo "Created $filename"
done
