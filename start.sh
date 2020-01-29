#!/bin/sh
chmod u+rwx ./dist
node ./dist/index.js "$@"