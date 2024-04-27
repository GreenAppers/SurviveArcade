#!/bin/bash

for csv_file in `find ./spreadsheets -name "*.csv"`; do
  json_file=`echo $csv_file | sed "s/^\.\/spreadsheets/\.\/src\/ReplicatedStorage\/shared\/constants/" | sed s/\.csv$/\.json/`
  json_dir=`dirname $json_file`
  mkdir -p $json_dir
  echo Converting $csv_file to $json_file
  node node_modules/.bin/csv2json $csv_file | jq "map( { (.Name): . } ) | add" > $json_file
done
