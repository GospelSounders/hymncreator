// const to = require('await-to-js').to;

import { GluegunToolbox, filesystem } from 'gluegun'
const matchAll = require("match-all");
const shell = require("shelljs");

module.exports = (toolbox: GluegunToolbox) => {
    toolbox.produceLiFile = (lilyTxt, number, voices, numRepeats = 1, combined = true, chorister = false, synthv = false, choirStaff = false) => {
        // combined refers to stanzas as opposed to voices
        if (voices === "*") voices = ["soprano", "alto", "tenor", "bass", ["soprano", "alto", "tenor", "bass"]];

        if (choirStaff && typeof voices === "string") return;
        let voiceClefs = {
            "soprano": "treble",
            "alto": "treble",
            "tenor": "bass",
            "bass": "bass"
        }
        let globalvoiceSuffix = combined ? "all" : ""; // for eg. sopranoall
        while (voices.length) {
            let voice = voices.shift()
            let voiceName = typeof voice === 'string' ? voice : "choir"
            if (choirStaff && voiceName !== 'choir') continue;
            if (numRepeats > 1 && typeof voice !== 'string') numRepeats = 4;
            let outputFileNameRoot = `${number}-${voiceName}-${numRepeats}-${combined ? "C" : "S"}-${chorister ? "chorister" : "normal"}-${synthv ? "synthv" : "normal"}-${choirStaff ? "CS" : "NS"}`
            console.log(outputFileNameRoot)

            let staves = ''

            let innerVoice_ = typeof voice === 'string' ? [voice] : voice;

            let repeatIndex = -1;
            while (++repeatIndex < numRepeats) {
                if (choirStaff) {
                    let aVOices = {
                        "treble": [],
                        "bass": []
                    }
                    let lyricsLines = ''
                    //lyrics lines
                    for (let i in innerVoice_) {
                        let innerVoice = innerVoice_[i]
                        if (combined) {
                            lyricsLines += `\\new Lyrics \\lyricsto "${innerVoice}" { \\stanzaall }\n`
                        } else {
                            let stanzaSuffices = matchAll(lilyTxt, /\nstanza([a-z]) /g).toArray();
                            for (let stanzaSuffix in stanzaSuffices) {
                                lyricsLines += `\\new Lyrics \\lyricsto "${innerVoice}" { \\stanza${stanzaSuffices[stanzaSuffix]} }\n`
                            }
                        }
                        break;
                    }
                    // voices
                    let voiceNumbers = ["One", "Two", "Three", "Four"]
                    for (let i in innerVoice_) {
                        let innerVoice = innerVoice_[i]
                        aVOices[voiceClefs[innerVoice]].push(`\\new Voice = "${innerVoice}" { \\voice${voiceNumbers[i]} \\global \\${innerVoice}${globalvoiceSuffix}}\n`)
                    }
                    //\new Lyrics \lyricsto "soprano" { \stanzaa }
                    staves += `\\new choirStaff\n<<\n\\new Staff\n<<\n\\clef treble\n${aVOices.treble.join("")}${lyricsLines}>>\n`
                    staves += `\\new Staff\n<<\n\\clef bass\n${aVOices.bass.join("")}>>`

                    if (choirStaff) staves += `>>`
                }
                else {
                    for (let i in innerVoice_) {
                        let innerVoice = innerVoice_[i]
                        staves += `\\new Staff <<\n\\clef ${voiceClefs[innerVoice]}\n\\new Voice = "${innerVoice}" { \\voiceOne \\global \\${innerVoice}${globalvoiceSuffix}}\n`
                        if (combined) {
                            staves += `\\new Lyrics \\lyricsto "${innerVoice}" { \\stanzaall }\n`
                        } else {
                            let stanzaSuffices = matchAll(lilyTxt, /\nstanza([a-z]) /g).toArray();
                            for (let stanzaSuffix in stanzaSuffices) {
                                staves += `\\new Lyrics \\lyricsto "${innerVoice}" { \\stanza${stanzaSuffices[stanzaSuffix]} }\n`
                            }
                        }
                        staves += `>>\n`
                    }
                }
            }

            staves; filesystem;
            let mylilyTxt = lilyTxt + `\\score{\n<<\n${staves}\n>>\n\\layout{ indent = 0\\cm } \\midi{ } }`
            filesystem.write(`ly/${toolbox.parameters.options.h}/${outputFileNameRoot}.ly`, mylilyTxt)
            shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lilypond ${outputFileNameRoot}.ly`)
            if (combined && numRepeats === 1 && choirStaff) {
                shell.exec(`cd ly/${toolbox.parameters.options.h}/ && timidity -Ow -o ${outputFileNameRoot}.wav ${outputFileNameRoot}.midi`)
            }
            if (choirStaff && combined && numRepeats === 1) {
                shell.exec(`cd ly/${toolbox.parameters.options.h}/ && lame ${outputFileNameRoot}.wav ${outputFileNameRoot}.mp3`)
            }
            if (!combined || numRepeats > 1) {
                shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${outputFileNameRoot}.wav ${outputFileNameRoot}.mp3 ${outputFileNameRoot}.midi`)
            }

            if (numRepeats === 1 && !choirStaff) {
                shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${outputFileNameRoot}.pdf`)
            }

            if (numRepeats > 1) {
                shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${outputFileNameRoot}.ly`)

            }
            if (!choirStaff) {
                shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${outputFileNameRoot}.ly ${outputFileNameRoot}.wav ${outputFileNameRoot}.mp3`)
            }
            if (combined) {
                shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${outputFileNameRoot}.ly`)
            }
            
            if (!choirStaff && !combined) {
                shell.exec(`cd ly/${toolbox.parameters.options.h}/ && rm ${outputFileNameRoot}.pdf`)
            }
        }
    }
}
