import { GluegunToolbox, filesystem } from 'gluegun'
const yaml = require('js-yaml');
const to = require('await-to-js').to;
/*
 * save body separately as csv
 */
module.exports = (toolbox: GluegunToolbox) => {

  toolbox.save = async (hymnObj, overwrite = false) => {
    let hymnCSV = '';
    // console.log(hymnObj)
    // hymnObj.map(measure=>{
    for (let i in hymnObj) {
      let measure = hymnObj[i]
      // hymnObj.map(measure=>{
      for (let key in measure) {
        hymnCSV += `${key}||${measure[key].join('||')}\n`
      }
      hymnCSV += '\n'
    }
    // )
    // console.log(hymnCSV)
    let hymnHeader = await toolbox.getHymnHeader();
    let [err, care] = await to(toolbox.getTuneFromSavedFile());
    let tuneHasBeenSaved = false;
    if (!err && care) tuneHasBeenSaved = true;

    let proofRead: any = hymnHeader.bodyProofReading || hymnHeader.body_proof_reading || false;
    proofRead = proofRead ? parseInt(proofRead.toString()) : false;

    let toOverwrite = true;
    if (tuneHasBeenSaved && !overwrite) toOverwrite = false;
    if (!proofRead)
      if (toOverwrite) {
        toolbox.print.success('Saving')
        filesystem.write(`hymns/${toolbox.parameters.options.h}/${toolbox.parameters.options.n}.md`, `---\n${yaml.safeDump(hymnHeader)}---\n${hymnCSV ? hymnCSV : ''}`);
      } else toolbox.print.error('Not OverWriting')
    else toolbox.print.error(`This song had been proofread. We can't make further changes until you change edit proof-reading flag to false using: hymncreator edithymnheader -h ${toolbox.parameters.options.h} -n ${toolbox.parameters.options.n} --bpr 0`)
  }
}