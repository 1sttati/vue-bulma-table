module.exports = {
  entry: './DataTable.vue',
  autoprefixer: {
    browsers: ['ie > 8', 'last 3 versions']
  },
  filename: {
    js: 'vue-bulma-table.js',
    css: 'vue-bulma-table.css'
  },
  sourceMap: false,
  html: false,
  format: 'cjs'
}