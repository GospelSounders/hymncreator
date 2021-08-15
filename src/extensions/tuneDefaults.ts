import { GluegunToolbox } from 'gluegun'
const yaml = require('js-yaml');

let defaultValues = 
`tune: ''
composer: anon
arranger: "-"
year: "-"
meter: C.M
key: C Major
anacrusis: 0
`

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.tunedefaults = () => {
    let defaultConfigs = yaml.safeLoad(defaultValues);
    return {
      headers: defaultConfigs
    }    
  }
}
