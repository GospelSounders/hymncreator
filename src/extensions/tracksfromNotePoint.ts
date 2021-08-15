import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.tracksfromNotePoint =  (noteStrAtPoint = '') => {
    let notesAtPoint = [];
    noteStrAtPoint.split(';').map(singleNote => {
      notesAtPoint.push(parseInt(singleNote.split(':')[0].replace(/_/,'')))
    })
    return notesAtPoint;
  }
}