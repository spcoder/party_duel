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
      // status: e => {
      //   console.log('status', e);
      // },
      message: e => {
        if (e.publisher !== this.pubnub.getUUID()) {
          Reflect.apply(fn, null, [e]);
        }
      },
    });
  },
  publish: function(channel, message) {
    this.pubnub.publish({ channel, message }).catch(err => console.error(err));
  }
};

const publishState = function(channel, state) {
  const message = {
    joinCode: state._joinCode,
    strikes: state.strikes,
    ...[1, 2, 3, 4, 5, 6, 7, 8].reduce((acc, index) => {
      const answerText = (Reflect.get(state, `answer${index}Text`) || '').trim() || null;
      const answerScore = Reflect.get(state, `answer${index}Score`);
      const isVisible = Reflect.get(state, `answer${index}Visible`) === true;
      Reflect.set(acc, `answer${index}Text`, isVisible && answerText ? answerText : null);
      Reflect.set(acc, `answer${index}Score`, isVisible && answerText ? answerScore : null);
      Reflect.set(acc, `answer${index}Empty`, !answerText);
      return acc;
    }, {})
  };
  networking.publish(channel, message);
};
