#!/bin/sh
chmod u+rwx ./dist/bundle.js
node ./dist/bundle.js "$@"