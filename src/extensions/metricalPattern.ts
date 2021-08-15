import { GluegunToolbox, filesystem } from 'gluegun'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const to = require('await-to-js').to;

filesystem.dir(`databases`)
const adapter = new FileSync('databases/meters.json')
const db = low(adapter)

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.metricalPattern = async (number) => {
    let [err, care] = await to(toolbox.getHymnHeader(number))
    if (err) return toolbox.print.error(err)
    let hymnHeader = care;
    toolbox.parameters.options.t = hymnHeader.tune;
    [err, care] = await to(toolbox.getTuneHeader(number));
    if (err) return toolbox.print.error(err)
    let tuneHeader = care;
    let meter = tuneHeader.meter.toUpperCase();
    let meterOriginal = tuneHeader.meter;
    meter = meter.trim();
    let dbHasData = db.getState();
    if (Object.keys(dbHasData).length === 0) db.defaults({
      alias: {
        'L.M': 'L.M.',
        'S.M': 'S.M.',
        'C.M': 'C.M.'
      },
      pattern: {
        'S.M.': '6.6.8.6',
        'S.M.D.': '6.6.8.6.6.6.8.6',
        'C.M.': '8.6.8.6',
        'C.M.D.': '8.6.8.6.8.6.8.6',
        'L.M.': '8.8.8.8',
        'L.M.D.': '8.8.8.8.8.8.8.8',
        'IRREGULAR': '-'
      }
    })
      .write()
    dbHasData = db.getState();
    // console.log(dbHasData)

    function isPatternF(meter, repeat = false) {
      if (dbHasData.pattern[meter] === undefined) {
        let isPattern = [];
        meter = meter.replace(/.$/, '')
        // console.log(repeat)
        // console.log(repeat)
        // console.log(repeat)
        // if (repeat) console.log(`meter:${meter}`)
        meter.split('.').map(item => { isPattern.push(parseInt(item).toString() === item ? true : false) })
        if (isPattern.every(value => value === true)) {
          db.set(`alias["${meterOriginal}"]`, `${meter}.`).write()
          db.set(`pattern["${meter}."]`, meter).write()
          return [`${meter}.`, meter]
        } else {
          // console.log(isPattern)
          let meterParts = meter.split('.');
          if (meterParts.slice(-1)[0].toUpperCase() == 'D') {
            isPattern.pop();
            // console.log(isPattern)
            if (isPattern.every(value => value === true)) {
              meterParts.pop();
              meterParts = meterParts.join('.')
              db.set(`alias["${meterOriginal}"]`, `${meter}.`).write()
              db.set(`pattern["${meter}."]`, `${meterParts}.${meterParts}`).write()
              return [`${meter}.`, meter]
            } else {
              return false;
            }
          } else {
            meterOriginal = meterOriginal.toUpperCase()
            let hasRefrain = meterOriginal.includes('WITH')
            if (hasRefrain) {
              meter = meterOriginal.replace(/WITH.+/, '').trim().replace(/ /g, '');
              let ret = isPatternF(meter, true);
              db.set(`alias["${meterOriginal}"]`, `${meter}.`).write()
              db.set(`pattern["${meterOriginal}"]`, ret[1]).write()
              return ret;
            }
            return false;
          }

        }
      } else {
        return [`${meter}`, dbHasData.pattern[meter]]
      }
    }
    // check in pattern
    if (dbHasData.pattern[meter] === undefined) {

      // check in alias
      if (dbHasData.alias[meter] === undefined) return isPatternF(meter);
      else meter = dbHasData.alias[meter];

      if (dbHasData.pattern[meter] === undefined) return isPatternF(meter);
    }

    return [meter, dbHasData.pattern[meter]]
  }
}