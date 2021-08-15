const to = require('await-to-js').to;

import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
    toolbox.blotWords = async (number = false, print = false) => {
        let [err, care] = await to(toolbox.getHymnHeader(number))
        if (err) return toolbox.print.error(err)
        let hymnHeader = care;
        toolbox.parameters.options.t = hymnHeader.tune;
        ;[err, care] = await to(toolbox.getTuneFromSavedFile(number));
        if (err) return toolbox.print.error(err)
        let { finalMeasuresArr, key, timeSignature, pickups } = care;
        key; timeSignature; pickups

            // ;[err, care] = await to(toolbox.getTuneHeader(number));
            // if (err) return toolbox.print.error(err)
            // let tuneHeader = care;
            ;[err, care] = await to(toolbox.metricalPattern(number || toolbox.parameters.options.n));
        if (err) return toolbox.print.error(err)
        let meter = care;


        let affectedStanza = parseInt(toolbox.parameters.options.S) - 1;
        let affectedLine = parseInt(toolbox.parameters.options.l) - 1;

        let tracks = toolbox.parameters.options.T || "*";
        // console.log(tracks)
        // console.log(tracks.replace(/\*/, '1,2,3,4'))
        // console.log(toolbox.parameters.options)
        tracks = tracks.replace(/\*/, '1,2,3,4').split(',').map(track => parseInt(track));
        // console.log(tracks)
        affectedLine; affectedStanza
        // let toOverwrite = false;
        finalMeasuresArr = finalMeasuresArr.map(measure => {
            //     // if (!measure[`LineNum`]) (measure[`LineNum`] = new Array(measure.measure.length)) ? toOverwrite = true : false;
            let i = -1;
            while (++i < tracks.length) {
                if (!measure[`BlottedWords${affectedStanza}-Trk${i}`]) measure[`BlottedWords${affectedStanza}-Trk${i}`] = new Array(measure.measure.length)
            }
            //     if (!measure[`Stanza${stanzasNum}-Trk2`]) measure[`Stanza${stanzasNum}-Trk2`] = new Array(measure.measure.length)
            //     if (!measure[`Stanza${stanzasNum}-Trk3`]) measure[`Stanza${stanzasNum}-Trk3`] = new Array(measure.measure.length)
            //     if (!measure[`Stanza${stanzasNum}-Trk4`]) measure[`Stanza${stanzasNum}-Trk4`] = new Array(measure.measure.length)
            //     // console.table(measure)
            return measure;
        })
        meter = meter[1];
        let useMeter: any = meter.split('.').every((item) => parseInt(item) !== NaN)
        let requiredNumSyllables: any = useMeter ? meter.split('.')[affectedLine] : 0;
        if (!requiredNumSyllables) {
            requiredNumSyllables = useMeter ? meter.split('.')[affectedLine - 1] : 0;
        }
        // console.log(requiredNumSyllables, affectedLine, meter);
        let lineHyphenated = [];
        let line = toolbox.parameters.options.w
        let lineWords = line.trim().replace(/  /g, " ").split(" ")
        // toolbox.printer(finalMeasuresArr)
        let iii = -1;
        while (++iii < lineWords.length) {
            let word = lineWords[iii]
                // console.log(word, iii, lineWords.length)
                ;[err, care] = await to(toolbox.hyphenology(word));
            if (err) {
                toolbox.print.error(err);
                return toolbox.print.error(err);
            }

            // let hyphenatedWords = care
            lineHyphenated.push(care)
            // console.log(hyphenatedWords)
            // process.exit();
        }
        // console.log(lineHyphenated);
        let options = [''];

        lineHyphenated.map(singleWord => {
            let optionsInner = [];
            // console.log(single)
            singleWord.map(singleOption => {
                options.map(firstParts => optionsInner.push(`${firstParts} ${singleOption}`))
            })
            options = optionsInner;
            // console.log(singleWord)

        })
        let optionsObj = {};

        options.map(singleOption => {
            singleOption = singleOption.trim();
            let optionLen = singleOption.split(/[ -]/).length;
            optionsObj[optionLen] = singleOption
            // console.llog
        });

        let lineFound = ''
        let noteCounter = 0;
        if (requiredNumSyllables) {
            if (optionsObj[requiredNumSyllables]) {
                noteCounter += parseInt(requiredNumSyllables)
                lineFound = optionsObj[requiredNumSyllables];
            }
            else {

                let alltiedNotes = toolbox.areThereAllTiedNotesinThisLine(affectedLine, finalMeasuresArr, meter);
                console.log(alltiedNotes)
                if (Object.values({ a: alltiedNotes.allNumNotes }).some(item => item > requiredNumSyllables)) {
                    console.log('Almost failed. But some refuge...')
                    noteCounter += parseInt(requiredNumSyllables)
                    console.log(optionsObj)
                    lineFound = optionsObj[alltiedNotes.allNumNotes];
                    console.log(lineFound)
                } else {
                    alltiedNotes
                    console.log(affectedLine)
                    toolbox.print.error(`An error with hyphenation and we do not know how to handle it. Check the original, Maybe all notes are tied at point of failure`);
                    process.exit();
                }
            }
        } else {
            console.log(meter)
            console.log(requiredNumSyllables)
            console.log(affectedLine)
            console.log(optionsObj)
            toolbox.print.error('An error with hyphenation and we do not know how to handle it..');
            process.exit();
        }

        let lineNotesIndex = 0;
        let fullNoteIndex = 0;
        let noteIndex = 0;
        let syllablesPerLine: any = meter.split('.').map(item => parseInt(item));
        let beginningNote = syllablesPerLine.filter((item, index) => index < affectedLine).reduce((a, b) => a + b, 0);
        let lineParts = lineFound.split(/(.*?[ -])/g).filter(item => item.length > 0).filter(item => item !== undefined)
        finalMeasuresArr = finalMeasuresArr.map(measure => {
            measure.noteTimes.map((noteTime, columnIndex) => {
                //check if there is a tie here...
                let hasTie = false;
                let allareTied = true;
                Object.keys(measure).map(columnName => {
                    if (toolbox.isNoteColumn(columnName)) {
                        try {
                            let elem = measure[columnName][columnIndex];
                            if (elem.match(/_/)) hasTie = true;
                            else allareTied = false;
                        } catch (err) { }
                    }
                })

                if (!hasTie || (lineParts.filter(item => item !== undefined).length > requiredNumSyllables && allareTied)) {
                    if (noteIndex < beginningNote || noteIndex > parseInt(beginningNote) + parseInt(requiredNumSyllables)) false;
                    else {
                        // console.log("measure", measure, columnIndex, lineNumber, line, lineNotesIndex, lineParts[lineNotesIndex])
                        if (lineParts[lineNotesIndex] !== undefined) {
                            let i = -1;
                            while (++i < tracks.length) {
                                measure[`BlottedWords${affectedStanza}-Trk${i}`][columnIndex] = lineParts[lineNotesIndex]
                            }
                            lineNotesIndex++
                        }
                    }
                    if (!allareTied)
                        if (parseInt(noteTime.toString()) !== NaN) noteIndex++;
                }
            })
            return measure;
        })
        toolbox.printer(finalMeasuresArr)
        toolbox.save(finalMeasuresArr, true);
    }
}
