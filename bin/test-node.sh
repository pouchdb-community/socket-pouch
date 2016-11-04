#!/usr/bin/env bash

: ${TIMEOUT:=50000}
: ${REPORTER:="spec"}

node ./bin/dev-server.js &
export DEV_SERVER_PID=$!

sleep 10

# TODO: this fixes a weird test in test.views.js
./node_modules/.bin/rimraf tmp
./node_modules/.bin/mkdirp tmp

# skip migration and defaults tests
if [[ $INVERT == '1' ]]; then
  INVERT_ARG='--invert'
else
  INVERT_ARG=''
fi

mocha \
  --reporter=$REPORTER \
  --timeout $TIMEOUT \
  --require=./test/node.setup.js \
  --grep=$GREP \
  $INVERT_ARG \
  test/pouchdb/{integration,mapreduce}/test.*.js

EXIT_STATUS=$?
if [[ ! -z $DEV_SERVER_PID ]]; then
  kill $DEV_SERVER_PID
fi
exit $EXIT_STATUS
