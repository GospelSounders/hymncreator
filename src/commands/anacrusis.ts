import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator anacrusis -n hymnNumberToStartFrom (-s stopAtNumber) -hymnal -p anacrisus(0,1,2,4,..etc) '

const command: GluegunCommand = {
  name: 'anacrusis',
  description,
  run: async toolbox => {
    if (!toolbox.parameters.options.h || !(toolbox.parameters.options.n)) return toolbox.print.error(description);
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
        let [err, care] = new Array(2);
        if (toolbox.parameters.options.p) {
          [err, care] = await to(toolbox.edittuneheader(number))
          if (err) return toolbox.print.error(err)
        }
        console.log('now going to reorder the stuff...')
          ;[err, care] = await to(toolbox.reorderMeters(number))
        care;
      }
    }

    await main();
  }
}

module.exports = command
