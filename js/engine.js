const render = (state, view) => {
  const { templateId, renderer, context } = Reflect.get(views, view);
  const container = document.getElementById('viewContainer');
  if (container.dataset.templateId !== templateId) {
    // noinspection JSUnresolvedFunction
    const viewNode = document.querySelector(`template[id=${templateId}]`).content.cloneNode(true);
    let afterFn;
    if (typeof renderer === 'string') {
      afterFn = Reflect.apply(Reflect.get(window, renderer), null, [state, viewNode, context]);
    } else {
      afterFn = renderer(viewNode, context);
    }
    // noinspection JSUnresolvedFunction
    container.replaceChildren(viewNode);
    if (afterFn) {
      Reflect.apply(afterFn, null, []);
    }
    container.dataset.templateId = templateId;
  }
};

// noinspection JSUnusedGlobalSymbols
const engine = {
  set(target, prop, newValue) {
    const reactive = !prop.startsWith('$');
    if (!reactive) {
      return Reflect.set(...arguments);
    }
    const publishable = !prop.startsWith('_');
    const oldValue = Reflect.get(target, prop);
    const changed = oldValue !== newValue;
    if (changed) {
      // if (prop in (watchers.before || {})) {
      //   if (!Reflect.get(watchers.before, prop).call(null, oldValue, newValue)) {
      //     return false;
      //   }
      // }
      const ok = Reflect.set(...arguments);
      if (ok) {
        // save
        saveData(prop, newValue);
        // publish
        if (publishable) {
          publishState(target);
        }
        // render
        if (target._view) {
          render(target, target._view);
        }
      }
      // if (prop in (watchers.after || {})) {
      //   Reflect.get(watchers.after, prop).call(null, oldValue, newValue);
      // }
      return ok;
    }
    return false;
  }
};

// const watchers = {
//   before: {
//     _joinCode(oldValue, newValue) {
//       if (state.$pubnub) {
//         if (oldValue) {
//           state.$pubnub.unsubscribe({ channels: [oldValue] });
//         }
//         state.$pubnub.subscribe({ channels: [newValue] });
//       }
//       return true;
//     }
//   }
// };
