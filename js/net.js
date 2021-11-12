const networking = {
  channel: null,
  uuid: null,
  pubnub: null,
  start: (uuid, channel) => {
    this.uuid = uuid;
    this.channel = channel;
    this.pubnub = new PubNub({
      publishKey: "pub-c-c20b0062-2fab-478d-b3a0-df24b3ad656f",
      subscribeKey: "sub-c-e4bd8c4a-3e23-11ec-b2c1-a25c7fcd9558",
      uuid
    });
    this.pubnub.subscribe({ channels: [channel] });
  },
  addListener: fn => {
    this.pubnub.addListener({
      status: e => console.log('status', e),
      message: e => {
        if (e.publisher !== uuid) {
          console.log('message', e);
          Reflect.apply(fn, null, e);
        }
      },
    });
  },
  publish: message => {
    const channel = this.channel;
    this.pubnub.publish({ channel, message })
      .catch(err => console.error(err));
  }
};

const publishState = (state) => {
  const message = Object.keys(state)
    .filter(k => !k.startsWith('$') && !k.startsWith('_'))
    .reduce((acc, k) => {
      Reflect.set(acc, k, Reflect.get(state, k));
      return acc;
    }, {});
  networking.publish(message);
};
