import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator blotwords -n hymnNumberToStartFrom (-s stopAtNumber) -hymnal -S stanza -l line -w words -T tracks[1,2,3,..n or "*" - all tracks] (default "*"))'

const command: GluegunCommand = {
  name: 'blotwords',
  alias: 'bw',
  description,
  run: async toolbox => {
    if (!toolbox.parameters.options.h || !(toolbox.parameters.options.n)|| !(toolbox.parameters.options.S)|| !(toolbox.parameters.options.l)|| !(toolbox.parameters.options.w)|| !(toolbox.parameters.options.T)) return toolbox.print.error(description);
    let startAtNumber = parseInt(toolbox.parameters.options.n);
    let stopAtNumber = parseInt(toolbox.parameters.options.s) || startAtNumber;
    let main = async () => {
      let numbers = [];
      let currentNum = startAtNumber;
      while (currentNum <= stopAtNumber) numbers.push(currentNum++);
      
      while (numbers.length) {
        let number = numbers.shift();
        console.log(`number:${number}`)
        toolbox.parameters.options.n = number;
        let [err, care] = await to(toolbox.blotWords(number))
        if (err) return toolbox.print.error(err)
        care;
      }
    }

    await main();
  }
}

module.exports = command
