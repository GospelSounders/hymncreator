import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.checkMissingNotes = (ahMusicObject) => {
    // console.log(ahMusicObject)
    // // let missingNotes = new Array(ahMusicObject.length).fill(0).map(arr=>new Array(10))  // assume max of 10 tracks
    // let missingNotes = new Array(ahMusicObject.length) // assume max of 10 tracks
    // let numTracks = 0;
    // console.log(ahMusicObject)
    ahMusicObject.map(measure => {
      // console.log(measure);
      // console.log('////////////////////')
      let trackNoteDurations = {};
      let trackNoteDurationsArr = [];
      for (let i in measure) {
        let columnName = i;
        let measureItem = measure[i]

        // console.log(measureItem)
        measureItem.map(elem => {
          try {
            // console.log('====================')
            // console.log(elem)
            if (toolbox.isNoteColumn(columnName)) {
              // let areNotes = elem.toString().includes(":");
              // if (areNotes) {
              elem.split(';').map(singleNote => {
                if (!singleNote.length) return;
                // console.log(singleNote)
                // console.log(singleNote.length)
                let trackNumber = singleNote.split(':')[0].replace(/_/, '')      //check
                singleNote = singleNote.match(/[0-9]+[.]*$/)[0];     //check
                singleNote = singleNote.split('.')
                singleNote = singleNote.reverse();
                let ret = 1 / parseInt(singleNote.pop());
                let singleNoteret = 1 / ret;
                let singleNote_i = 2;
                while (singleNote.length) {
                  singleNote.pop();
                  ret += 1 / (singleNote_i * singleNoteret)
                  singleNote_i *= 2;
                }
                // if (ret[0] !== NaN) {
                if (trackNoteDurations[trackNumber] === undefined) trackNoteDurations[trackNumber] = 0;
                trackNoteDurations[trackNumber] += ret;
                // }
              })
            }
          } catch (err) { }
        })
      }

      // console.log(trackNoteDurations);
      // if([...Object.keys(trackNoteDurations)].includes(NaN) > -1)
      // process.exit();

      for (let [key, value] of Object.entries(trackNoteDurations)) {
        // console.log(key)
        // if(<any>key !== NaN)
        trackNoteDurationsArr.push([parseInt(key), value])
      }
      let trackNoteDurationsArrSorted = trackNoteDurationsArr.sort();
      let trackNoteDurationsArrvaluesOnly = [];
      trackNoteDurationsArrvaluesOnly = trackNoteDurationsArrSorted.map(elem => elem[1])
      // check if all noteDurations for tracks are equal
      if (trackNoteDurationsArrvaluesOnly.every((val, i, arr) => val === arr[0])) {
        try {
          measure.noteDurations = trackNoteDurationsArr
          delete measure.missingNotes
        } catch (err) { }
      } else {

        measure.noteDurations = trackNoteDurationsArr
        measure.missingNotes = trackNoteDurationsArr
      }
      // console.table(measure)
    });
    return ahMusicObject;
  }
}