import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.trackandNotefromNotePoint =  (noteStrAtPoint) => {
    if(noteStrAtPoint === undefined)return [];
    let noteDurationsAtPoint:any = [];
    noteStrAtPoint.split(';').map(singleNote => {
      noteDurationsAtPoint.push([toolbox.tracksfromNotePoint(singleNote)[0], singleNote.split(':')[1], singleNote.match(/_/)?true:false])
    })
    return noteDurationsAtPoint;
  }
}