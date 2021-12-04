function useEngine(elementId, object) {
  const container = document.getElementById(elementId);
  const views = new Map();
  const styleMap = new Map();
  const applyHandler = (self, target, method, ...args) => target && method in target && Reflect.apply(Reflect.get(target, method), self, args);
  const engine = {
    routes: {},
    routeDefault: 'index',
    routeNotFound: 'index',
    state: {},
    addView: handler => views.set(handler.templateId, handler),
    nav: hash => location.hash = hash.startsWith('#') ? hash : '#' + hash,
    include: (file, templateId) => {
      if (document.getElementById(templateId)) {
        return Promise.resolve();
      }
      return fetch(file).then(resp => resp.text()).then(html => new DOMParser().parseFromString(html, 'text/html')).then(doc => {
        const templateNode = doc.querySelector('template');
        document.body.appendChild(templateNode.cloneNode(true));
        const scriptNode = doc.querySelector('script');
        if (scriptNode) {
          const scriptEl = document.createElement('script');
          scriptEl.appendChild(document.createTextNode(scriptNode.innerText));
          document.body.appendChild(scriptEl.cloneNode(true));
        }
        const styleNode = doc.querySelector('style');
        if (styleNode) {
          styleMap.set(templateId, styleNode);
        }
      });
    },
    render: function() {
      const routeKey = location.hash.replaceAll('#', '').trim() || this.routeDefault;
      const route = Reflect.get(this.routes, routeKey) ?? Reflect.get(this.routes, this.routeNotFound);
      this.include(route.file, route.templateId).then(() => {
        if (container.dataset.templateId !== route.templateId) {
          container.style.display = 'none';
          const wrapper = document.createElement('div');
          const shadowRoot = wrapper.attachShadow({ mode: 'open' });
          const viewFragment = document.getElementById(route.templateId).content;
          shadowRoot.append(viewFragment.cloneNode(true));
          Array.from(document.getElementsByTagName('link')).forEach(link => shadowRoot.appendChild(link.cloneNode(true)));
          const styleNode = styleMap.get(route.templateId);
          if (styleNode) {
            shadowRoot.append(styleNode.cloneNode(true));
          }
          applyHandler(this, views.get(route.templateId), 'created', shadowRoot, route.context);
          // noinspection JSUnresolvedFunction
          container.replaceChildren(wrapper);
          applyHandler(this, views.get(route.templateId), 'mounted', shadowRoot, route.context);
          container.dataset.templateId = route.templateId;
          setTimeout(() => container.style.display = 'block', 100);
        }
      });
    },
    start: function() {
      window.addEventListener('hashchange', () => this.render());
      const set = (target, prop, newValue) => {
        const oldValue = Reflect.get(target, prop);
        if (oldValue !== newValue) {
          const ok = Reflect.set(target, prop, newValue);
          if (ok) {
            const routeKey = location.hash.replaceAll('#', '').trim() || this.routeDefault;
            const route = Reflect.get(this.routes, routeKey) ?? Reflect.get(this.routes, this.routeNotFound);
            const shadowRoot = container.firstElementChild?.shadowRoot;
            applyHandler(this, this, 'afterStateChange', prop, oldValue, newValue, this.state);
            applyHandler(this, views.get(route.templateId), 'afterStateChange', shadowRoot, prop, oldValue, newValue, this.state);
            this.render();
          }
          return ok;
        }
        return true;
      };
      this.state = new Proxy({ ...this.state, _engineStarted: false }, { set });
      this.state._engineStarted = true; // turn the key
      applyHandler(this, this, 'afterStart', this.state);
    }
  };
  const app = { ...engine, ...object };
  window.addEventListener('DOMContentLoaded', () => app.start());
  return app;
}
