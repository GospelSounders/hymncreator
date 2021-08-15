import { GluegunToolbox } from 'gluegun'
// const shell = require('shelljs')
const to = require('await-to-js').to;

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.missingMeterError = async (finalMeasuresArr, meter, number = false) => {
    let [err, care] = await to(toolbox.getHymnHeader(number))
    if (err) return toolbox.print.error(err)
    let hymnHeader = care;
    toolbox.parameters.options.t = hymnHeader.tune;
    [err, care] = await to(toolbox.getTuneHeader(number));
    if (err) return toolbox.print.error(err)
    let tuneHeader = care;
    if (care === undefined) {
      // console.log(hymnHeader)
      throw `missing tune for ${number || toolbox.parameters.options.n}`;
    }
    let meterOriginal = tuneHeader.meter;
    ;[err, care] = await to(toolbox.metricalPattern(number));
    if (err) return toolbox.print.error(err)
    let hasMeter = care;
    let old_m = toolbox.parameters.options.m
    if (hasMeter !== false) {

      if (hasMeter[0] !== meterOriginal) {
        toolbox.parameters.options.m = hasMeter[0];
      }
      toolbox.parameters.options.mE = 0;
    } else {
      toolbox.parameters.options.mE = 1;
    }
    console.log(number, hasMeter, toolbox.parameters.options)
    ;[err, care] = await to(toolbox.edittuneheader());
    
    if (err) return toolbox.print.error(err);
    old_m ? toolbox.parameters.options.m = old_m : false;
    return finalMeasuresArr;
  }
}