import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.staffNotesOnly =  (numNotesinMeasure = 1) => {
    let staffNotes = {
      "B''": new Array(numNotesinMeasure),
      "A''": new Array(numNotesinMeasure),
      "G''": new Array(numNotesinMeasure),
      "F''": new Array(numNotesinMeasure),
      "E''": new Array(numNotesinMeasure),
      "D''": new Array(numNotesinMeasure),
      "C''": new Array(numNotesinMeasure),
      "B'": new Array(numNotesinMeasure),
      "A'": new Array(numNotesinMeasure),
      "G'": new Array(numNotesinMeasure),
      "F'": new Array(numNotesinMeasure),
      "E'": new Array(numNotesinMeasure),
      "D'": new Array(numNotesinMeasure),
      "C'": new Array(numNotesinMeasure),
      'B': new Array(numNotesinMeasure),
      'A': new Array(numNotesinMeasure),
      'G': new Array(numNotesinMeasure),
      'F': new Array(numNotesinMeasure),
      'E': new Array(numNotesinMeasure),
      'D': new Array(numNotesinMeasure),
      "C": new Array(numNotesinMeasure),
      "B,": new Array(numNotesinMeasure),
      "A,": new Array(numNotesinMeasure),
      "G,": new Array(numNotesinMeasure),
      "F,": new Array(numNotesinMeasure),
      "E,": new Array(numNotesinMeasure),
      "D,": new Array(numNotesinMeasure),
      "C,": new Array(numNotesinMeasure),
      "B,,": new Array(numNotesinMeasure),
      "A,,": new Array(numNotesinMeasure),
      "G,,": new Array(numNotesinMeasure),
      "F,,": new Array(numNotesinMeasure),
      "E,,": new Array(numNotesinMeasure),
      "D,,": new Array(numNotesinMeasure),
      "C,,": new Array(numNotesinMeasure)
  };
  return staffNotes;
  }
}