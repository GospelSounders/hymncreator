import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator edithymnheader -n hymnNumberToStartFrom (-s stopAtNumber) -hymnal (-T "title" -f "firstline" --pp "topic" -t "tune" -a "author" -k "key"  -y "year" -S "scripture" --St "scriptureTexts" --Tr "translater" --try "translaterYear" --ss "scriptureSong (1/0)") --pf proofRead(1/0) -H hymnals (json) --bpr bodyProofReading(0/1)'

const command: GluegunCommand = {
  name: 'edithymnheader',
  alias: 'e',
  description,
  run: async toolbox => {
    if (!toolbox.parameters.options.h || !(toolbox.parameters.options.n)) return toolbox.print.error(description);
    // let [err, care] = [null, null];
    // if (!toolbox.parameters.options.t) {
    //   [err, care] = await to(toolbox.getHymnHeader(toolbox.parameters.options.n))
    //   if (err) return toolbox.print.error(err)
    //   let hymnHeader = care;
    //   // console.log(hymnHeader)
    //   toolbox.parameters.options.t = hymnHeader.tune;
    // }
    // [err, care] = await to(toolbox.edithymnheader());
    // if (err) return toolbox.print.error(err);
    // care;
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
        let [err, care] = await to(toolbox.edithymnheader())
        if (err) return toolbox.print.error(err)
        care;
      }
    }

    await main();
  }
}

module.exports = command
