// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');
const to = require('await-to-js').to;
// const chalk = require('chalk');
// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');


import { GluegunToolbox } from 'gluegun'


module.exports = (toolbox: GluegunToolbox) => {
    toolbox.printTrackorderError = async (number) => {
        let [err, care] = await to(toolbox.getHymnHeader())
        if (err) return toolbox.print.error(err)
        let hymnHeader = care;
        // console.log(hymnHeader)
        toolbox.parameters.options.t = hymnHeader.tune;
        // console.log(await to(toolbox.getTuneFromSavedFile()))
        // let err, care;
        ;[err, care] = await to(toolbox.getTuneFromSavedFile());
        if (err) {
            return toolbox.print.error(`MISSING NUMBER: ${number}`)
        }
       let  {finalMeasuresArr} = care;
       while(finalMeasuresArr.length){
           let measure = finalMeasuresArr.shift();
           if(measure.orderError)console.table(measure);
       }

        // toolbox.parameters.options.n = number
        // let [err, care] = await to(toolbox.getHymnHeader(number))
        // if (err) return toolbox.print.error(err)
        // let hymnHeader = care;
        // if(care === undefined){
        //     console.log(`MISSING NUMBER: ${number}`)

        //     return;
        // }
        // toolbox.parameters.options.t = hymnHeader.tune;
        // ;[err, care] = await to(toolbox.missingMeterError())
        // if (err) return toolbox.print.error(err)
        // ;[err, care] = await to(toolbox.getTuneHeader());
        // if (err) return toolbox.print.error(err)
        // let tuneHeader = care;
        // // let meter = tuneHeader.meter;
        // // let meterError = parseInt(tuneHeader.meter_error) || false;
        // // console.log(tuneHeader)
        // // console.log(`Number: ${number}`)
        // // console.log(care)
        // // console.log(hymnHeader)
        // // console.log(err)
        // // console.log(tuneHeader.tune)
        // // if(tuneHeader.meter_error === undefined){
        // //     await toolbox.missingMeterError()
        // // }
        // // console.log('------------')
        // ;[err, care] = await to(toolbox.getTuneHeader());
        // if (err) return toolbox.print.error(err);
        // tuneHeader = care;
       
        // // let meter = tuneHeader.meter;
        // let meterError:any = parseInt(tuneHeader.meter_error);
        // if(meterError){
        //     // meter
        //     console.log(tuneHeader)
        // }
        // else console.log('no error')
    }
}
