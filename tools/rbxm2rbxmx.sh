#!/bin/bash

for binary_model_file in `find ./assets -name "*.rbxm"`; do
  xml_model_file=`echo $binary_model_file | sed s/\.rbxm$/\.rbxmx/`
  echo Converting $binary_model_file to $xml_model_file
  lune tools/rbxmcp.luau $binary_model_file $xml_model_file
  rm -rf $binary_model_file
done
