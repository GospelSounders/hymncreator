import { GluegunToolbox, filesystem, prompt } from 'gluegun'
const FileSync = require('lowdb/adapters/FileSync')
const low = require('lowdb')

filesystem.dir(`databases`)
const adapter = new FileSync('databases/hyphenated.json')
const db = low(adapter)

// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');
// const to = require('await-to-js').to;
// const fs = require('fs-extra');
// const Midi = require('../modules/Midi');
const hyphenopoly = require("hyphenopoly");
const hyphenator = hyphenopoly.config({
    "require": ["de", "en-us"],
    "hyphen": "-",
    "exceptions": {
        "en-us": "en-han-ces"
    }
});


async function hyphenate_en(text) {
    const hyphenateText = await hyphenator.get("en-us");
    return hyphenateText(text)
}

// let hypernatefromDictionary = async (text, dictionary) => {
//     let words = text.split(' ')
//     let tmpLen = words.length;
//     let ret = '';
//     let j = 0;
//     while (j < tmpLen) {
//         let word = words[j++];
//         let tmpWord;
//         let last2 = word.slice(-2);
//         if (last2 === "'s") {
//             tmpWord = word.slice(0, -2)
//         } else {
//             tmpWord = word
//             last2 = '';
//         }
//         tmpWord = tmpWord.replace(/[^A-Za-z0-9]/g, '')
//         tmpWord = tmpWord.toLowerCase();
//         let re = new RegExp(`\n${tmpWord},(.*)[^a-zA-Z\.]+`, 'g');
//         let tmp = dictionary.match(re)
//         try {
//             if (!tmp[0]) throw "";
//             let tmp0 = tmp[0].split(',')[1]
//             tmp0 = tmp0.split('\n').join('')
//             let newWord = '';
//             let replacing = true;
//             while (replacing) {
//                 let oldWordLetter = word[0]
//                 let compareLetter = tmp0[0]
//                 if (oldWordLetter.toLowerCase() === compareLetter) {
//                     newWord += oldWordLetter;
//                     word = word.substr(1);
//                     tmp0 = tmp0.substr(1);
//                 } else {
//                     if (compareLetter === '-') {
//                         newWord += compareLetter;
//                         tmp0 = tmp0.substr(1);
//                     } else {
//                         newWord += oldWordLetter;
//                         word = word.substr(1);
//                     }
//                 }
//                 if (word === '') replacing = false;
//             }
//             ret = `${ret}${newWord} `
//         } catch (x) { }
//     }
//     return ret
// }

function hyphenate(originalWord, word_, hyphenatedLowerCased): any {
    let ret = [];
    let isInDb = hyphenatedLowerCased;
    isInDb.map(item => {
        let word = word_
        // console.log(`ITEM=============>${item}`)
        item = item.split(/(?=-)/g);
        let newWord = originalWord;
        let boundaries = []
        item.map(elem => {
            let patt = elem.replace(/-/g, '')
            let re = new RegExp(patt, "i");
            let original = word.match(re);
            boundaries.push([original.index + (boundaries.length ? boundaries.slice(-1)[0].reduce((a, b) => a + b, 0) - boundaries.slice(-1)[0].slice(-1)[0] : 0), original[0].length])
            boundaries.push(boundaries.slice(-1)[0].concat([boundaries.pop().reduce((a, b) => a + b, 0)]))
            word = word.slice(original[0].length + original.index)
        })
        boundaries.pop();
        let offset = 0;
        boundaries.map(boundary => {
            let insertIndex = boundary.slice(-1)[0] + offset
            let insert = '-'
            newWord = newWord.replace(new RegExp(`^(.{${insertIndex}})(.)`), `$1${insert}$2`);

            offset++;
        })
        ret.push(newWord)
    })
    return ret;
}


// hypernatefromDictionary('abc', 'adsasd');
// hyphenate_en('abc')
module.exports = (toolbox: GluegunToolbox) => {
    toolbox.hyphenology = async (word) => {
        let dbHasData = db.getState();
        if (Object.keys(dbHasData).length === 0) db.defaults({
            god: ['god']
        }).write()

        // let delay = async function () {
        //     return new Promise(
        //         (resolve, reject) => setTimeout(
        //             function () { console.log('ended delay....'); resolve() }, 5000)
        //     )
        // }



        try {

            let ret = [];
            let wordForms = [];
            let wordtoCheck = word.toLowerCase().replace(/'s$/, '').replace(/[^a-z0-9]$/g, '').replace(/^[^a-z0-9]/g, '')
            wordForms.push(wordtoCheck);
            let isProbablyPlural = word.replace(/[^a-zA-Z]$/g, '').match(/[a-zA-Z]s$/);
            // console.log("isProbablyPlural:", word)
            if (isProbablyPlural) console.log("isProbablyPlural:", isProbablyPlural)
            if (isProbablyPlural) wordForms.push(word.toLowerCase().replace(/[^a-z0-9]$/g, '').replace(/^[^a-z0-9]/g, '').replace(/s$/, ''))
            console.log('wordForms', wordForms)
            // console.log(wordForms)

            // check the singular first,, if we find, no need to go to the plural...
            let initialWordForms = [...wordForms]
            while (wordForms.length) {
                wordtoCheck = wordForms.pop();
                // console.log(wordtoCheck)
                let originalWord = word;
                let isInDb: any = dbHasData[wordtoCheck];
                if (!isInDb) continue;
                // console.log(originalWord, word, isInDb)
                ret = ret.concat(hyphenate(originalWord, word, isInDb));
                break;
            }
            wordForms = [...initialWordForms]
            if (!ret.length) {
                while (wordForms.length) {
                    wordtoCheck = wordForms.pop();
                    let originalWord = word;
                    // if (!isInDb) {
                    // console.log('abcd....', word, wordtoCheck)
                    let hyphenated = await hyphenate_en(wordtoCheck);
                    let response = await prompt.ask({
                        type: 'text',
                        name: 'ans',
                        message: `${wordtoCheck}`,
                        initial: `${hyphenated}`
                    });
                    response = response.ans;
                    if (response === ' ') continue
                    db.set(`${wordtoCheck}`, [response]).write(); // save to dictionary
                    // sort db
                    let dbState = db.getState();
                    var sortable = [];
                    for (let item in dbState) {
                        sortable.push([item, dbState[item]]);
                    }
                    sortable = sortable.sort();
                    let objSorted = {}
                    sortable.forEach(function (item) {
                        objSorted[item[0]] = item[1]
                    })
                    db.setState(objSorted).write();
                    let isInDb = [response];
                    ret = ret.concat(hyphenate(originalWord, word, isInDb));
                    break;
                    // }
                }

            }
            return ret;
            // save this, then use it in the same manner as above...
            // process.exit();

        } catch (err) {
            console.log(err)
            process.exit();
        }
        // process.exit();

        // if (isInDb) return isInDb;

        // check if word is in dictionary
        // hyphenate_en('abc'); hypernatefromDictionary('abc', 'abc');

    }
}
