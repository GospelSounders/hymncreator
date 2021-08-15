import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.areThereAllTiedNotesinThisLine = (lineNumber, finalMeasuresArr, meter) => {
    let numNotesforOtherLines = 0, i = -1;
    while (++i < lineNumber) numNotesforOtherLines += parseInt(meter.split('.')[i])
    let ret = toolbox.staffNotes(20)
    for (let i in ret) ret[i] = []

    let noteIndex = 0
    let newColumnIndex = 0;
    for (let i in finalMeasuresArr) {
      let measure = finalMeasuresArr[i];

      let numColumns = measure.measure.length;
      let columns = Object.keys(measure);
      let ii = -1;
      // console.log(measure.measure[0])
      ii; numColumns; columns; noteIndex;

      let columnIndex = 0;
      measure.measure.map(columnIndex_ => {
        // check for tie
        let hasTie = false;
        Object.keys(measure).map(columnName => {
          let elem = measure[columnName][columnIndex];
          if (toolbox.isNoteColumn(columnName)) {
            if (elem !== undefined) if (elem.match(/_/)) hasTie = true;
          }
        })

        if (numNotesforOtherLines <= noteIndex && noteIndex < (numNotesforOtherLines + parseInt(meter.split('.')[lineNumber]))) {
          Object.keys(measure).map(columnName => {
            if (ret[columnName] === undefined) ret[columnName] = new Array(20)
          })
          Object.keys(measure).map(columnName => {
            ret[columnName][newColumnIndex] = measure[columnName][columnIndex] || ""
          })
          newColumnIndex++
        }
        if (!hasTie) {
          noteIndex++
        }
        columnIndex++;
      })



    }
    ret = toolbox.deleteEmptyKeys([ret])[0];
    let allNumNotes = ret.measure.length;
    let allNumNotesMinusAllNotesTied = allNumNotes
    let allNumNotesMinusAllNotesTiedandSingleTies = allNumNotes
    let ii = -1;
    while (++ii < allNumNotes) {
      let columnHasTie = false
      let columnMissingUntied = false;
      Object.keys(ret).map(columnName => {
        let elem = ret[columnName][ii];
        if (toolbox.isNoteColumn(columnName)) {
          if (elem !== undefined) {
            if (elem.match(/_/)) columnHasTie = true;
            else columnMissingUntied = true;
          }
        }
      })
      if (columnHasTie) allNumNotesMinusAllNotesTiedandSingleTies--;
      if (columnHasTie && !columnMissingUntied) allNumNotesMinusAllNotesTied--
    }
    console.table(ret)
    return { allNumNotes, allNumNotesMinusAllNotesTied, allNumNotesMinusAllNotesTiedandSingleTies }
  }
}