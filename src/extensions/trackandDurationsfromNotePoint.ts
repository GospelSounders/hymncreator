import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.trackandDurationsfromNotePoint = (noteStrAtPoint) => {
    if (noteStrAtPoint === undefined) return [];
    let noteDurationsAtPoint: any = [];
    noteStrAtPoint.split(';').map(singleNote => {
      let duration = parseInt(singleNote.match(/[0-9]+[.]*$/)[0]);
      let lastDuration = (1/duration) / 2;
      let extendedNotes = singleNote.split('.')
      extendedNotes.pop();
      extendedNotes.map(() => {  duration = 1/( 1/duration + lastDuration ); lastDuration /= 2 }) // can use for loop
      // console.log(singleNote, duration, lastDuration, extendedNotes)
      noteDurationsAtPoint.push([toolbox.tracksfromNotePoint(singleNote)[0], duration, 1/duration *4])
    })
    return noteDurationsAtPoint;
  }
}