import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.staffNotes =  (numNotesinMeasure = 1) => {
    let staffNotes = {
      'measure': new Array(numNotesinMeasure),
      'noteTimes': new Array(numNotesinMeasure),
      "chord": new Array(numNotesinMeasure)
  };
  return {...staffNotes, ...toolbox.staffNotesOnly(numNotesinMeasure)};
  }
}