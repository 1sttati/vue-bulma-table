import Vue from 'vue'
import DataTable from 'DataTable.vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/flag'
import 'vue-awesome/icons'
import 'bulma/bulma.sass';

new Vue({
  el: '#app',
  template: '<DataTable/>',
  components: { Icon }
})