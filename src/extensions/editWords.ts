// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');
const to = require('await-to-js').to;
// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');

import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
    toolbox.editWords = async (number = false, print = false) => {
        let [err, care] = await to(toolbox.getHymnHeader(number))
        if (err) return toolbox.print.error(err)
        let hymnHeader = care;
        // console.log(hymnHeader)
        toolbox.parameters.options.t = hymnHeader.tune;
        // console.log(await to(toolbox.getTuneFromSavedFile()))
        // let err, care;
        ;[err, care] = await to(toolbox.getTuneFromSavedFile(number));
        if (err) return toolbox.print.error(err)
        let { finalMeasuresArr, key, timeSignature, pickups } = care;

        let finalMeasuresArrBk = [...finalMeasuresArr];
        finalMeasuresArr = new Array(finalMeasuresArrBk.length);

        finalMeasuresArrBk.map((value, key) => {
            finalMeasuresArr[key] = toolbox.staffNotes(finalMeasuresArrBk[key].measure.length)
            Object.keys(finalMeasuresArrBk[key]).map(columnName => {
                finalMeasuresArr[key][columnName] = finalMeasuresArrBk[key][columnName]
            })
        })

        let measureToChange = parseInt(toolbox.parameters.options.M)
        let durationToChange = toolbox.parameters.options.d
        let noteToChange = toolbox.parameters.options.N.toUpperCase();
        let trackToChange = parseInt(toolbox.parameters.options.T)
        let rowToChange = parseInt(toolbox.parameters.options.r)
        let columnNameToChange = noteToChange.replace(/ES/, '').replace(/IS/, '')

        noteToChange = noteToChange.replace(/([^A-Z0-9])/g, `$1${durationToChange}`).toLowerCase()
        finalMeasuresArr.map((measure, measureIndex) => {
            measureIndex = measure.measure[0]
            if (measureIndex === measureToChange) {
                if (!measure[columnNameToChange][rowToChange]) measure[columnNameToChange][rowToChange] = `${trackToChange}:${noteToChange}`
                else measure[columnNameToChange][rowToChange] += `;${trackToChange}:${noteToChange}`
            }
        })
        finalMeasuresArr = toolbox.deleteEmptyKeys(finalMeasuresArr);
        // console.log(measureToChange, durationToChange, noteToChange, trackToChange, rowToChange, columnNameToChange)
        // console.log(toolbox.parameters.options)
        // Object.keys(finalMeasuresArrBk).map((key) =>
        //     finalMeasuresArrBk[keys].map
        // finalMeasuresArr[key] = toolbox.staffNotes(finalMeasuresArrBk[key].measure.length)
        // )
        // console.log(finalMeasuresArr);
        // process.exit();
        finalMeasuresArr = toolbox.trackOrderError(finalMeasuresArr);
        // toolbox.printer(finalMeasuresArr)
        // process.exit();

        await toolbox.missingMeterError(finalMeasuresArr);
        // for(let i in )
        // console.log(chords)
        finalMeasuresArr = toolbox.chordProgression(finalMeasuresArr, key);
        // toolbox.printer(finalMeasuresArr)
        // process.exit();
        // finalMeasuresArr.map(item => console.table(item))
        finalMeasuresArr = toolbox.checkMissingNotes(finalMeasuresArr);
        // toolbox.printer(finalMeasuresArr)
        // toolbox.printer(finalMeasuresArr)
        finalMeasuresArr = toolbox.noteTimes(finalMeasuresArr, timeSignature, pickups)
        // toolbox.printer(finalMeasuresArr)
        // process.exit();
        // console.log(pickups)
        // console.log(timeSignature)
        finalMeasuresArr = toolbox.checkTies(finalMeasuresArr, timeSignature, pickups);
        // toolbox.printer(finalMeasuresArr)
        // process.exit();
        // finalMeasuresArr = toolbox.sort(finalMeasuresArr); superflous. Source of disorganizing error found.
        // console.log('--------')
        // finalMeasuresArr = toolbox.measuresIntolines(finalMeasuresArr, meter);
        await toolbox.save(finalMeasuresArr, true);
        // if (print) toolbox.printer(finalMeasuresArr);
    }
}
