import { set, get, computed } from "@ember/object";
import I18n from "I18n";

export default Ember.Component.extend({
  isLoaded: false,
  isOpen: false,
  didInsertElement() {
    this.appEvents.on("rocketchat-toggle", () => {
      this.toggleChat();
    })
    this._super();
  },
  toggleChat: (function() {
    if (this.get('isOpen')) {
      // close
    }
    else {
      if (this.isLoaded == false) {
        const embedGroups = this.siteSettings.discourse_rocketchat_show_menu_for_groups.split('|').map(Number);
        const filteredGroups = this.currentUser.groups.filter(group => embedGroups.includes(group.id));
        var embedParam = '';
        if(filteredGroups.length < 1) {
          embedParam = '?layout=embedded';
        }

        var content = document.getElementById('rocketchat-container');
        content.innerHTML = '<iframe src="https://'
          + this.siteSettings.discourse_rocketchat_host
          + '/channel/' + this.siteSettings.discourse_rocketchat_default_channel
          + embedParam
          + '" class="rocketchat-embed"></iframe>';
        this.isLoaded = true;
      }

    }
    this.set('isOpen', ! this.get('isOpen'));
  }),
  labelOC: computed('isOpen', function() {
    if (this.get('isOpen')) {
      return I18n.t('rocketchat-plugin.close');
    }
    else {
      return I18n.t('rocketchat-plugin.open');
    }
  }),
  showRocketChat: (function() {
    return this.currentUser && this.currentUser.trust_level >= this.siteSettings.discourse_rocketchat_min_trust_level;
  }).property(),
  chatboxTitle: (function() {
    return this.siteSettings.discourse_rocketchat_title;
  }).property(),
  classList: computed('isOpen', function() {
    var classes = 'rocketchat-collapsible ';
    if (this.siteSettings.discourse_rocketchat_click_entire_bar) {
      classes += 'clickable-bar '
    }
    if (this.get('isOpen')) {
      classes += 'active-chat ';
    }
    return classes;
  }),
  actions: {
    togglePopup(event) {
      this.toggleChat();
      event.stopPropagation();
    },
    togglePopupBar() {
      if(this.siteSettings.discourse_rocketchat_click_entire_bar) {
        this.toggleChat();
      }
    }
  }
});
