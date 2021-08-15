import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.noteTimes = (ahMusicObject, timeSignature, pickup: any = false) => {
    let startTimeinQuarterNotes = 0;
    if (typeof pickup === 'object') {
      for (let i in pickup) {
        pickup = pickup[i];
        break;
      }
    }
    if(typeof pickup === 'string'){
      pickup = parseInt(pickup)
    }
    if (pickup) {
      timeSignature = timeSignature.split('/').map(item => parseInt(item));
      let quarterNotesinMeasure = ((1 / parseInt(timeSignature[1])) / 0.25) * timeSignature[0];
      let quarterNotesinPickup = parseInt(pickup) === quarterNotesinMeasure ? 0 : (1 / parseInt(pickup)) / 0.25;
      startTimeinQuarterNotes = quarterNotesinMeasure - quarterNotesinPickup;
      // console.log(quarterNotesinMeasure);
      // console.log(quarterNotesinPickup);
    }
    // console.log(timeSignature)
    // console.log(startTimeinQuarterNotes);process.exit();

    ahMusicObject.map(measure => {
      let index = -1;
      let numColumnElements = measure.noteTimes.length;
      while (++index < numColumnElements) {
        let noteDurations = [];
        let noteDurations1 = [];
        for (let columnName in measure) {
          let column = measure[columnName]
          try {
            if (toolbox.isNoteColumn(columnName)) {

              noteDurations = noteDurations.concat(toolbox.durationsfromNotePoint(column[index]))
            }
            noteDurations.map(durationStr => {
              try {
                let durationNum = parseInt(durationStr.match(/[0-9]+/)[0])
                let durationNumCopy = durationNum;
                let numDots = (durationStr.match(/./g) || [0]);
                let singleNote_i = 2;
                numDots.pop(); // get the number of dots in array length
                let ret = 1 / durationNumCopy;
                for (let it of numDots) {
                  it;
                  ret += 1 / (singleNote_i * durationNumCopy)
                  singleNote_i *= 2;
                }
                noteDurations1.push(ret)
              } catch (err) { }

            })
          } catch (err) {
            console.error(err)
          }
        }
        measure.noteTimes[index] = startTimeinQuarterNotes
        let leastDuration = Math.min(...noteDurations1)
        startTimeinQuarterNotes += leastDuration*4; // in quaterNotes


      }
    })

    return ahMusicObject;
  }
}

/*
6/8


*/