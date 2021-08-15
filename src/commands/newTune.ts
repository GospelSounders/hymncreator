import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator newtune -t tune-name (-k key -m meter -c composer -y year -a arranger -p pick-up/anacrusis)'

const command: GluegunCommand = {
  name: 'newtune',
  alias: 'n',
  description,
  run: async toolbox => {
    if(!toolbox.parameters.options.t)return toolbox.print.error(description)
    let [err, care] = await to(toolbox.createTune());
    if(err)return toolbox.print.error(err);
    care;
  }
}

module.exports = command
