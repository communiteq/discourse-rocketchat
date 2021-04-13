import { h } from "virtual-dom";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "discourse-rocketchat",

  initialize() {
    withPluginApi("0.8.8", (api) => {

      const site = api.container.lookup("site:main");
      const isMobileView = site && site.mobileView;
      if (isMobileView) {
        api.decorateWidget('header-icons:before', function(helper) {
          const headerState = helper.widget.parentWidget.state;
          let contents = [];
          contents.push(helper.h('li', [
            helper.attach('header-dropdown', {
              title: 'Chat',
              icon: 'fab-rocketchat',
              // active: headerState.pizzaVisible,
              iconId: 'toggle-hamburger-brand-menu',
              action: 'toggleRocket',
            }),
          ]));
          return contents;
        }); // end api.decorateWidget

        api.attachWidgetAction('header', 'toggleRocket', function() {
          this.appEvents.trigger("rocketchat-toggle");
        }); // end attachWidgetAction

      } // end isMobileView
    }); // end withPluginApi
  }, // end initialize
};
