// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');
const to = require('await-to-js').to;
const chalk = require('chalk');
// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');


import { GluegunToolbox } from 'gluegun'


module.exports = (toolbox: GluegunToolbox) => {
    toolbox.printHeader = async (number = false) => {
        let [err, care] = await to(toolbox.getHymnHeader(number))
        if (err) return toolbox.print.error(err)
        let hymnHeader = care;
        console.log(`${chalk.blue('Hymn header')}. ${chalk.yellow('Edit with:')} ${chalk.cyan('hymncreator editheader')}`)
        console.log(hymnHeader)

        toolbox.parameters.options.t = hymnHeader.tune;
        [err, care] = await to(toolbox.getTuneHeader(number));
        if (err) return toolbox.print.error(err)
        let tuneHeader = care;
        console.log(`${chalk.blue('Tune header')}. ${chalk.yellow('Edit with:')} ${chalk.cyan('hymncreator edittuneheader -t '+ hymnHeader.tune +' -h '+toolbox.parameters.options.h+' (-k key -m meter -c composer -y year -a arranger -p pick-up/anacrusis)')}`)
        console.log(tuneHeader)
    }
}
