import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.hasTies =  (noteStrAtPoint = '') => {
    let notesAtPoint = [];
    noteStrAtPoint.split(';').map(singleNote => {
      notesAtPoint.push((singleNote.split(':')[0].match(/_/) || []).length)
    })
    notesAtPoint.map(item=>item===0?false:true)
    return notesAtPoint;
  }
}