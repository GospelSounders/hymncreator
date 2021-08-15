// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');
const to = require('await-to-js').to;
const chalk = require('chalk');
// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');


import { GluegunToolbox, prompt } from 'gluegun'


module.exports = (toolbox: GluegunToolbox) => {
    toolbox.printMissingNotes = async (number) => {
        begin:
        let [err, care] = await to(toolbox.getHymnHeader())
        if (err) return toolbox.print.error(err)
        let hymnHeader = care;

        toolbox.parameters.options.t = hymnHeader.tune;
        ;[err, care] = await to(toolbox.getTuneFromSavedFile());
        if (err) {
            return toolbox.print.error(`MISSING NUMBER: ${number}`)
        }
        let { finalMeasuresArr } = care;
        let measureDurations = {};
        finalMeasuresArr.map(
            measure => measure.noteDurations.map(singleNoteDuration => {
                let [track, duration] = singleNoteDuration.split(",");
                measureDurations[track] === undefined ? measureDurations[track] = [parseFloat(duration)] : measureDurations[track].push(duration)
            })
        )

        let durations = {}
        Object.keys(measureDurations).map(track =>
            measureDurations[track].map(duration => durations[duration] === undefined ? durations[duration] = 1 : durations[duration]++)
        )
        let durationsArr = [];
        Object.keys(durations).map(measureDuration => durationsArr.push([durations[measureDuration], parseFloat(measureDuration.toString())]))

        durationsArr = durationsArr.sort((a, b) => b[0] - a[0]) // sort descending
        let measureDuration = durationsArr[0][1]

        let hadMissingNotes: any = false;
        firstLoop:
        while (finalMeasuresArr.length) {
            let measure = finalMeasuresArr.shift();
            // finalMeasuresArr.map(async (measure) => {

            // console.log(measure.measure)
            if (measure.missingNotes) {
                let tracksWithProblems: any = { greater: [], lesser: [] };
                measure.noteDurations.map(singleNoteDuration => {
                    let [track, duration] = singleNoteDuration.split(",");
                    duration = parseFloat(duration)
                    duration < measureDuration ? tracksWithProblems.lesser.push(track) :
                        duration > measureDuration ? tracksWithProblems.greater.push(track) : false
                })
                tracksWithProblems = tracksWithProblems.lesser.map(track => parseInt(track))
                let noteTimes = measure.noteTimes.map((val, index) => //parseFloat(i)).map((val, index)=>{
                    // !index ? 0 :
                    measure.noteTimes[index + 1] !== undefined ?
                        parseFloat(measure.noteTimes[index + 1]) - parseFloat(measure.noteTimes[0]) :
                        // measureDuration * 4 - (parseFloat(val) - measure.noteTimes[0]) + parseFloat(val) - parseFloat(measure.noteTimes[0])
                        measureDuration * 4
                )

                // tracksWithProblems = [0]
                tracksWithProblems.map(async (trackWithProblems) => {
                    let trackDurations = new Array(noteTimes.length).fill(0);
                    Object.keys(measure).map((columnName) =>
                        toolbox.isNoteColumn(columnName) ? (
                            measure[columnName].map((elem, row) =>
                                toolbox.trackandDurationsfromNotePoint(elem).map(
                                    ([track, duration, durationinQuarterNotes]) =>
                                        track === trackWithProblems ? trackDurations[row] = durationinQuarterNotes : false
                                )
                            )
                        ) : false
                    )
                    trackDurations.map((val, index) => trackDurations[index] = trackDurations[index - 1] ? val + trackDurations[index - 1] : val)
                    let missingRows = [];
                    noteTimes.map((val, index) => val > trackDurations[index] ? missingRows.push(index) : false)
                    // console.log(noteTimes, trackDurations, missingRows)

                    // console.table(measure);
                    console.log(missingRows)
                    let command = `hymncreator addnote -h ${toolbox.parameters.options.h} -n ${number} -T ${tracksWithProblems} -M ${measure.measure[0]}`
                    hadMissingNotes = command;
                    return
                })
                break firstLoop;
            }
        }
        // )
        let command = hadMissingNotes
        // let missingRow = missingRows[0]
        if (command) {
            let response = await prompt.ask({
                type: 'text',
                name: 'ans',
                message: `${command} ${chalk.yellow(' #=is, b=es')}. ${chalk.cyan('(rownumber note duration)')}`,
                initial: `1 fes' 4.`
            });
            response = response.ans;
            let responseParts = response.replace(/  /g, ' ').split(' ');
            command += ` -r ${responseParts[0]} -N ${responseParts[1]} -d ${responseParts[2]}`
            // console.log(command);
            toolbox.parameters.options.r = responseParts[0];
            toolbox.parameters.options.N = responseParts[1];
            toolbox.parameters.options.d = responseParts[2];
            toolbox.parameters.options.M = command.match(/-M [0-9]+/)[0].replace(/-M /,'')
            toolbox.parameters.options.T = command.match(/-T [0-9]+/)[0].replace(/-T /,'')
            await toolbox.addNote(toolbox.parameters.options.n);
            await toolbox.printMissingNotes(number);
        }
    }
}


            //     Object.keys(measure).map(columnName => 

            //     toolbox.isNoteColumn(
            //     columnName
            // ) ? (
            //         measure[columnName].map(elem => {

            //             toolbox.trackandDurationsfromNotePoint(elem).map(

            //                 ([track, duration]) => {
            //                     // console.log(elem)
            //                     // console.log(track, duration)
            //                     measureDurations[track] === undefined ? measureDurations[track] = parseFloat(duration) : measureDurations[track] += duration

            //                 }

            //                 //     pointData => 
            //                 //     pointData.map((track, duration) =>{
            //                 //     console.log(elem)
            //                 //     console.log(pointData)
            //                 //     console.log(track, duration)
            //                 //     measureDurations[track] === undefined ? measureDurations[track] = parseFloat(duration) : measureDurations[track] += duration
            //                 //  } )

            //             )
            //             // console.log(columnName)
            //             // console.log(elem)
            //             // console.log(toolbox.trackandDurationsfromNotePoint(elem))
            //             // elem.split(';').map(singleNote=>{console.log(singleNote)})
            //         }
            //         )
            //     ) : false)
