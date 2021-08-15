import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.insertTie = (measure, noteNuminMeasure, track) => {
    try {
      track = parseInt(track)

      let nextTrackNote = toolbox.nextTrackNote(measure, noteNuminMeasure, track)
      // console.log('insert tie for...', noteNuminMeasure, track, nextTrackNote)
      let note = nextTrackNote[0];
      noteNuminMeasure = nextTrackNote[1];
      // console.log(note, noteNuminMeasure, track)
      // console.log(measure)
      let nextNotes = measure[note][noteNuminMeasure];
      let hasTies = toolbox.hasTies(nextNotes);
      nextNotes = toolbox.trackandNotefromNotePoint(nextNotes) || []; // show ties

      let retNotes = [];
      let index = 0;
      nextNotes.map(item => {
        let itemTrack = item[0];
        let itemNoteAndCo = item[1];
        itemTrack === track && itemNoteAndCo !== '0' ?
          retNotes.push(`_${itemTrack}:${itemNoteAndCo}`) :
          hasTies[index] ?
            retNotes.push(`_${itemTrack}:${itemNoteAndCo}`) :
            retNotes.push(`${itemTrack}:${itemNoteAndCo}`);
        index++;
      })
      measure[note][noteNuminMeasure] = retNotes.join(';')
      // console.table(measure)

    } catch (err) { }
    return measure;
  }
}