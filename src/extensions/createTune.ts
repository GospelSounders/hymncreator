import { GluegunToolbox, filesystem } from 'gluegun'
const yaml = require('js-yaml');

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.createTune = async () => {
    let defaultConfigs = toolbox.tunedefaults().headers;
    let inputHeader = {tune:toolbox.parameters.options.t};
    let headerFields = {
      k:"key", m: "meter", c: "composer", y: "year", a: "arranger", p:"anacrusis"
    }
    for(let key in toolbox.parameters.options) {
      let val = toolbox.parameters.options[key];
      if(headerFields[key])inputHeader[headerFields[key]] = val;
    }
    let resultant = { ...defaultConfigs, ...inputHeader };
    filesystem.write(`tunes/${toolbox.parameters.options.h}/${toolbox.parameters.options.t}.md`, `---\n${yaml.safeDump(resultant)}---\n`);
  }
}