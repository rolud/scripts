#!/bin/bash

if [ -z $1 ] || [ -z $2 ]
then
  if [ -z $1 ]
  then
    echo -e "\033[1;31m Missing version \033[0m"
  fi
  if [ -z $2 ]
  then
    echo -e "\033[1;31m Missing build number \033[0m"
  fi
else

  echo -e "\033[0;32m Genereting android bundle $1 ($2) \033[0m"
  react-native bundle \
    --dev false \
    --platform android \
    --entry-file index.js \
    --reset-cache \
    --bundle-output index.android.bundle \
    --sourcemap-output index.android.bundle.map

  echo -e "\033[0;32m Uploading android symbols \033[0m"
  node_modules/@sentry/cli/bin/sentry-cli releases \
      files $1 \
      upload-sourcemaps \
      --dist $2 \
      --strip-prefix . \
      --rewrite index.android.bundle index.android.bundle.map

  echo -e "\033[0;32m Genereting ios bundle $1 ($2) \033[0m"
  react-native bundle \
    --dev false \
    --platform ios \
    --entry-file index.js \
    --reset-cache \
    --bundle-output main.jsbundle \
    --sourcemap-output main.jsbundle.map

  echo -e "\033[0;32m Uploading ios symbols \033[0m"
  node_modules/@sentry/cli/bin/sentry-cli releases \
      files $1 \
      upload-sourcemaps \
      --dist $2 \
      --strip-prefix . \
      --rewrite main.jsbundle main.jsbundle.map
fi