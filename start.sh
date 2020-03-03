#!/bin/sh
chmod u+rwx ./dist
node ./dist/bundle.js "$@"