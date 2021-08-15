import { GluegunCommand } from 'gluegun'
// import chalk from 'chalk'
// const chalk = require('chalk')

// const figlet = require('figlet')
const to = require('await-to-js').to
let description = 'hymncreator tunefrommidi -t tune-name -m midi-file (-k key -m meter -c composer -y year -a arranger -p pick-up/anacrusis)'


// from which hymnal...
const command: GluegunCommand = {
  name: 'tunefrommidi',
  alias: 'tm',
  description,
  run: async toolbox => {
    if(!toolbox.parameters.options.t || !toolbox.parameters.options.m)return toolbox.print.error(description)
    let [err, care] = await to(toolbox.edittuneheader());
    // start from here....
    // read tune data....,,, get especially meter and key... from hymndata......,,, require hymnal as input...
    if(err)return toolbox.print.error(err);
    // working with the hymndata.bundleRenderer.renderToStream
    /*
      tracks & co...
    */
    care;
    toolbox.tunefromMidi();
  }
}

module.exports = command