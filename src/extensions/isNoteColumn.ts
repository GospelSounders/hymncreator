import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.isNoteColumn =  (column) => {
    let staffNotes = toolbox.staffNotesOnly()
    return Object.keys(staffNotes).includes(column);
  }
}