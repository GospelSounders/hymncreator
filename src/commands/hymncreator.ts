import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
const chalk = require('chalk')

const figlet = require('figlet')

const command: GluegunCommand = {
  name: 'hymncreator',
  run: async toolbox => {
    console.log(
      chalk.cyan(figlet.textSync('hymncreator', { horizontalLayout: 'full' }))
    )
    const { printHelp } = toolbox.print
    printHelp(toolbox)
  }
}

module.exports = command
