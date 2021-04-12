import Ember from "ember";
import { set, get, computed } from "@ember/object";

export default Ember.Component.extend({
  isLoaded: false,
  isOpen: false,
  labelOC: 'Open',
  didInsertElement() {
    this._super();
  },
  labelOC: computed('isOpen', function() {
    if (this.get('isOpen')) {
      return "Close";
    }
    else {
      return "Open";
    }
  }),
  classList: computed('isOpen', function() {
    if (this.get('isOpen')) {
      return "collapsible active-chat";
    }
    else {
      return "collapsible";
    }
  }),
  actions: {
    togglePopup() {
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
    }
  }
});
