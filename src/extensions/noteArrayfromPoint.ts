import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.noteArrayfromPoint =  (noteStrAtPoint) => {
    let notesAtPoint = [];
    noteStrAtPoint.split(';').map(singleNote => {
      notesAtPoint.push(parseInt(singleNote.split(':')[0]))
    })
    return notesAtPoint;
  }
}