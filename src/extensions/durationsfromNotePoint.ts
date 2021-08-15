import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.durationsfromNotePoint =  (noteStrAtPoint) => {
    if(noteStrAtPoint === undefined)return '';
    let noteDurationsAtPoint = [];
    noteStrAtPoint.split(';').map(singleNote => {
      noteDurationsAtPoint.push(singleNote.match(/[0-9]+[.]*$/)[0])
    })
    return noteDurationsAtPoint;
  }
}