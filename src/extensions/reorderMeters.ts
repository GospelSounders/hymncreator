import { GluegunToolbox } from 'gluegun'
const to = require('await-to-js').to

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.reorderMeters = async (number = false) => {
    // let [err, care] = await to(toolbox.getHymnHeader(number || toolbox.parameters.options.n))
    // if (err) return toolbox.print.error(err)
    // let hymnHeader = care;
    // ;[err, care] = await to(toolbox.getHymnHeader(number || toolbox.parameters.options.n))
    // if (err) return toolbox.print.error(err)
    // let tuneHeader = care;
    // let anacrusis = tuneHeader.anacrusis
    // let timeSignature = tuneHeader.timeSignature || tuneHeader.time_signature;

    let [err, care] = await to(toolbox.getTuneFromSavedFile(number));
    if (err) return toolbox.print.error(err)
    let { finalMeasuresArr, key, timeSignature, pickups } = care;
    timeSignature = timeSignature.split('/').map(item => parseInt(item))
    let beat = 1 / timeSignature[1]
    let measureLengthinQuarterNotes = (timeSignature[0] * beat) * 4;
    let anacrusis = pickups
    finalMeasuresArr; key; anacrusis; measureLengthinQuarterNotes

    let numNotes = finalMeasuresArr.map(measure =>
      measure.measure.filter(column => column !== undefined).map(column => 1).reduce((a, b) => a + b, 0)
    ).reduce((a, b) => a + b, 0)
    console.log(numNotes)
    let tmp = toolbox.staffNotes();
    finalMeasuresArr.map(measure => {
      Object.keys(measure).map(columnName => {
        if (tmp[columnName] === undefined) {
          tmp[columnName] = [];
        } else { }
      })
    })
    Object.keys(tmp).map(columnName => {
      tmp[columnName] = [];
    })


    // console.log(tmp); process.exit();
    // toolbox.printer(tmp);
    let noteIndex_ = 0;
    finalMeasuresArr.map(measure => {
      let numColumns = measure.measure.filter(column => column !== undefined).length;
      Object.keys(measure).map(columnName => {
        // console.log(measure.measure, numColumns, noteIndex_)
        let counter = -1;
        try {
          while (++counter < numColumns) {
            tmp[columnName][noteIndex_ + counter] = measure[columnName][counter] || ""
          }
        } catch (err) {
          console.log(err)
          console.log(columnName)
          process.exit();
        }
      })
      noteIndex_ += numColumns
    })

    // process.exit();
    // console.log(tmp); process.exit();
    // for (let z in tmp) console.log(z, tmp[z][0]); process.exit();
    // Object.keys(tmp).map(column => tmp[column] = tmp[column].slice(1, numNotes + 1))
    // console.table(tmp)
    console.log(anacrusis)
    // for (let z in tmp) console.log(z, tmp[z][0]); process.exit();
    let startTime = 0;
    let startTimeDiff = 0;
    // try {
    if (anacrusis) {
      anacrusis = parseInt(anacrusis.toString())
      let anacrusisInQNotes = 4 / anacrusis
      startTime = measureLengthinQuarterNotes - anacrusisInQNotes
      startTimeDiff = parseFloat(tmp.noteTimes[0]) - startTime;
      // console.log('anacrusisInQNotes', anacrusisInQNotes, measureLengthinQuarterNotes, startTime, startTimeDiff, tmp.noteTimes[0])
      // console.log(tmp.noteTimes)
    }
    tmp.noteTimes = tmp.noteTimes.map(item => parseFloat(item) - startTimeDiff)
    // console.log(tmp.noteTimes)
    // let noteIndex = 0
    // let measuresData = [];
    let measuresCount = 0;
    tmp.noteTimes.map(dontcare => {
      measuresCount = Math.floor(dontcare / measureLengthinQuarterNotes);
    })
    measuresCount++
    let numNotesinMeasures = new Array(measuresCount).fill(0);
    tmp.noteTimes.map(dontcare => {
      let currentMeasure = Math.floor(dontcare / measureLengthinQuarterNotes);
      // console.log(currentMeasure, dontcare, numNotesinMeasures[currentMeasure])
      numNotesinMeasures[currentMeasure]++
    })

    // process.exit();
    let measuresData = [];
    let noteIndex = 0;

    try {
      numNotesinMeasures.map(num => {
        // for(let z in tmp)console.log(z, tmp[z][noteIndex])
        let tmpMeasure = toolbox.staffNotes(num)
        Object.keys(tmp).map(columnName => {
          tmpMeasure[columnName] = [];
        })
        // console.log(toolbox.staffNotes(num));
        let tmpIndex = -1;
        while (++tmpIndex < num) {
          // console.log('tmpIndex', tmpIndex)
          for (let column in tmp) {
            // console.log(column, tmpIndex)
            tmpMeasure[column][tmpIndex] = tmp[column][noteIndex]
            tmpMeasure["measure"][tmpIndex] = Math.floor(tmpMeasure["noteTimes"][tmpIndex] / measureLengthinQuarterNotes);
          }
          noteIndex++;
        }
        measuresData.push(tmpMeasure);
        // toolbox.printer(measuresData)
        // console.log(numNotesinMeasures)
        // process.exit();
      })
    } catch (err) {
      console.log(err)
    }
    // toolbox.print.error('-----------'); process.exit();
    toolbox.printer(measuresData)
    console.log(numNotesinMeasures)

    // console.log(numNotesinMeasures);
    // let currentMeasure = 0;
    // let noteIndex = 0;
    // tmp.noteTimes.map(dontcare => {
    //   // let currentMeasure = Math.floor(dontcare / measureLengthinQuarterNotes);
    //   // numNotesinMeasures[currentMeasure]++

    // })
    // let numNotesinMeasures = [];

    // if(numNotesinMeasures[currentMeasure] === undefined)numNotesinMeasures[currentMeasure] = 
    //   console.log(currentMeasure)
    // } catch (err) {
    //   console.error(err)
    // }
    // tmp.measure.noteTimes.map()
    // edit the noteTimes;;
  }
}