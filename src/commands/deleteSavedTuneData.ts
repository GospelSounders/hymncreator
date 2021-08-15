import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator tunefromhymndata -h hymnal -n hymnNumberToStartFrom (-s stopAtNumber)'


// from which hymnal...
const command: GluegunCommand = {
  name: 'deletesavedtunedata',
  alias: 'dstd',
  description,
  run: async toolbox => {
    if(!toolbox.parameters.options.h || !toolbox.parameters.options.n)return toolbox.print.error(description);
    let startAtNumber = parseInt(toolbox.parameters.options.n);
    let stopAtNumber = parseInt(toolbox.parameters.options.s) || startAtNumber;
    let main = async () => {
      let numbers = [];
      let currentNum = startAtNumber;
      while (currentNum <= stopAtNumber) numbers.push(currentNum++);

      let promises = numbers.map(function (number) {return toolbox.deleteSavedTuneData(number, toolbox.parameters.options.h) })
      let [err, care] = await to(Promise.all(promises));
      if(err)return toolbox.print.error(err)
      care;
    }

    await main();
    // let [err, care] = await to(toolbox.tunefromhymndata());


    // // start from here....
    // // read tune data....,,, get especially meter and key... from hymndata......,,, require hymnal as input...
    // if(err)return toolbox.print.error(err);
    // // working with the hymndata.bundleRenderer.renderToStream
    // /*
    //   tracks & co...
    // */
    // care;
    // toolbox.tunefromMidi();
  }
}

module.exports = command