import { GluegunToolbox, filesystem } from 'gluegun'
const to = require('await-to-js').to
const shell = require("shelljs")

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.tunetoLy = async (number, overwrite = true) => {
    let [err, care] = await to(toolbox.getHymnHeader(number))
    if (err) return toolbox.print.error(err)
    let hymnHeader = care;
    // console.log(hymnHeader)
    toolbox.parameters.options.t = hymnHeader.tune;

    ;[err, care] = await to(toolbox.getTuneFromSavedFile(number));
    if (err) return toolbox.print.error(err)
    let { finalMeasuresArr, key, timeSignature, pickups } = care;

    ;[err, care] = await to(toolbox.getTuneHeader(number));
    if (err) return toolbox.print.error(err)
    let tuneHeader = care;
    ;[err, care] = await to(toolbox.metricalPattern(number));
    if (err) return toolbox.print.error(err)
    let meter = care;
    toolbox.printer(finalMeasuresArr)
    console.log(key, timeSignature, pickups, meter)
    console.log(tuneHeader)
    console.log(hymnHeader)

    toolbox.lyricsGenerator(finalMeasuresArr, number);
    process.exit();

    let hasArranger = tuneHeader.arranger !== undefined ? tuneHeader.arranger.toString() !== '0' ? tuneHeader.arranger : "" : ""
    let arrangeryear = (tuneHeader.arrangerYear || tuneHeader.arranger_year || "").toString();
    let hasArrangerYear = hasArranger !== "" ? arrangeryear !== '0' && arrangeryear !== "-" ? `${arrangeryear}` : "" : ""


    let composerYear = (tuneHeader.year || "").toString();
    composerYear = composerYear !== '0' && composerYear !== "-" ? `${composerYear}` : ""


    let authorYear = (hymnHeader.year || "").toString();
    authorYear = authorYear !== '0' && authorYear !== "-" ? `${authorYear}` : ""

    let hasTranslator = hymnHeader.translator !== undefined ? hymnHeader.translator.toString() !== '0' ? `Tr: ${hymnHeader.translator}` : "" : ""
    let Translatoryear = (hymnHeader.translatorYear || hymnHeader.translator_year || "").toString();
    let hasTranslatorYear = hasTranslator !== "" ? Translatoryear !== '0' && Translatoryear !== "-" ? `${Translatoryear}` : "" : ""

    let formatYear = function (yearStr) {
      let yearAndyears = yearStr.match(/[0-9]{4}( *)\([0-9]{4}/)
      if (yearAndyears) {
        yearStr = `, ${yearStr}`
      } else {
        yearAndyears = yearStr.match(/^[0-9]{4}/)
        if (yearAndyears) yearStr = `(${yearStr})`
      }
      yearStr = yearStr.replace(/([0-9])(\()/, `$1 $2`)
      return yearStr
    }
    authorYear = formatYear(authorYear)
    hasTranslatorYear = formatYear(hasTranslatorYear)
    composerYear = formatYear(composerYear)
    hasArrangerYear = formatYear(hasArrangerYear)

    let hasScripture = (hymnHeader.scriptureTexts || hymnHeader.scripture_texts || "").trim();
    if (hasScripture.length > 0) hasScripture = `“${hasScripture}” (${hymnHeader.scripture})`


    let lilyTxt = `
    #(define-markup-command (forceLeft layout props content) (markup?)
    (interpret-markup layout props
      #{
        \\markup \\fill-line { #content \\null }
      #}
      ))
% \\paper {
% oddFooterMarkup = \\markup {
%    \\fill-line {
%         \\fromproperty #'header:copyright
%         ""
%         \\fromproperty #'header:topic
%       }
% }
% evenFooterMarkup = \\markup {
%    \\fill-line {
%         \\fromproperty #'header:copyright
%         ""
%         \\fromproperty #'header:topic
%       }
% }
% }
\\header
    {
    %   piece = \\markup { \\pad-around #6 
    %   % \\fontsize #4 \\bold "Waltz No. 2" 
    %    \\column {
    %   \\line { \\fontsize #0.5  "${hymnHeader.title}" }
    %   \\line { \\lower #1 \\fontsize #3 \\bold "${hymnHeader.hymnnumber}" }
    % }
      % }
       title = \\markup {
      \\fill-line {
        \\fromproperty #'header:number
        \\fromproperty #'header:titleName
        \\fromproperty #'header:opus
      }
    }
    titleName = "${hymnHeader.title}"
    number = "${hymnHeader.hymnnumber}"
    % opus ="opus"
    % Rq:
    % -> font sizes
    %         title
    %         scripture text
    %         composer & co.
    %         copyright
    %   copyright
   %subsubtitle = \\markup \\italic \\normal-text { \\line { ${hasScripture}}  }
   subsubtitle = \\markup \\override #'(baseline-skip . 1) \\normal-text \\teeny \\center-column \\override #'(line-width . 100)  \\wordwrap-lines{ 
    ${hasScripture}
  }
  %  subsubtitle = \\markup { \\column { scripture texts. All combined here... Remove Bold}  }
      % tagline = "tagline"  % removed
      % title = "1. Before Jehovah's Awful Throne"
      % composer = "John Hatton(1793). Arr: William W. How"
      composer = \\markup { \\override #'(baseline-skip . 2) \\small { \\column { \\halign #RIGHT "${hymnHeader.tune}. ${tuneHeader.meter}" ${hasArranger ? `\\halign #RIGHT  \\italic "${hasArranger} ${hasArrangerYear}"` : ""}  \\halign #RIGHT \\italic "${tuneHeader.composer} ${composerYear}"}  }}
      % poet = "Isaac Watts(1674-1748). Tr: translator(Year)"
      poet = \\markup {  \\override #'(baseline-skip . 2) \\small \\italic { \\column { " " ${hasTranslator ? `"${hasTranslator} ${hasTranslatorYear}"` : ""} "${hymnHeader.author}${authorYear}"}  }}
      tagline = "© Gospel Sounders Ministry. All rights reserved."
      copyright = \\markup \\italic "${hymnHeader.topic.toUpperCase()}"
      % copyright = \\markup {
      % \\fill-line {
      %   "WORSHIP AND ADORATION"
      %   ""
      %   "© Gospel Sounders Ministry. All rights reserved."
      % }
      % }
      % subtitle = "DUKE STREET L.M."
    }
    \\version "2.18.2"
    
    %
    %% global for all staves
    %\n`
    let global = 'global = { ';
    // key = hymnHeader.key;
    // let timesignature = 
    global += `\\key ${key.split(' ')[0].replace('#', 'is').replace(/b/, "es").toLowerCase()} \\${key.split(' ')[1].toLowerCase()} \\time ${timeSignature} `
    // let tempo = `\\tempo ${timesignature[2]} = ${parseInt(bpm)} ` // \\tempo 4 = 120 // check.
    let tempo = `\\tempo 4 = 120` // \\tempo 4 = 120
    global += tempo
    let partial = parseInt(tuneHeader.anacrusis) ? `\\partial ${tuneHeader.anacrusis}` : '' // ` \\ partial 4`
    global += partial
    global += ' }'
    lilyTxt += global;


    lilyTxt += `\n%Individual voices\n`
    lilyTxt += `\nsoprano = {${trackNotes(0)}}`
    lilyTxt += `\nalto = {${trackNotes(1)}}`
    lilyTxt += `\ntenor = {${trackNotes(2)}}`
    lilyTxt += `\nbass = {${trackNotes(3)}}`
    // track1
    trackNotes(0)
    function trackNotes(track) {
      let trackNoteStr = '';
      finalMeasuresArr.map(measure => {
        let rowsNum = measure.measure.length
        let index = -1;
        // let lastWasSlurred = false;
        while (++index < rowsNum) {
          Object.keys(measure).map(columnName => {
            if (toolbox.isNoteColumn(columnName)) {
              // console.log(columnName, index)
              // console.log(columnName())
              let noteData_ = toolbox.trackandNotefromNotePoint(measure[columnName][index]);
              noteData_.map(noteData => {
                let noteTrack = noteData[0]
                let note = noteData[1]
                let withTies = noteData[2]
                if (!noteTrack && noteTrack !== 0) return;
                if (noteTrack.toString() === track.toString()) {
                  trackNoteStr += `${withTies ? "_" : ""}${note} `
                }
              })

            }

          })
        }
      })
      trackNoteStr = trackNoteStr.replace(/([a-z0-9',]*) _([a-z0-9',]*) _([a-z0-9',]*) _([a-z0-9',]*)/g, "$1( $2 $3 $4)")
      trackNoteStr = trackNoteStr.replace(/([a-z0-9',]*) _([a-z0-9',]*) _([a-z0-9',]*)/g, "$1( $2 $3)")
      trackNoteStr = trackNoteStr.replace(/([a-z0-9',]*) _([a-z0-9',]*)/g, "$1( $2)")
      return trackNoteStr
    }

    function getStanzas() {
      let charArray = new Array(26).fill(1).map((_, i) => String.fromCharCode(97 + i));
      let stanzasData = {};
      finalMeasuresArr = toolbox.getBlottedWords(finalMeasuresArr)
      // toolbox.printer(finalMeasuresArr);process.exit()
      finalMeasuresArr.map(measure => {
        let rowsNum = measure.measure.length
        let index = -1;
        while (++index < rowsNum) {
          let setStanzas = {};
          Object.keys(measure).map(columnName => {

            if (columnName.match(/Stanza[0-9]-/)) {
              let stanzaNum = columnName.match(/[0-9]/)[0]
              if (!stanzasData[stanzaNum]) stanzasData[stanzaNum] = "";
              if (!setStanzas[stanzaNum]) {
                setStanzas[stanzaNum] = true
                stanzasData[stanzaNum] += measure[columnName][index] === undefined ? "" : " " + measure[columnName][index]
              }
            }
          })
        }
      })
      let ret = {}
      Object.keys(stanzasData).map(stanzaNum => {
        let stanzaName = `stanza${charArray[parseInt(stanzaNum.toString())]}`
        ret[stanzaName] = `${stanzaName} =  \\lyricmode { \\set stanza = #"${parseInt(stanzaNum.toString()) + 1}. "${stanzasData[stanzaNum].replace(/([a-z])- /g, `$1 -- `).replace(/  /g, ' ')}}\n`;
        // ret[stanzaName] =  ret[stanzaName].trim()
      })
      console.log(ret)
      return ret;
    }

    lilyTxt += "\n%lyrics\n"
    let stanzasData: any = getStanzas();
    lilyTxt += Object.values(stanzasData).join('')
    console.log(lilyTxt);
    // process.exit();


    // function setSingle(lilyTxt1, voice, numPeople) {
    //   let i = -1;
    //   let staves = ''
    //   while (++i < numPeople) {
    //     staves += `
    //         \\new Staff <<
    //         \\clef ${voice === 'soprano' || voice === 'alto' ? "treble" : "bass"}
    // \\new Voice = "${voice}" { \\voiceOne \\global \\${voice}}
    // \\new Lyrics \\lyricsto "${voice}" { \\stanzaa }
    // \\new Lyrics \\lyricsto "${voice}" { \\stanzab }
    // \\new Lyrics \\lyricsto "${voice}" { \\stanzac }
    // \\new Lyrics \\lyricsto "${voice}" { \\stanzad }
    // >>
    // `
    //   }
    //   lilyTxt1 += `\\score{
    //         <<
    //         ${staves}
    //         >>

    //     \\layout{ indent = 0\\cm }
    //     \\midi{ }
    //   }`
    //   filesystem.dir(`ly/${toolbox.parameters.options.h}`)
    //   let fileName = `${number}-${voice}-${numPeople}-S`
    //   filesystem.write(`ly/${toolbox.parameters.options.h}/${fileName}.ly`, lilyTxt1)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lilypond ${fileName}.ly`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && timidity -Ow -o ${fileName}.wav ${fileName}.midi`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lame ${fileName}.wav ${fileName}.mp3`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${fileName}.wav`)
    // }
    // function setSingleAll(lilyTxt1, numPeople) {
    //   let i = -1;
    //   let staves = ''
    //   while (++i < numPeople) {
    //     staves += `
    //         \\new Staff <<
    //         \\clef treble
    // \\new Voice = "soprano" { \\voiceOne \\global \\soprano
    // \\new Voice = "alto" { \\voiceOne \\global \\alto
    // \\new Lyrics \\lyricsto "soprano" { \\stanzaa }
    // \\new Lyrics \\lyricsto "soprano" { \\stanzab }
    // \\new Lyrics \\lyricsto "soprano" { \\stanzac }
    // \\new Lyrics \\lyricsto "soprano" { \\stanzad }

    // \\clef bass
    // \\new Voice = "tenor" { \\voiceOne \\global \\tenor
    // \\new Voice = "bass" { \\voiceOne \\global \\bass
    // >>
    // `
    //   }
    //   lilyTxt1 += `\\score{
    //         <<
    //         ${staves}
    //         >>

    //     \\layout{ indent = 0\\cm }
    //     \\midi{ }
    //   }`
    //   filesystem.dir(`ly/${toolbox.parameters.options.h}`)
    //   let fileName = `${number}-all-${numPeople}-S`
    //   filesystem.write(`ly/${toolbox.parameters.options.h}/${fileName}.ly`, lilyTxt1)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lilypond ${fileName}.ly`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && timidity -Ow -o ${fileName}.wav ${fileName}.midi`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lame ${fileName}.wav ${fileName}.mp3`)
    //   // shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${fileName}.wav`)
    // }
    // function setContinuous(lilyTxt1, voice, numPeople) {
    //   let voice_ = `${voice}all`
    //   let i = -1;
    //   let staves = ''
    //   while (++i < numPeople) {
    //     staves += `
    //         \\new Staff <<
    //         \\clef ${voice_ === 'sopranoall' || voice_ === 'altoall' ? "treble" : "bass"}
    // \\new Voice = "${voice_}" { \\voiceOne \\global \\${voice_}}
    // \\new Lyrics \\lyricsto "${voice_}" { \\stanzaall }
    // >>
    // `
    //   }
    //   lilyTxt1 += `\\score{
    //         <<
    //         ${staves}
    //         >>

    //     \\layout{ indent = 0\\cm }
    //     \\midi{ }
    //   }`
    //   // console.log(lilyTxt1);
    //   // console.log()
    //   // process.exit();
    //   filesystem.dir(`ly/${toolbox.parameters.options.h}`)
    //   let fileName = `${number}-${voice}-${numPeople}-C`
    //   filesystem.write(`ly/${toolbox.parameters.options.h}/${fileName}.ly`, lilyTxt1)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lilypond ${fileName}.ly`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && timidity -Ow -o ${fileName}.wav ${fileName}.midi`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lame ${fileName}.wav ${fileName}.mp3`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${fileName}.wav`)
    // }
//     function setContinuousAll(lilyTxt1, numPeople) {
//       let i = -1;
//       let staves = ''
//       while (++i < numPeople) {
//         staves += `
//             \\new Staff <<
//             \\clef treble
//     \\new Voice = "soprano" { \\voiceOne \\global \\sopranoall}
//     \\new Voice = "alto" { \\voiceOne \\global \\altoall}
//     \\new Lyrics \\lyricsto "soprano" { \\stanzaall }
// >>

//     \\new Staff <<
//     \\clef bass
//     \\new Voice = "tenor" { \\voiceOne \\global \\tenorall}
//     \\new Voice = "bass" { \\voiceOne \\global \\bassall}
//     >>
//     `
//       }
//       lilyTxt1 += `\\score{
//             <<
//             ${staves}
//             >>

//         \\layout{ indent = 0\\cm }
//         \\midi{ }
//       }`
//       // console.log(lilyTxt1);
//       // console.log()
//       // process.exit();
//       filesystem.dir(`ly/${toolbox.parameters.options.h}`)
//       let fileName = `${number}-All-${numPeople}-C`
//       filesystem.write(`ly/${toolbox.parameters.options.h}/${fileName}.ly`, lilyTxt1)
//       shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lilypond ${fileName}.ly`)
//       shell.exec(`cd ly/${toolbox.parameters.options.h}/ && timidity -Ow -o ${fileName}.wav ${fileName}.midi`)
//       shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lame ${fileName}.wav ${fileName}.mp3`)
//       // shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${fileName}.wav`)
//     }
    // function setContinuousAllSeparated(lilyTxt1, numPeople) {
    //   let i = -1;
    //   let staves = ''
    //   while (++i < numPeople) {
    //     staves += `
    //         \\new Staff <<
    //         \\clef treble
    // \\new Voice = "soprano" { \\voiceOne \\global \\sopranoall}
    // \\new Lyrics \\lyricsto "soprano" { \\stanzaall }
    // >>

    // \\new Staff <<
    // \\clef treble
    // \\new Voice = "alto" { \\voiceOne \\global \\altoall}
    // \\new Lyrics \\lyricsto "alto" { \\stanzaall }
    // >>

    // \\new Staff <<
    // \\clef bass
    // \\new Voice = "tenor" { \\voiceOne \\global \\tenorall}
    // \\new Lyrics \\lyricsto "tenor" { \\stanzaall }
    // >>

    // \\new Staff <<
    // \\clef bass
    // \\new Voice = "bass" { \\voiceOne \\global \\bassall}
    // \\new Lyrics \\lyricsto "bass" { \\stanzaall }
    // >>
    // `
    //   }
    //   lilyTxt1 += `\\score{
    //         <<
    //         ${staves}
    //         >>

    //     \\layout{ indent = 0\\cm }
    //     \\midi{ }
    //   }`
    //   // console.log(lilyTxt1);
    //   // console.log()
    //   // process.exit();
    //   filesystem.dir(`ly/${toolbox.parameters.options.h}`)
    //   let fileName = `${number}-All-${numPeople}-C-S`
    //   filesystem.write(`ly/${toolbox.parameters.options.h}/${fileName}.ly`, lilyTxt1)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lilypond ${fileName}.ly`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && timidity -Ow -o ${fileName}.wav ${fileName}.midi`)
    //   shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lame ${fileName}.wav ${fileName}.mp3`)
    //   // shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${fileName}.wav`)
    // }



    shell.exec('pwd')
    filesystem;
    stanzasData = Object.values(stanzasData).map(item_ => {
      let item: any = item_
      return item.replace(/.*#"[0-9]. "(.*)}/, "$1").trim()
    })
    stanzasData = stanzasData.join(' ')
    console.log(stanzasData)
    lilyTxt += `\nstanzaall =  \\lyricmode { \\set stanza = #"1. "${stanzasData.replace(/([a-z])- /g, `$1 -- `)}}\n`
    console.log(lilyTxt);

    let numStanzas = lilyTxt.split(/\nstanza[a-z] = /).length - 1
    // let charArray = new Array(26).fill(1).map((_, i) => String.fromCharCode(97 + i));
    let sopranoTxt = lilyTxt.match(/\nsoprano = {(.*)}/)[0].replace(/\nsoprano = {(.*)}/, `$1`)
    sopranoTxt = new Array(numStanzas).fill(sopranoTxt).join(' ');
    let altoTxt = lilyTxt.match(/\nalto = {(.*)}/)[0].replace(/\nalto = {(.*)}/, `$1`)
    altoTxt = new Array(numStanzas).fill(altoTxt).join(' ')
    let tenorTxt = lilyTxt.match(/\ntenor = {(.*)}/)[0].replace(/\ntenor = {(.*)}/, `$1`)
    tenorTxt = new Array(numStanzas).fill(tenorTxt).join(' ')
    let bassTxt = lilyTxt.match(/\nbass = {(.*)}/)[0].replace(/\nbass = {(.*)}/, `$1`)
    bassTxt = new Array(numStanzas).fill(bassTxt).join(' ')
    lilyTxt += `\nsopranoall = {${sopranoTxt}}\n`
    lilyTxt += `\naltoall = {${altoTxt}}\n`
    lilyTxt += `\ntenorall = {${tenorTxt}}\n`
    lilyTxt += `\nbassall = {${bassTxt}}\n`
    numStanzas
    console.log(sopranoTxt)
    // lilyTxt += `sopranoall = {}`.
    // // while(charArray.length){
    // //   let char = charArray.shift();
    // //   lilyTxt += lilyTxt.
    // // }
    // // lilyTxt += 
    // console.log(numStanzas)
    console.log(lilyTxt);
    // //no chorister
    // single staves
    toolbox.produceLiFile(lilyTxt, number, "*", 1, true, false, false)
    toolbox.produceLiFile(lilyTxt, number, "*", 1, false, false, false)
    //ChoirStaff
    toolbox.produceLiFile(lilyTxt, number, "*", 1, true, false, false, true)
    toolbox.produceLiFile(lilyTxt, number, "*", 1, false, false, false, true)
    // // repeat 
    // single staves
    toolbox.produceLiFile(lilyTxt, number, "*", 8, true, false, false)
    toolbox.produceLiFile(lilyTxt, number, "*", 8, false, false, false)
    // ChoirStaff
    toolbox.produceLiFile(lilyTxt, number, "*", 4, true, false, false, true)
    toolbox.produceLiFile(lilyTxt, number, "*", 4, false, false, false, true)

    // // // chorister
    // // single staves
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, true, true, false)
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, false, true, false)
    // //ChoirStaff
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, true, true, false, true)
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, false, true, false, true)

    // // // // synthv
    // ////no chorister
    // // single staves
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, true, false, true)
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, false, false, true)
    // //ChoirStaff
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, true, false, true, true)
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, false, false, true, true)

    // //// chorister
    // // single staves
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, true, true, true)
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, false, true, true)
    // //ChoirStaff
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, true, true, true, true)
    // toolbox.produceLiFile(lilyTxt, number, "*", 1, false, true, true, true)

    // process.exit();

    // let voices = ["soprano", "alto", "tenor", "bass"];
    // while (voices.length) {
    //   let voice = voices.shift();
    //   let numPeople = -1;
    //   while (++numPeople <= 4) {
    //     setSingle(lilyTxt, voice, Math.pow(2, numPeople))
    //     setContinuous(lilyTxt, voice, Math.pow(2, numPeople))
    //   }
    // }
    // // while (voices.length) {
    // // let voice = voices.shift();
    // let numPeople = -1;
    // while (++numPeople <= 4) {
    //   setSingleAll(lilyTxt, Math.pow(2, numPeople))
    //   setContinuousAll(lilyTxt, Math.pow(2, numPeople))
    //   setContinuousAllSeparated(lilyTxt, Math.pow(2, numPeople))
    // }
    // }
    // let title = 
  }
}