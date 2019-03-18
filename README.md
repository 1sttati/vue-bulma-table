# vue-bulma-table
Vue DataTable with Bulma style

## Getting Started
### Installing
```
npm install vue-bulma-table --save
```
or
```
yarn add vue-bulma-table
```

### Setup
```js
import DataTable from 'vue-bulma-table'

Vue.component('data-table', DataTable)
```

## Example:

### html
```html
<data-table
  :data="data"                                    # required - array of data
  :fields="fields"                                # required - set columns
>

  <template slot="lastname" slot-scope="prop">    # using slot in lastname field
    <h1>{{ prop.data.lastname }}</h1>
  </template>
  
  <template slot="footer">                        # optional - using footer
    <tr></tr>
  </template>
  
</data-table>
```

### script
```js
export default {
  data () {
    return {
      fields: [
        {
          name: 'firstname',      // name of object property in array
          label: 'First name',    // optional - custom table header
        },
        {
          name: 'lastname',
          label: 'Last name',
          slot: true              // optional - custom html in the cell
        },
        
        {
          name: 'age',
          label: 'Age',
          callback: data => {   // optional - get data of the role and return to cell
            return data.age * 2
          }
        }
      ]
    }
  }
}
```
