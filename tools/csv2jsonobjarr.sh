#!/bin/bash

for csv_file in `find ./spreadsheets -name "*.objarr.csv"`; do
  json_file=`echo $csv_file | sed "s/^\.\/spreadsheets/\.\/src\/ReplicatedStorage\/shared\/constants/" | sed s/\.objarr\.csv$/\.json/`
  json_dir=`dirname $json_file`
  mkdir -p $json_dir
  echo Converting $csv_file to $json_file
  node node_modules/.bin/csv2json $csv_file | jq '[group_by(.Name)[] | {(.[0].Name): map_values(del(.Name))}] | add' > $json_file
done
