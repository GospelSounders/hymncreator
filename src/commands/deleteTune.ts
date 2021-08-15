import { GluegunCommand, filesystem } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
let description = 'hymncreator deleteTune -t tune-name'

const command: GluegunCommand = {
  name: 'deletetune',
  alias: 'd',
  description,
  run: async toolbox => {
    if(!toolbox.parameters.options.t)return toolbox.print.error(description)
    filesystem.remove(`${toolbox.parameters.options.t}.yaml`)
  }
}

module.exports = command
