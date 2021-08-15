// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');
const to = require('await-to-js').to;
// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');

import { GluegunToolbox, filesystem } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
    toolbox.lyricstotune = async (number: any = false, print = false) => {
        let [err, care] = await to(toolbox.getHymnHeader(number))
        if (err) return toolbox.print.error(err)
        let hymnHeader = care;
        toolbox.parameters.options.t = hymnHeader.tune;
        ;[err, care] = await to(toolbox.getTuneFromSavedFile(number));
        if (err) return toolbox.print.error(err)
        let { finalMeasuresArr, key, timeSignature, pickups } = care;

        ;[err, care] = await to(toolbox.getTuneHeader(number));
        if (err) return toolbox.print.error(err)
        let tuneHeader = care;
        ;[err, care] = await to(toolbox.metricalPattern(number));
        if (err) return toolbox.print.error(err)
        let meter = care;

        number = number.toString();
        while (number.length < 3) number = `0${number}`
        let lyricsFileContents = filesystem.read(`lyrics/${toolbox.parameters.options.h}/${number}.txt`)
        if (lyricsFileContents === undefined) return toolbox.print.error('No lyrics file found.')
        console.log(`lyrics/${toolbox.parameters.options.h}/${number}.md`);
        // let firstLineofContent = /([\d])\.\n/.exec(lyricsFileContents)
        let firstLineofContent: any = /([\d])/.exec(lyricsFileContents);

        console.log(lyricsFileContents)
        console.log(firstLineofContent)
        try {
            firstLineofContent = firstLineofContent.index;
        } catch (error) {
            // console.error(error)
        }
        // console.log(firstLineofContent)  
        //   console.log(`#:${hymnNumber}->${firstLineofContent}`)
        //   console.log(`TITLE:${title}`)
        let patt = /[\d]\..*/s;
        let hymnText: any = patt.exec(lyricsFileContents)
        hymnText = hymnText[0];

        //   ;process.exit()

        patt = /\nRefrain.*/s;
        // patt = /Chorus:(.*(?:\r?\n(?!\s*\r?\n).*)*)/;
        let chorus: any = patt.exec(hymnText)
        //   console.log('11111111111111111111111111111')
        try {
            if (chorus[0]) chorus = chorus[0].split('\n\n')[0]
        } catch (err) { }
        //   console.log('2222222222222222222222222222')
        //   patt = /Refrain:((.*)\n)*/;
        // patt = /Refrain:(.*(?:\r?\n(?!\s*\r?\n).*)*)/;
        //   let refrain = patt.exec(hymnText)
        let refrain = ""
        try {
            if (refrain[0]) refrain = refrain[0].split('\n\n')[0]
        } catch (err) { }


        hymnText = hymnText.replace(/ \[Chorus\]\n/g, `\n\n${chorus}\n\n`)
        hymnText = hymnText.replace(/ \[Refrain\]\n/g, `\n\n${refrain}\n\n`)

        patt = /[\d]\..*/g;
        // let numStanzas = patt.exec(hymnText)
        let numStanzas = hymnText.match(patt).length
       
        let hasChorus = '-'
        if (chorus) hasChorus = 'chorus'
        else if (refrain) hasChorus = 'refrain'
        // let firstLineofContent = /([\d])\.\n/.exec(wholeFile)
        // console.log(care);
        console.log(hasChorus)
        console.log(numStanzas)
        console.log(hymnText)

        let stanzas: any = hymnText.split(patt);
        stanzas = stanzas.map(stanza => stanza.trim().replace(/\r\n/g, "\n"));
        stanzas = stanzas.filter(stanza => stanza.length > 1);


        // console.log(tuneHeader)
        meter = meter[1];
        let useMeter: any = meter.split('.').every((item) => parseInt(item) !== NaN)
        let toOverwrite: any = false;


       

        let stanzasLen = stanzas.length;
        let i = -1;
        while (++i < stanzasLen) {  // each stanza
            let stanzasNum = i;
            let stanza = stanzas[i]
            let lines = stanza.split("\n");
            let noteCounter = 0;
            lines = lines.map((line) => line.trim().replace(/  /g, ' '))
            let ii = -1;
            while (++ii < lines.length) { // eachLine
                let line = lines[ii];
                let lineNumber = ii
                let lineHyphenated = [];
                let requiredNumSyllables: any = useMeter ? meter.split('.')[lineNumber] : 0;
                if (!requiredNumSyllables) {
                    requiredNumSyllables = useMeter ? meter.split('.')[lineNumber - 1] : 0;
                }
                // console.log(line, stanzasNum, lineNumber, useMeter, requiredNumSyllables)
                // console.log('----------')
                // try {
                //     console.log(await to(delay()))
                // } catch (err) {
                //     console.log(err)
                // }
                // let proposedHyphenatedLines = [];
                let lineWords = line.trim().split(" ")
                // console.log(lineWords)
                let iii = -1;
                while (++iii < lineWords.length) {
                    let word = lineWords[iii]
                        // console.log(word, iii, lineWords.length)
                        ;[err, care] = await to(toolbox.hyphenology(word));
                    if (err) {
                        toolbox.print.error(err);
                        return toolbox.print.error(err);
                    }

                    let hyphenatedWords = care
                    lineHyphenated.push(care)
                    // console.log(hyphenatedWords)
                    // process.exit();
                }
                // console.log('came back')
                // console.log(lineHyphenated)
                // console.log(widestOptions)
                // let lineHyphenatedOptions = [];
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
                console.log('lineNumber ::::', lineNumber)
                if (requiredNumSyllables) {
                    if (optionsObj[requiredNumSyllables]) {
                        noteCounter += parseInt(requiredNumSyllables)
                        lineFound = optionsObj[requiredNumSyllables];
                    }
                    else {

                        let alltiedNotes = toolbox.areThereAllTiedNotesinThisLine(lineNumber, finalMeasuresArr, meter);
                        console.log(alltiedNotes)
                        if (Object.values({ a: alltiedNotes.allNumNotes }).some(item => item > requiredNumSyllables)) {
                            console.log('Almost failed. But some refuge...')
                            noteCounter += parseInt(requiredNumSyllables)
                            lineFound = optionsObj[alltiedNotes.allNumNotes];
                            console.log(lineFound)
                        } else {
                            alltiedNotes
                            console.log(lineNumber)
                            toolbox.print.error(`An error with hyphenation and we do not know how to handle it. Check the original, you may need to manually insert some ties`);
                            // console.log(toolbox.measureAtNoteNumber(finalMeasuresArr, noteCounter))
                            process.exit();
                        }
                    }
                } else {
                    console.log(meter)
                    console.log(requiredNumSyllables)
                    console.log(lineNumber)
                    console.log(optionsObj)
                    toolbox.print.error('An error with hyphenation and we do not know how to handle it..');
                    process.exit();
                }
                let lineParts = lineFound.split(/(.*?[ -])/g).filter(item => item.length > 0).filter(item => item !== undefined)
                // console.log(lineParts)
                if (useMeter) {
                    let syllablesPerLine: any = meter.split('.').map(item => parseInt(item));
                    let beginningNote = syllablesPerLine.filter((item, index) => index < lineNumber).reduce((a, b) => a + b, 0);
                    // console.log(syllablesPerLine)
                    // console.log(stanzasNum, lineNumber)
                    finalMeasuresArr = finalMeasuresArr.map(measure => {
                        // console.table(measure)
                        if (!measure[`LineNum`]) (measure[`LineNum`] = new Array(measure.measure.length)) ? toOverwrite = true : false;
                        if (!measure[`Stanza${stanzasNum}-Trk1`]) measure[`Stanza${stanzasNum}-Trk1`] = new Array(measure.measure.length)
                        if (!measure[`Stanza${stanzasNum}-Trk2`]) measure[`Stanza${stanzasNum}-Trk2`] = new Array(measure.measure.length)
                        if (!measure[`Stanza${stanzasNum}-Trk3`]) measure[`Stanza${stanzasNum}-Trk3`] = new Array(measure.measure.length)
                        if (!measure[`Stanza${stanzasNum}-Trk4`]) measure[`Stanza${stanzasNum}-Trk4`] = new Array(measure.measure.length)
                        // console.table(measure)
                        return measure;
                    })
                    let lineNotesIndex = 0;
                    let fullNoteIndex = 0;
                    let noteIndex = 0;
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
                                        // console.table(measure)
                                        if (measure[`LineNum`][columnIndex] == undefined)
                                            measure[`LineNum`][columnIndex] = lineNumber
                                        measure[`Stanza${stanzasNum}-Trk1`][columnIndex] = lineParts[lineNotesIndex]
                                        measure[`Stanza${stanzasNum}-Trk2`][columnIndex] = lineParts[lineNotesIndex]
                                        measure[`Stanza${stanzasNum}-Trk3`][columnIndex] = lineParts[lineNotesIndex]
                                        measure[`Stanza${stanzasNum}-Trk4`][columnIndex] = lineParts[lineNotesIndex]
                                        lineNotesIndex++
                                    }
                                }
                                if (!allareTied)
                                    if (parseInt(noteTime.toString()) !== NaN) noteIndex++;
                                // if (parseInt(noteTime.toString())) noteIndex++;
                            } else {    // tied notes. check. No idea why this block fails when combined with previous condition
                                // if (lineParts.filter(item => item !== undefined).length > requiredNumSyllables && allareTied) {
                                //     if (noteIndex < beginningNote || noteIndex > parseInt(beginningNote) + parseInt(requiredNumSyllables)) false;
                                //     else {
                                //         // console.log("measure", measure, columnIndex, lineNumber, line, lineNotesIndex, lineParts[lineNotesIndex])
                                //         if (lineParts[lineNotesIndex] !== undefined) {
                                //             // console.table(measure)
                                //             if (measure[`LineNum`][columnIndex] == undefined)
                                //                 measure[`LineNum`][columnIndex] = lineNumber
                                //             measure[`Stanza${stanzasNum}-Trk1`][columnIndex] = lineParts[lineNotesIndex]
                                //             measure[`Stanza${stanzasNum}-Trk2`][columnIndex] = lineParts[lineNotesIndex]
                                //             measure[`Stanza${stanzasNum}-Trk3`][columnIndex] = lineParts[lineNotesIndex]
                                //             measure[`Stanza${stanzasNum}-Trk4`][columnIndex] = lineParts[lineNotesIndex]
                                //             lineNotesIndex++
                                //         }
                                //     }
                                // }
                            }
                        })
                        // console.table(measure)
                        // process.exit();
                        return measure;
                    })
                    // toolbox.printer(finalMeasuresArr);
                    // process.exit();
                } else {
                    toolbox.print.error('Irregular meter not yet supported')
                }
            }
        }
        await toolbox.save(finalMeasuresArr, toOverwrite);
        toolbox.printer(finalMeasuresArr);
    }
}
