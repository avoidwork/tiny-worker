# tiny-worker
Tiny WebWorker for Server

This is non-functional, it's just a place holder for 1.0.0!

[![build status](https://secure.travis-ci.org/avoidwork/tiny-worker.svg)](http://travis-ci.org/avoidwork/tiny-worker)

## Example
```javascript
var Worker = require('tiny-worker'),
    worker;

worker = new Worker(function () {
  onmessage = function (ev) {
    postMessage(ev.data);
  };
});

worker.onmessage = function (ev) {
  console.log(ev.data);
};

worker.postMessage("Hello world!"); // "Hello world!" is logged to console after bouncing through the Worker
```

## Properties
#### onmessage
Message handler, accepts an `Event`

#### onerror
Error handler, accepts an `Event`

## API
#### postMessage()
Broadcasts a message to the `Worker`

## License
Copyright (c) 2015 Jason Mulligan
Licensed under the BSD-3 license
