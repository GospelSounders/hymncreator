import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator print -z section(header/error) -h hymnal -n hymnNumberToStartFrom (-s stopAtNumber -t typeofError(all=*/meter/track-order) -o (measure by measure?))'

const command: GluegunCommand = {
  name: 'print',
  alias: 'p',
  description,
  run: async toolbox => {
    if (!toolbox.parameters.options.z || !toolbox.parameters.options.h || !toolbox.parameters.options.n) return toolbox.print.error(description)
    let startAtNumber = parseInt(toolbox.parameters.options.n);
    let stopAtNumber = parseInt(toolbox.parameters.options.s) || startAtNumber;
    let numbers = [];
    let currentNum = startAtNumber;
    let promises: any;
    let [err, care] = [null, null];
    while (currentNum <= stopAtNumber) numbers.push(currentNum++);
    switch (toolbox.parameters.options.z) {
      case 'error':
        if (!toolbox.parameters.options.t) return toolbox.print.error(description);
        switch (toolbox.parameters.options.t) {
          case '*':
          case 'all':
            console.log('checking all errors')
            break;
          case 'meter':
            // promises = numbers.map(function (number) { return toolbox.printMeterError(number, toolbox.parameters.options.h) })
            //   ;[err, care] = await to(Promise.all(promises));
            // if (err) return toolbox.print.error(err)

            while (numbers.length) {
              let number = numbers.shift();
              await toolbox.printMeterError(number, toolbox.parameters.options.h)
            }
            break;
          case 'track-order':
            while (numbers.length) {
              let number = numbers.shift();
              await toolbox.printTrackorderError(number, toolbox.parameters.options.h)
            }
            break;
          case 'missing-notes':
            while (numbers.length) {
              let number = numbers.shift();
              await toolbox.printMissingNotes(number, toolbox.parameters.options.h)
            }
            break;
          default:
            return toolbox.print.error(description);
        }
        break;
      case 'header':
        promises = numbers.map(function (number) { return toolbox.printHeader(number, toolbox.parameters.options.h) })
          ;[err, care] = await to(Promise.all(promises));
        if (err) return toolbox.print.error(err)
        care;

        break;
      default:
        return toolbox.print.error(description)
    }
  }
}

module.exports = command
