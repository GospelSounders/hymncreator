// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');
const to = require('await-to-js').to;
const fs = require('fs-extra');
const Midi = require('../modules/Midi');

import { GluegunToolbox } from 'gluegun'
// const shell = require("shelljs");

let getNotefromNumber = (number) => { //check return also octave...
    // console.log(number)
    let knownNote = ['c', '48'];
    let noteSequence = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
    let diff: number = number - parseInt(knownNote[1]);
    let smallNumber = diff % 12
    let octave: number;
    if (diff < 0)
        octave = Math.floor(diff / 12)
    else octave = parseInt((diff / 12).toString())
    if (diff < 0) smallNumber += 12
    let note = noteSequence[smallNumber];
    // 1, 1 => 0
    let retOctave = ''
    while (octave > 0) {
        retOctave += "'"
        octave--
    }
    while (octave < 0) {
        retOctave += ","
        octave++
    }
    return [note, retOctave];
}

/**/
let getKeyfromNotesArray = (notesArr) => {
    let notes = {};
    for (let i in notesArr) {
        let note = notesArr[i]
        if (!notes[note]) notes[note] = 1;
        else notes[note]++;
    }
    let sharps = 0;
    let flats = 0;
    // preference: whether to use flats or sharps
    let notes_ = {};
    for (let i in notes) {
        let accdntl = ''
        if (i.length > 1) { // we need to check which one is prefered between the sharp and the flat.
            let sharpNoteLetter = i[0]
            let flatNoteLetter = i.split('/')[1][0]
            //   let accidentedNotes = notes[i];
            let natural_for_flatNotes = notes[flatNoteLetter] || 0
            let natural_for_sharpNotes = notes[sharpNoteLetter] || 0
            if (natural_for_flatNotes < natural_for_sharpNotes) accdntl = 'b'
            else accdntl = '#'
            if (accdntl === 'b') notes_[i.split('/')[1]] = notes[i]
            else notes_[i.split('/')[0]] = notes[i]
        } else {
            notes_[i] = notes[i]
        }
    }
    // suppose some notes are sharp and others are flat,, make all of them one of the other...
    // notes_["Gb"] = 2
    sharps = 0;
    flats = 0;
    for (let note in notes_) {
        if (note[1] === '#') sharps++
        if (note[1] === 'b') flats++
    }
    let accidental = 'N';
    let notes_1 = {}
    if (sharps >= flats) { // make all sharps
        accidental = '#'
        // let index = 0;
        for (let note in notes_) {
            if (note[1] === 'b') {
                let getSharpNote = (notes, note) => {
                    for (let noteInner in notes) {
                        if (noteInner.indexOf(note) !== -1) return noteInner.split('/')[0]
                    }
                }
                let tmpNote = getSharpNote(notes, note);
                if (notes_1[tmpNote] === undefined) notes_1[tmpNote] = notes_[note];
                else notes_1[tmpNote] += notes_[note];
            } else {
                if (notes_1[note] === undefined) notes_1[note] = notes_[note];
                else notes_1[note] += notes_[note];
            }
            //   index++;
        }
    }
    if (sharps < flats) { // make all flats
        accidental = 'b'
        // let index = 0;
        for (let note in notes_) {
            if (note[1] === '#') {
                let getFlatNote = (notes, note) => {
                    for (let noteInner in notes) {
                        if (noteInner.indexOf(note) !== -1) return noteInner.split('/')[1]
                    }
                }
                let tmpNote = getFlatNote(notes, note);
                if (notes_1[tmpNote] === undefined) notes_1[tmpNote] = notes_[note];
                else notes_1[tmpNote] += notes_[note];
            } else {
                if (notes_1[note] === undefined) notes_1[note] = notes_[note];
                else notes_1[note] += notes_[note];
            }
            //   index++;
        }
    }
    let accidentedNotesObj = {}; //retain only the notes that have the greatest occurance so we can know which notes are #s/bs throughout
    for (let note in notes_1) {
        let letterNote = note[0];
        let sharpNote = `${letterNote}#`
        let flatNote = `${letterNote}b`
        let sharpNotes = notes_1[sharpNote] || 0
        let flatNotes = notes_1[flatNote] || 0
        let nauturalNotes = notes_1[letterNote] || 0
        let accidentedNotes = sharpNotes;
        if (accidentedNotes < flatNotes) accidentedNotes = flatNotes;
        if (accidentedNotes > nauturalNotes) accidentedNotesObj[letterNote] = letterNote;
    }
    let numAccidentedNotes = Object.keys(accidentedNotesObj).length
    let key = getKeyfromNumAccidentedNotes(accidental, numAccidentedNotes)
    return key;
}
let getKeyfromNumAccidentedNotes = (acc, number, type = 'major') => {
    try {
        type = type.toLowerCase()
    } catch (error) { }
    let sharps = [
        ["C", "G", "D", "A", "E", "B", "F#", "C#"],
        ["A", "E", "B", "F#", "C#", "G#", "D#", "A#"]
    ]
    let flats = [
        ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
        ["A", "D", "G", "C", "F", "Bb", "Eb", "Ab",]
    ]
    if (type === 'minor') type = '1';
    else type = '0'
    switch (acc) {
        case '#':
            return `${sharps[type][number]} ${parseInt(type) === 1 ? "Minor" : "Major"}`;
        case "b":
            return `${flats[type][number]} ${parseInt(type) === 1 ? "Minor" : "Major"}`;
        default:
            return 'C Major'
    }
}
let sharpOrflatUsingKey = (note, key) => {
    while (key.split('  ').length > 1) {
        key = key.split('  ').join(' ')
    }
    let keyLetter = key.split(' ')[0];
    let majorOrMinor = key.split(' ')[1] || 'Major';
    majorOrMinor = majorOrMinor === 'Major' ? 0 : 1;
    let acc = [
        ["C", "G", "D", "A", "E", "B", "F#", "C#", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
        ["A", "E", "B", "F#", "C#", "G#", "D#", "A#", "D", "G", "C", "F", "Bb", "Eb", "Ab",]
    ]
    let sharps = [0, 'F', 'C', 'G', 'D', 'A', 'E', 'B']
    let flats = [0, 'B', 'E', 'A', 'D', 'G', 'C', 'F']
    let keyIndex = acc[majorOrMinor].indexOf(keyLetter)
    let arrtoCheck;
    let toAppend = ''
    if (keyIndex <= 7) {
        arrtoCheck = sharps;
        toAppend = '#'
    } else {
        keyIndex -= 7;
        arrtoCheck = flats;
        toAppend = 'b'
    }
    let ret = [];
    let i = 0;
    while (i <= keyIndex) {
        ret.push(`${arrtoCheck[i]}${toAppend}`)
        i++
    }
    return [ret, toAppend];
}

let getNoteFinally = (note, key) => {
    let note_ = note[0].replace("#", 'is').replace(/b/, 'es').toLowerCase()
    // get whole notes and the dot...
    let tmpDuration = 1 / (note[1] / 4)
    let fullNote = (tmpDuration % 1) ? (tmpDuration * 3) / 2 : tmpDuration
    let halfNote = (tmpDuration % 1) ? "." : "";
    if (note_.split('/').length > 1) {
        let accs_ = sharpOrflatUsingKey(note_, key)
        let accs = accs_[0]
        let optionNote1 = note_.split('/')[0][0].toUpperCase()
        let optionNote2 = note_.split('/')[1][0].toUpperCase()
        let optionNote1Index = accs.indexOf(`${optionNote1}#`)
        let optionNote2Index = accs.indexOf(`${optionNote2}b`)
        if (optionNote2Index > -1) note_ = note_.split('/')[1]
        else {
            if (optionNote1Index > -1) note_ = note_.split('/')[0]
            else {
                let toAppend = accs_[1];
                if (toAppend === '#') note_ = note_.split('/')[0]
                else note_ = note_.split('/')[1]
            }
        }
    }
    // console.log(note_)
    // console.log(`${fullNote}: ${halfNote}: ${note_}: ${note[2]} : ${note[1]}:- ${tmpDuration}`)
    note_ = `${note_}${note[2]}${Math.ceil(fullNote)}${halfNote}` // check. Either floor or ceil depending...
    return note_
}

let greatestInArr = (arrs) => {
    let i = 0;
    let most = 0;
    while (i < arrs.length) {
        if (most === 0)
            if (arrs[i] > most) most = arrs[i]
            else;
        else if (arrs[i] > most) most = arrs[i]
        i++
    }
    return most;
}
/**/


module.exports = (toolbox: GluegunToolbox) => {

    const getfinalMeasuresArr: any = async (number = false) => {
        // async function getfinalMeasuresArr:any() {
        let [err, care] = await to(toolbox.getHymnHeader(number))
        if (err) return toolbox.print.error(err)
        let hymnHeader = care;
        // console.log(hymnHeader)
        toolbox.parameters.options.t = hymnHeader.tune;
        [err, care] = await to(toolbox.getTuneHeader(number));
        if (err) return toolbox.print.error(err)
        // console.log(care);
        let tuneHeader = care;
        let meter = tuneHeader.meter;
        let key = tuneHeader.key;
        let hymnNumber = hymnHeader.hymnnumber;
        while (hymnNumber.length < 3) {
            hymnNumber = `0${hymnNumber}`
        }
        let midiFilePath = `resources/midi/${toolbox.parameters.options.h}/${hymnNumber}.mid`
        // console.log(midiFilePath)
        let fileBlob = fs.readFileSync(midiFilePath) // check if saved
        // console.log(midiFilePath);
        fileBlob;
        let decoded = Midi.decode(fileBlob);
        let midiHeader = decoded.header;

        // console.log(decoded)
        // console.log(midiHeader)
        let tracks = decoded.tracks;
        // get anacrusis from tracks...
        let startTimes = {}, pickups = {};
        for (let i in tracks) {
            let track = tracks[i]
            if (track.notes) {
                try {
                    startTimes[i] = track.notes[0].time
                } catch (err) { }
            }
        }

        let ppq = midiHeader.PPQ;
        let bpm = midiHeader.bpm;
        let timeSignature = midiHeader.timeSignature;

        let timeSignatureArr = timeSignature.split('/').map((a) => parseInt(a));
        for (let i in startTimes) {
            let leadTime = startTimes[i];
            let pulses = (leadTime / (60 / bpm)) * ppq
            let quarterNotes = pulses / ppq;
            if (!quarterNotes) {
                pickups[i] = false;
                continue;
            }
            let pickup = 1 / (((timeSignatureArr[0] / timeSignatureArr[1]) * 4 - quarterNotes) / 4)
            pickups[i] = pickup;

        }

        // let measures = [];
        let totalDurationforTracks = {};
        let numMeasuresforTracks = {};
        for (let i in tracks) {
            if (!totalDurationforTracks[i]) totalDurationforTracks[i] = 0;
            let track = tracks[i]
            if (track.notes) {
                for (let j in track.notes) {
                    try {
                        let pulses = (track.notes[j].duration / (60 / bpm)) * ppq
                        let quarterNotes = pulses / ppq;
                        totalDurationforTracks[i] += quarterNotes;
                    } catch (err) { }
                }
            }
            totalDurationforTracks[i] = totalDurationforTracks[i].toFixed(4);
            let tmp;
            if (pickups[i]) {
                tmp = totalDurationforTracks[i] - (1 / pickups[i]) * 4

            } else {
                tmp = totalDurationforTracks[i]
            }
            tmp = (tmp * timeSignatureArr[1] / 4) / timeSignatureArr[0]
            // console.log(tmp)
            if (pickups[i]) tmp++;
            tmp = parseInt(tmp.toFixed(0))
            numMeasuresforTracks[i] = tmp
        }
        // console.log(tracks[1].notes[0])
        let measuresObj = {};
        for (let i in numMeasuresforTracks) {
            let numMeasures = numMeasuresforTracks[i];
            let j = 0;
            while (j++ < numMeasures) {
                measuresObj[j - 1] = []
            }
        }

        let trackswithNotes = [];
        for (let i in tracks) {
            let track = tracks[i]
            if (track.notes) {
                trackswithNotes.push(track.notes)
            }
        }

        // console.log(timeSignature);
        // process.exit()
        // save timeSignature and pickups
        toolbox.parameters.options.tS = timeSignature;
        // shell.exec(`echo ${number}:${timeSignature}:${meter} >> /tmp/debug`)
        toolbox.parameters.options.p = pickups[1] || 0;
        ;[err, care] = await to(toolbox.edittuneheader(true, number));
        if (err) return toolbox.print.error(err);

        let measureDuration = timeSignatureArr[0] * 4 / timeSignatureArr[1];
        let notesArr = [];
        let notesArrAll = [];
        for (let i in trackswithNotes) {
            notesArr[i] = [];
            notesArrAll[i] = [];
            // let trackNum = parseInt(i);
            let track = trackswithNotes[i];
            let measure: any = 0;// measure duration
            for (let j in track) {
                let note = track[j];
                let noteTime = note.time.toFixed(4);
                let pulses = (noteTime / (60 / bpm)) * ppq
                let noteTimeinQuarterNotes: any = pulses / ppq;
                noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(5);
                if (noteTimeinQuarterNotes % 0.03125 !== 0) {
                    noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(4);
                    if (noteTimeinQuarterNotes % 0.0625 !== 0) {
                        noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(3);
                        if (noteTimeinQuarterNotes % 0.125 !== 0) {
                            noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(2);
                            if (noteTimeinQuarterNotes % 0.25 !== 0) {
                                noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(1);
                                if (noteTimeinQuarterNotes % 0.5 !== 0) {
                                    noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(0);
                                }
                            }
                        }
                    }
                }
                noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes)
                // console.log(noteTimeinQuarterNotes)
                // console.log(typeof noteTimeinQuarterNotes)
                measure = Math.floor(noteTimeinQuarterNotes / measureDuration); //check
                // measure = Math.floor(noteTimeinQuarterNotes / measureDuration);
                // console.log(measure, noteTimeinQuarterNotes, measureDuration, noteTimeinQuarterNotes.toFixed(0))
                // measure = (noteTimeinQuarterNotes / measureDuration).toFixed(0);
                // console.log(measure, noteTimeinQuarterNotes, measureDuration, timeSignature)

                let noteDuration = note.duration.toFixed(4);
                pulses = (noteDuration / (60 / bpm)) * ppq;
                let noteDurationinQuarterNotes: any = pulses / ppq;
                // console.log(noteDurationinQuarterNotes)
                // let noteDurationPoints = new Array(20).fill(0).map((val,index)=>1/Math.pow(2,(index-=2)));

                // console.log(`==>${noteDurationinQuarterNotes}`)
                let boundaryPoints = new Array(2).fill(null);
                new Array(20).fill(0).map((point, index) => {
                    point = 1 / Math.pow(2, (index -= 2));
                    point === noteDurationinQuarterNotes ?
                        boundaryPoints.fill(point) :
                        point > noteDurationinQuarterNotes ?
                            boundaryPoints[0] = point :
                            point < noteDurationinQuarterNotes && boundaryPoints[1] === null ? boundaryPoints[1] = point : false
                });

                // console.log(boundaryPoints)
                // console.log(noteDurationinQuarterNotes)
                // let noteDurationinQuarterNotesOrig = noteDurationinQuarterNotes;
                let midpoint = boundaryPoints[1] + boundaryPoints[1] / 2;
                midpoint === noteDurationinQuarterNotes ? false :
                    // midpoint < noteDurationinQuarterNotes ?
                    //     noteDurationinQuarterNotes = boundaryPoints[0] :
                    //     noteDurationinQuarterNotes = boundaryPoints[1];
                    noteDurationinQuarterNotes > midpoint ?
                        (boundaryPoints[0] - noteDurationinQuarterNotes < noteDurationinQuarterNotes - midpoint ?
                            noteDurationinQuarterNotes = boundaryPoints[0] : noteDurationinQuarterNotes = midpoint) :
                        (midpoint - noteDurationinQuarterNotes < noteDurationinQuarterNotes - boundaryPoints[1] ?
                            noteDurationinQuarterNotes = midpoint : noteDurationinQuarterNotes = boundaryPoints[1])
                // console.log(noteDurationinQuarterNotes, midpoint, boundaryPoints)


                // noteTimeinQuarterNotes += noteDurationinQuarterNotes - noteDurationinQuarterNotesOrig
                // console.log(noteDurationPoints)
                // noteDurationinQuarterNotes = parseFloat(noteDurationinQuarterNotes.toString()).toFixed(4)
                // let noteDurationinQuarterNotes0dp:any = parseFloat(noteDurationinQuarterNotes.toString()).toFixed(0);
                // if(
                //     Math.abs(noteDurationinQuarterNotes- noteDurationinQuarterNotes0dp) < 1/16
                // )noteDurationinQuarterNotes = noteDurationinQuarterNotes0dp
                // noteDurationinQuarterNotes = parseFloat(noteDurationinQuarterNotes.toString()).toFixed(5);
                // if (noteDurationinQuarterNotes % 0.03125 !== 0) {
                //     noteDurationinQuarterNotes = parseFloat(noteDurationinQuarterNotes.toString()).toFixed(4);
                //     if (noteDurationinQuarterNotes % 0.0625 !== 0) {
                //         noteDurationinQuarterNotes = parseFloat(noteDurationinQuarterNotes.toString()).toFixed(3);
                //         if (noteDurationinQuarterNotes % 0.125 !== 0) {
                //             noteDurationinQuarterNotes = parseFloat(noteDurationinQuarterNotes.toString()).toFixed(2);
                //             if (noteDurationinQuarterNotes % 0.25 !== 0) {
                //                 noteDurationinQuarterNotes = parseFloat(noteDurationinQuarterNotes.toString()).toFixed(1);
                //                 if (noteDurationinQuarterNotes % 0.5 !== 0) {
                //                     noteDurationinQuarterNotes = parseFloat(noteDurationinQuarterNotes.toString()).toFixed(0);
                //                 }
                //             }
                //         }
                //     }
                // }
                // console.log(noteDurationinQuarterNotes)

                // check
                // noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(5);
                // if (noteTimeinQuarterNotes % 0.03125 !== 0) {
                //     noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(4);
                //     if (noteTimeinQuarterNotes % 0.0625 !== 0) {
                //         noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(3);
                //         if (noteTimeinQuarterNotes % 0.125 !== 0) {
                //             noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(2);
                //             if (noteTimeinQuarterNotes % 0.25 !== 0) {
                //                 noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(1);
                //                 if (noteTimeinQuarterNotes % 0.5 !== 0) {
                //                     noteTimeinQuarterNotes = parseFloat(noteTimeinQuarterNotes.toString()).toFixed(0);
                //                 }
                //             }
                //         }
                //     }
                // }
                // console.log(noteDurationinQuarterNotes, noteTimeinQuarterNotes, noteDurationinQuarterNotes - noteDurationinQuarterNotesOrig)
                // get note duration
                let noteFromNumber = getNotefromNumber(note.midi);
                // console.log(noteFromNumber)
                notesArr[i].push(noteFromNumber[0]);
                // console.log(noteFromNumber[0]);
                noteFromNumber[0] = noteFromNumber[0].split('/').map(noteFromNumber_ => [noteFromNumber_, noteFromNumber[1]].toString().replace(/,/, '')).join('/')
                // console.log(noteFromNumber[0]);
                // noteFromNumber.push()
                // notesArrAll[i].push(noteFromNumber)
                // console.log(noteFromNumber.toString());
                // process.exit();

                // notesArrAll[i].push([noteFromNumber.toString().replace(/,/, ''), noteDurationinQuarterNotes, measure, noteTimeinQuarterNotes, noteDurationinQuarterNotes])
                notesArrAll[i].push([noteFromNumber[0], noteDurationinQuarterNotes, measure, noteTimeinQuarterNotes, noteDurationinQuarterNotes])
                // console.log(notesArrAll[i])
                // console.log(noteDurationinQuarterNotes);// see whether to add .

                // console.log(`${measure}:${measureDuration}::${noteDurationinQuarterNotes}:${getNotefromNumber(note.midi)}<=`)

                // let noteDuration = note.duration.toFixed(4); // 1/16 = 0.0625
            }
        }

        // process.exit()
        let notesforAllTracks = [];
        for (let i in notesArr) {
            notesforAllTracks = notesforAllTracks.concat(notesArr[i])
        }
        // console.log(notesArr)
        // console.log(notesArrAll)
        let tmpArr = [];
        for (let i in notesArrAll) {
            if (notesArrAll[i].length) tmpArr.push(notesArrAll[i]);
        }
        notesArrAll = tmpArr;
        key = getKeyfromNotesArray(notesforAllTracks)
        // console.table(notesforAllTracks)
        // process.exit();
        // console.log(key)

        for (let i in notesArrAll) {
            notesArrAll[i] = notesArrAll[i].map((item) => {
                // console.log(item);
                let params = [item[0], item[1], ''];
                // console.log(params)
                let tmp = getNoteFinally(params, key);
                // console.log(tmp)
                let measure = item[2];
                let noteTime = item[3];
                return [tmp, measure, noteTime, item[4]];
            })
            // console.log(notesArrAll[i])
        }
        // process.exit();
        // console.log(notesArrAll);


        let noteTimes = [];
        notesArrAll.map((track) => {
            track.map((note) => {
                // console.log(note)
                let noteTime = parseFloat(note[2]);
                if (!noteTimes.includes(noteTime)) noteTimes.push(noteTime)
            })
        })

        noteTimes.sort((a, b) => a - b);
        // console.log(noteTimes

        let tmpNumMeasures: any = [];
        for (let i in numMeasuresforTracks) {
            tmpNumMeasures.push(numMeasuresforTracks[i])
        }
        // console.log(numMeasuresforTracks)
        let numMeasures = greatestInArr(tmpNumMeasures);

        let finalMeasuresArr = new Array(numMeasures);
        let measuresTimes = new Array(numMeasures);
        let numNotesinMeasures = new Array(numMeasures);
        // numNotesinMeasures = numNotesinMeasures.map(()=>[]);
        let index = -1;
        // console.log(numNotesinMeasures.length)
        while (++index < numNotesinMeasures.length) {
            numNotesinMeasures[index] = [0, 0, 0, 0]
        }

        for (let i in notesArrAll) {
            let track = notesArrAll[i];
            track.map((note) => {
                try {
                    // console.log(note)
                    let measure = parseFloat(note[1]);
                    numNotesinMeasures[measure][i]++;
                } catch (err) { }
            })
        }
        notesArrAll.map((track) => {
            track.map((note) => {
                // console.log(note)
                let noteTime = parseFloat(note[2]);
                if (!noteTimes.includes(noteTime)) noteTimes.push(noteTime)
            })
        })

        numNotesinMeasures = numNotesinMeasures.map(item => greatestInArr(item))


        // staffNotes.noteTimes = [... noteTimes]
        for (let i in numNotesinMeasures) {
            finalMeasuresArr[i] = toolbox.staffNotes(numNotesinMeasures[i])
        }

        // noteTimes for Measure
        for (let tmpMeasure in finalMeasuresArr) {
            notesArrAll.map((track) => {
                track.map((note) => {
                    // console.log(note)
                    let measure: any = parseFloat(note[1]);
                    let noteTime = parseFloat(note[2]);
                    // console.lo
                    if (parseInt(measure) === parseInt(tmpMeasure)) {
                        if (measuresTimes[tmpMeasure] === undefined) measuresTimes[tmpMeasure] = [];
                        if (!measuresTimes[tmpMeasure].includes(noteTime)) measuresTimes[tmpMeasure].push(noteTime)
                    }
                    // if (!noteTimes.includes(noteTime)) noteTimes.push(noteTime)
                })
            })
        }
        ;
        measuresTimes = measuresTimes.map(item => item.sort((a, b) => a - b))
        for (let tmpMeasure in measuresTimes) {
            finalMeasuresArr[tmpMeasure].noteTimes = measuresTimes[tmpMeasure];
            finalMeasuresArr[tmpMeasure].measure = new Array(measuresTimes[tmpMeasure].length).fill(parseInt(tmpMeasure));
        }

        // console.log()
        for (let i in notesArrAll) {
            let track = notesArrAll[i];
            track.map((note) => {

                try {
                    let measure: any = parseInt(note[1]);
                    let noteTime = parseFloat(note[2]);
                    // console.log(measure, i, note)
                    let columnIndex = finalMeasuresArr[measure].noteTimes.indexOf(noteTime);
                    let noteLetter = note[0].replace(/is/, '').replace(/es/, '').replace(/[0-9]/g, '').replace(/\./g, '').toUpperCase();
                    // console.log(noteLetter)
                    finalMeasuresArr[measure][noteLetter][columnIndex] === undefined ?
                        finalMeasuresArr[measure][noteLetter][columnIndex] = `${i}:${note[0]}` :
                        finalMeasuresArr[measure][noteLetter][columnIndex] += `;${i}:${note[0]}`;
                } catch (err) { }
            })
        }

        finalMeasuresArr = toolbox.deleteEmptyKeys(finalMeasuresArr);
        return { finalMeasuresArr, key, timeSignature, pickups };
    }
    toolbox.tunefromhymndata = async (number = false, print = false) => {
        let [err, care] = await to(toolbox.getHymnHeader(number))
        if (err) return toolbox.print.error(err)
        let hymnHeader = care;
        toolbox.parameters.options.t = hymnHeader.tune;
        ;[err, care] = await to(toolbox.getTuneFromSavedFile(number));
        if (err) {
            [err, care] = await to(getfinalMeasuresArr(number));
            if (err) return toolbox.print.error(err)
        }
        let { finalMeasuresArr, key, timeSignature, pickups } = care;

        // toolbox.printer(finalMeasuresArr)
        // process.exit()

        finalMeasuresArr = toolbox.trackOrderError(finalMeasuresArr);
        // console.log(number, toolbox.parameters.options, timeSignature)
        // return
        toolbox.parameters.options.tS = timeSignature
        await toolbox.missingMeterError(finalMeasuresArr);

        finalMeasuresArr = toolbox.chordProgression(finalMeasuresArr, key);
        // return
        
        // finalMeasuresArr.map(item => console.table(item))
        finalMeasuresArr = toolbox.checkMissingNotes(finalMeasuresArr);

        finalMeasuresArr = toolbox.noteTimes(finalMeasuresArr, timeSignature, pickups)
        // toolbox.printer(finalMeasuresArr)
        // process.exit()
        finalMeasuresArr = toolbox.checkTies(finalMeasuresArr, timeSignature, pickups);
        await toolbox.save(finalMeasuresArr);
        if (print) toolbox.printer(finalMeasuresArr);
    }
}
