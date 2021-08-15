import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator lyricstotune -h hymnal -n hymnNumberToStartFrom (-s stopAtNumber)'


// from which hymnal...
const command: GluegunCommand = {
  name: 'lyricstotune',
  alias: 'lt',
  description,
  run: async toolbox => {
    if (!toolbox.parameters.options.h || !toolbox.parameters.options.n) return toolbox.print.error(description);
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
        let [err, care] = await to(toolbox.lyricstotune(number, numbers.length >1?false:true))
        if (err) return toolbox.print.error(err)
        care;
      }
    }

    await main();
  }
}

module.exports = command