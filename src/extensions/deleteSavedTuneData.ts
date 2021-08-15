import { GluegunToolbox, filesystem } from 'gluegun'
const yaml = require('js-yaml');
/*
 * save body separately as csv
 */
module.exports = (toolbox: GluegunToolbox) => {

  toolbox.deleteSavedTuneData = async (number) => {
    let hymnHeader = await toolbox.getHymnHeader(number);
    filesystem.write(`hymns/${toolbox.parameters.options.h}/${number}.md`, `---\n${yaml.safeDump(hymnHeader)}---\n`);
  }
}