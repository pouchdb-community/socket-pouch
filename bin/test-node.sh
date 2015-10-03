#!/bin/bash

: ${TIMEOUT:=50000}
: ${REPORTER:="spec"}
: ${GREP:="3955|closure"}
: ${INVERT:=1}

node ./bin/dev-server.js &
export DEV_SERVER_PID=$!

sleep 10

# TODO: this fixes a weird test in test.views.js
./node_modules/.bin/mkdirp tmp

# skip migration and defaults tests
TESTS=$(ls node_modules/pouchdb/tests/integration/test*js | \
  grep -v migration | \
  grep -v defaults | \
  grep -v issue915 )

if [ $INVERT ]; then
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
  $TESTS

EXIT_STATUS=$?
if [[ ! -z $DEV_SERVER_PID ]]; then
  kill $DEV_SERVER_PID
fi
exit $EXIT_STATUS
