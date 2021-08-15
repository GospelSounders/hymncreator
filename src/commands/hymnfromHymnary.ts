import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
let description = 'hymncreator hymnfromhymnary -h hymnal -n hymnNumberToStartFrom (-s stopAtNumber) \n eg. hymncreator hymnfromhymnary -n 1 -h CHSD1941 -s 3'
const to = require('await-to-js').to
  // hymnalHeaderfromHymnarydotorg = require('../modules/hymnHeaderfromHymnary').hymnalHeaderfromHymnarydotorg;
// const yaml = require('js-yaml');

const command: GluegunCommand = {
  name: 'hymnfromhymnary',
  alias: 'hm',
  description,
  run: async toolbox => {
    if (!toolbox.parameters.options.h || !toolbox.parameters.options.n) return toolbox.print.error(description)

    let startAtNumber = parseInt(toolbox.parameters.options.n);
    let stopAtNumber = parseInt(toolbox.parameters.options.s) || startAtNumber;
    let main = async () => {
      let numbers = [];
      let currentNum = startAtNumber;
      while (currentNum <= stopAtNumber) numbers.push(currentNum++);

      let promises = numbers.map(function (number) {return toolbox.hymnalHeaderfromHymnarydotorg(number, toolbox.parameters.options.h) })
      let [err, care] = await to(Promise.all(promises));
      if(err)return toolbox.print.error(err)
      care;
    }

    await main();
  }
}

module.exports = command
