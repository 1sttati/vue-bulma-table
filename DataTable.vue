<template>
  <div style="position: relative;">
    <nav class="level is-mobile" v-if="lengthChange || filterable">
      <div class="level-left" v-if="lengthChange && !scrollable">
        <div class="level-item">
          <div class="select" :class="inputClass">
            <select v-model="perPage">
              <option v-for="(length, i) in pageLength" :value="length" :key="i">{{ length }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="level-right" v-if="filterable && !columnSearchable">
        <div class="level-item">
          <div class="field">
            <p class="control has-icons-left has-icons-right">
              <input class="input" :class="inputClass" type="text" placeholder="search" v-model="tableFilter">
              <span class="icon is-small is-left">
                <icon name="search"></icon>
              </span>
            </p>
          </div>
        </div>
      </div>
    </nav>
    <div class="datatable-wrapper" :style="{maxHeight: scrollable ? bodyHeight : null}">
      <table :class="tableClass">
        <thead>
          <tr>
            <th v-for="(f, index) in fields" :key="index" @click="sortField(f)" class="cursorPointer">
              <span>{{ f.label || f.name }}</span>
              <icon
                :name="sort1.order === 'asc' ? 'caret-up': 'caret-down'"
                v-if="sort1.field === f.name"
              />
            </th>
          </tr>
          <tr v-if="columnSearchable">
            <th v-for="(f, index) in fields" :key="index">
              <div class="field is-narrow" v-if="f.search">
                <div class="control">
                  <input
                    type="text"
                    class="input is-small"
                    :placeholder="f.label || f.name"
                    v-model="columnsFilter[f.name]"
                  >
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tfoot v-if="$slots['footer']">
          <slot name="footer"></slot>
        </tfoot>
        <tbody>
          <tr v-for="(data, index) in dataSet" :key="index" @click="$emit('onRowClick', data)">
            <template v-for="(f, i) in fields">
              <template v-if="f.slot">
                <td :key="i">
                  <slot :name="f.name" :data="data"></slot>
                </td>
              </template>
              <template v-else-if="f.callback">
                <td :key="i">{{ f.callback(data) }}</td>
              </template>
              <template v-else>
                <td :key="i">{{ getObjectData(data, f.name) }}</td>
              </template>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <nav class="pagination is-centered" :class="inputClass" role="navigation" aria-label="pagination" v-if="pagination && !scrollable">
      <a class="pagination-previous" @click="previousPage" :disabled="from - perPage < 0">Previous</a>
      <a class="pagination-next" @click="nextPage"
         :disabled="from + perPage >= filteredData.length">Next page</a>
      <ul class="pagination-list">
        <li><a class="pagination-link" @click="toFirstPage" v-if="currentPage > 1">1</a></li>
        <li><span class="pagination-ellipsis" v-if="currentPage - 2 > 1">&hellip;</span></li>
        <li>
          <a class="pagination-link" @click="previousPage" v-if="currentPage - 1 > 1">{{ currentPage - 1 }}</a>
        </li>
        <li><a class="pagination-link is-current">{{ currentPage }}</a></li>
        <li>
          <a class="pagination-link" @click="nextPage" v-if="currentPage + 1 < lastPage">{{ currentPage + 1 }}</a>
        </li>
        <li><span class="pagination-ellipsis" v-if="currentPage + 2 < lastPage">&hellip;</span></li>
        <li><a class="pagination-link" @click="toLastPage" v-if="currentPage < lastPage">{{ lastPage }}</a></li>
      </ul>
    </nav>
    <div v-if="loading"
         style="display: flex; align-items: center; position: absolute; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); box-shadow: 0 0 20px 5px rgba(0,0,0,0.7);">
      <div style="margin: auto;">
        <icon name="circle-o-notch" scale="4" spin></icon>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import floatHead from 'float-head'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/flag';
import 'vue-awesome/icons';

export default {
  components: {
    Icon
  },

  props: {
    fields: {
      type: Array,
      default () {
        return []
      }
    },
    data: {
      type: Array,
      required: true
    },
    pageLength: {
      type: [Array, Number],
      default () {
        return [10, 25, 50]
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    lengthChange: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: true
    },
    pagination: {
      type: Boolean,
      default: true
    },
    tableClass: {
      type: String,
      default: 'table is-striped is-narrow is-fullwidth'
    },
    inputClass: {
      type: String,
      default: ''
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    bodyHeight: {
      type: String,
      default: '300px'
    }
  },

  data () {
    return {
      perPage: 10,
      from: 0,
      tableFilter: '',
      columnsFilter: {},
      sort1: { field: '', order: '' },
      sort2: { field: '', order: '' },
      sort3: { field: '', order: '' }
    }
  },

  computed: {
    columnslength () {
      return Object.keys(this.columnsFilter).length === 0
    },
    filteredData () {
      const vm = this
      vm.from = 0
      return this.columnSearchable ? _.filter(this.data, (data) => {
        if (Object.keys(this.columnsFilter).length === 0) return true
        let state = true
        for (const i in vm.columnsFilter) {
          if (vm.columnsFilter[i].length === 0) continue
          state = state && String(vm.getObjectData(data, i)).toLowerCase().indexOf(vm.columnsFilter[i].toLowerCase()) >= 0
        }
        return state
      }) : _.filter(this.data, (data) => {
        for (const i in vm.fields) {
          if (String(vm.getObjectData(data, vm.fields[i].name)).toLowerCase().indexOf(vm.tableFilter.toLowerCase()) >= 0) return true
        }
      })
    },
    dataSort () {
      return _.orderBy(this.filteredData, [
        this.sort1.field, this.sort2.field, this.sort3.field
      ], [this.sort1.order, this.sort2.order, this.sort3.order])
    },
    dataSet () {
      return this.dataSort.slice(this.from, this.from + this.perPage)
    },
    lastPage () {
      return Math.ceil(this.filteredData.length / this.perPage)
    },
    currentPage () {
      return Math.ceil(this.from / this.perPage) + 1
    },
    columnSearchable () {
      return this.fields.filter((field) => {
        return typeof field.search !== 'undefined' ? field.search : 0
      }).length > 0 ? 1 : 0
    }
  },

  watch: {
    dataSet (data) {
      this.$emit('currentData', data)
    },
    pageLength (data) {
      this.perPage = Array.isArray(data) ? data[0] : data
    }
  },

  beforeMount () {
    if (this.scrollable) {
      this.perPage = 1000000
    } else {
      this.perPage = Array.isArray(this.pageLength) ? this.pageLength[0] : this.pageLength
    }
  },

  mounted () {
    if (this.scrollable) {
      floatHead('table', {
        scrollContainer ($table) {
          return $table.closest('.datatable-wrapper');
        },
        zIndex: 0
      })
    }
  },

  methods: {
    previousPage () {
      if (this.from - this.perPage >= 0) {
        this.from = this.from - this.perPage
      }
    },
    nextPage () {
      if (this.from + this.perPage < this.filteredData.length) {
        this.from = this.from + this.perPage
      }
    },
    toFirstPage () {
      this.from = 0
    },
    toLastPage () {
      this.from = Math.floor((this.filteredData.length - 1) / this.perPage) * this.perPage
    },
    sortField (field) {
      if (this.sort1.field === field.name) {
        this.sort1.order = this.sort1.order !== 'asc' ? 'asc' : 'desc'
      } else {
        Object.assign(this.sort3, this.sort2)
        Object.assign(this.sort2, this.sort1)
        this.sort1 = {
          field: field.name,
          order: 'asc'
        }
      }
    },
    getObjectData (data, field) {
      let o = data
      field.split('.').forEach(key => {
        o = o[key] ? o[key] : ''
      })
      return o
    }
  }
}
</script>

<style>
.datatable-wrapper {
  overflow: auto;
}

.datatable-wrapper table thead th,
.datatable-wrapper table thead td {
  white-space: nowrap;
}

.datatable-wrapper::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
}

.datatable-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
}

.datatable-wrapper::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
