import { GluegunCommand } from 'gluegun'
const to = require('await-to-js').to
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
let description = 'hymncreator tunetoLy -h hymnal -n hymnNumberToStartFrom (-s stopAtNumber)'

const command: GluegunCommand = {
  name: 'tunetoLy',
  alias: 'ttL',
  description,
  run: async toolbox => {
    if (!toolbox.parameters.options.n || !toolbox.parameters.options.h) return toolbox.print.error(description)
    let startAtNumber = parseInt(toolbox.parameters.options.n);
    let stopAtNumber = parseInt(toolbox.parameters.options.s) || startAtNumber;
    let main = async () => {
      let numbers = [];
      let currentNum = startAtNumber;
      while (currentNum <= stopAtNumber) numbers.push(currentNum++);
      // console.log(numbers); process.exit();

      while (numbers.length) {
        let number = numbers.shift();
        console.log(`number:${number}`)
        toolbox.parameters.options.n = number;
        let [err, care] = await to(toolbox.tunetoLy(number, numbers.length > 1 ? false : true))
        if (err) return toolbox.print.error(err)
        care;
      }

      // let promises = numbers.map(function (number) { return toolbox.tunefromhymndata(number, toolbox.parameters.options.h) })
      // let [err, care] = await to(Promise.all(promises));
      // if (err) return toolbox.print.error(err)
      // care;
    }

    await main();
  }
}

module.exports = command
