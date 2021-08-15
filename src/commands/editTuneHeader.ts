import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator edittuneheader (-t tune-name/-n number) -h hymnal (-k key -m meter -c composer -y year -a arranger -p pick-up/anacrusis --tS time-signature --aY "arrangerYear" --pf proofRead(0/1))'

const command: GluegunCommand = {
  name: 'edittuneheader',
  alias: 'e',
  description,
  run: async toolbox => {
    if (!toolbox.parameters.options.h || !(toolbox.parameters.options.n || toolbox.parameters.options.t)) return toolbox.print.error(description);
    let [err, care] = [null, null];
    if (!toolbox.parameters.options.t) {
      [err, care] = await to(toolbox.getHymnHeader(toolbox.parameters.options.n))
      if (err) return toolbox.print.error(err)
      let hymnHeader = care;
      // console.log(hymnHeader)
      toolbox.parameters.options.t = hymnHeader.tune;
    }
    [err, care] = await to(toolbox.edittuneheader());
    if (err) return toolbox.print.error(err);
    care;
  }
}

module.exports = command
