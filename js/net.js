const networking = {
  pubnub: null,
  start: function(uuid) {
    this.pubnub = new PubNub({
      publishKey: "pub-c-c20b0062-2fab-478d-b3a0-df24b3ad656f",
      subscribeKey: "sub-c-e4bd8c4a-3e23-11ec-b2c1-a25c7fcd9558",
      uuid
    });
  },
  unsubscribe: function(...channels) {
    this.pubnub.unsubscribe({ channels });
  },
  subscribe: function(...channels) {
    this.pubnub.subscribe({ channels });
  },
  addListener: function(fn) {
    this.pubnub.addListener({
      status: e => console.log('status', e),
      message: e => {
        if (e.publisher !== this.pubnub.getUUID()) {
          console.log('message', e);
          Reflect.apply(fn, null, e);
        }
      },
    });
  },
  publish: function(channel, message) {
    this.pubnub.publish({ channel, message }).catch(err => console.error(err));
  }
};

const publishState = function(channel, state) {
  const message = Object.keys(state)
    .filter(k => !k.startsWith('_'))
    .reduce((acc, k) => {
      Reflect.set(acc, k, Reflect.get(state, k));
      return acc;
    }, {});
  console.log('publishing', channel, message);
  networking.publish(channel, message);
};
