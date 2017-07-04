(function() {
  const listenerMappings = {};
  let debouncer;

  class Element extends Polymer.Element {
    static get is() {
      return 'akyral-waypoint';
    }

    static get properties() {
      return {
        /**
         * The `data` attribute defines the data that will be passed
         * when the `akyral-waypoint` events are fired
         */
        data: {
          type: Object,
          value: {}
        },

        /**
         * The `disabled` attribute will disable the waypoint
         */
        disabled: {
          type: Boolean,
          reflectToAttribute: true,
          value: false
        },

        /**
         * Did waypoint get crossed from above or from below
         */
        state: {
          observer: 'stateChanged',
          type: String,
          value: 'above'
        },

        /**
         * The `within` attribute will fire the event when
         * it reaches within the range
         */
        within: {
          type: Number,
          value: 0
        }
      }
    }

    constructor() {
      super();
      this._bindListener();
    }

    /**
     * The `_bindListener` method will look at the waypoints ancecestors
     * and bind an scroll handler to that element and save that references as a
     * viewport. If it has already been bound previously it will ignore it.
     */
    _bindListener() {
      let parent = this.viewport = this.parentNode;

      if (parent === document.body) {
        this.viewport = window;
      }

      if (!listenerMappings[parent]) {
        listenerMappings[parent] = [];
      }

      parent.addEventListener('scroll', this._debounceCheck.bind(this));
      listenerMappings[parent].push(this);
    }

    /**
     * The `check` method will run calculations to determine whether
     * the waypoint has been reached.
     */
    _check(instance) {
        let trigger = instance.within;

      if (instance.disabled) {
        return;
      }

      let rect = instance.getBoundingClientRect();

      if (rect.top >= trigger) {
        instance.state = 'above';
      }

      if (trigger > rect.bottom) {
        instance.state = 'below';
      }
    }

    /**
     * The `debounce` handler delays execution of checks
     */
    _debounceCheck() {
      debouncer = Polymer.Debouncer.debounce(
        debouncer,
        Polymer.Async.animationFrame,
        () => {
          Object.keys(listenerMappings)
            .reduce((arr, el) => arr.concat(listenerMappings[el]), [])
            .forEach(this._check);
        });
    }

    /**
     * The `stateChanged` method will execute whenever a waypoint
     * has been crossed. It will fire the `akyral-waypoint-crossed` event
     * as well as the `akyral-waypoint-below|above` event depending on what
     * threshold it enters
     *
     */
    stateChanged(n, o) {
      if (!n) {
        return;
      }

      var details = {
        data: this.data,
        direction: this.state
      };

      if (o && n !== o) {
        this.dispatchEvent(
          new CustomEvent('akyral-waypoint-crossed', { detail: details, composed: true })
        );
      }

      this.dispatchEvent(
        new CustomEvent(`akyral-waypoint-${this.state}`, { detail: details, composed: true })
      );
    }
  }


  window.customElements.define(Element.is, Element);
})();

