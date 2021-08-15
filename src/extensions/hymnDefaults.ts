import { GluegunToolbox } from 'gluegun'
const yaml = require('js-yaml');

let defaultValues = 
`title: ''
firstline: ''
topic: ""
tune: ""
author: "anon"
key: C Major
hymnnumber: 0
year: "-"
`

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.hymndefaults = () => {
    let defaultConfigs = yaml.safeLoad(defaultValues);
    return {
      headers: defaultConfigs
    }    
  }
}
