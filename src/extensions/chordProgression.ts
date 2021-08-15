import { GluegunToolbox } from 'gluegun'
const { Chord, Key } = require("@tonaljs/tonal");

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.chordProgression = (finalMeasuresArr, key) => {
    let chords;
    if (key.includes("Major")) {
      chords = Key.majorKey(key.split(' ')[0])
    } else {
      chords = Key.minorKey(key.split(' ')[0])
    }
    chords = chords.chords;
    let keysinChords = {};
    for (let i in chords) {
      keysinChords[chords[i]] = Chord.get(chords[i]).notes
    }
    chords = keysinChords;

    function chordProgressionDetect(notes, chords) {
      let uniqueNotes = notes.filter((v, i) => notes.indexOf(v) === i)
      // b.every(v => a.includes(v)) // true if b is a subset of a and false otherwise
      let chords_ = [];
      let chordNum = 0, index = 0;;
      for (let i in chords) chords_.push(chords[i])
      chords_.map(chord => {
        index++;
        if (uniqueNotes.every(note => chord.includes(note)))
          if (chordNum === 0) chordNum = index;  // first number we arrive at
      })
      // for(let)
      return chordNum
    }

    // get chords
    finalMeasuresArr.map(measure => {
      measure.chord = [];
      let index = -1;
      let numChordsinMeasure = measure.noteTimes.length;

      while (++index < numChordsinMeasure) {
        let notesInMeasure = [];
        for (let i in measure) {
          let columnName = i;
          if (toolbox.isNoteColumn(columnName)) {
            let noteStuff_ = measure[i][index] || '';
            // console.log(noteStuff_)
            noteStuff_.split(';').map(noteStuff => {
              try {
                let noteLetter = noteStuff.toString().replace(/_*[0-9]/g, '').replace(/is/, '#').toUpperCase().replace(/es/, 'b').replace(/[',\.]/g, '').replace(/:/, '');
                if (noteLetter !== '') notesInMeasure.push(noteLetter)
              } catch (err) { }
            })
          }
        }
        // console.log(notesInMeasure)

        // console.log(notesInMeasure)
        let chord = chordProgressionDetect(notesInMeasure, chords);
        // console.log(`chord:${JSON.stringify(chord)}`)
        // process.exit();
        // console.log(measure)
        if (!measure.chord) measure.chord = [];
        measure.chord.push(chord /*+ 1*/)
        // measure.CHORD[0] =  chord;
        // console.log(notesInMeasure)
        // console.log(Key.majorKey(key.split(' ')[0]))
        // console.log(key)
      }

    })
    return finalMeasuresArr;
  }
}