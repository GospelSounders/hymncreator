import { GluegunToolbox, filesystem } from 'gluegun'

/*
 * Lyrics for:
 * - pdftomusic
 * - vocaloid
 * - synthv
 */

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.lyricsGenerator = (finalMeasuresArr, number) => {
    console.log(finalMeasuresArr)
    let pdf2musicLyrics:any = new Array(4).fill('');
    let stanzas = [];

    // get stanzas
    finalMeasuresArr.map(measure => {
      // let numRows = measure.measure.filter(item => parseInt(item) !== NaN).length;
      // let numStanzas = 0;
      Object.keys(measure).map(columnName => {
        let test = columnName.match(/Stanza([0-9])-Trk[0-9]/)
        console.log(test)
        if (test) {
          if (!stanzas.includes(test[1])) stanzas.push(test[1])
        }
      })
    })
    // console.log(stanzas);
    // process.exit();
    while (stanzas.length) {
      let stanza = stanzas.shift();
      finalMeasuresArr.map(measure => {
        // let numRows = measure.measure.filter(item => parseInt(item) !== NaN).length;
        // let numStanzas = 0;
        Object.keys(measure).map(columnName => {
          let pattern = `Stanza${stanza}-Trk([0-9])`
          // console.log(columnName, new RegExp( pattern))
          let test = columnName.match(new RegExp(pattern))

          if (test) {

            let track = parseInt(test[1]) - 1
            let numRows = measure.measure.filter(item => parseInt(item) !== NaN).length;
            // console.log(stanzas.length, stanza, numRows, track, test)
            let ii = -1;
            while (++ii < numRows) {
              if (measure[columnName][ii]) pdf2musicLyrics[track] += measure[columnName][ii];
              else {
                // check if track has tie
                Object.keys(measure).map(columnNameInner => {
                  if (toolbox.isNoteColumn(columnNameInner)) {
                    try {
                      if (measure[columnNameInner][ii].match(new RegExp(`${track}:`)))
                        pdf2musicLyrics[track] += '<tie> '
                    } catch (err) { }
                  }
                })
              }
            }
          }
        })

        pdf2musicLyrics = pdf2musicLyrics.map(lyrics => lyrics.replace(/ <tie>/, '<tie>').replace(/-<tie> /, '-<tie>') + '/')
      })
    }
    pdf2musicLyrics = pdf2musicLyrics.join('\n\n\n')
    // save these lyrics
    filesystem.write(`ly/${toolbox.parameters.options.h}/${number}.hAss`, pdf2musicLyrics)
    console.log(pdf2musicLyrics)
    // toolbox.printer(finalMeasuresArr)
  }
}