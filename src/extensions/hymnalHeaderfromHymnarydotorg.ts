import { GluegunToolbox } from 'gluegun'
// const yaml = require('js-yaml');
const to = require('await-to-js').to,
  hymnalHeaderfromHymnarydotorg = require('../modules/hymnHeaderfromHymnary').hymnalHeaderfromHymnarydotorg;

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.hymnalHeaderfromHymnarydotorg = async (number, hymnal) => {
    let [err, care] = [null, null];
    [err, care] = await to(new hymnalHeaderfromHymnarydotorg(hymnal, number).fetchHymnHeaderUsingNumber(number));
    if (err) return toolbox.print.error(err)
    // if(!err){
    //   filesystem.write(`${}.md`, `---\n${yaml.safeDump(resultant)}---\n${restofFile}`);
    // }
    // let year = false;
    // if()
    let ret = {}
    for (let i in care) ret[i.toLowerCase()] = care[i];
    let year;
    try {
      year = care.Composer.match(/\(d*\.* *[0-9]{4}-*[0-9]*\)/)
      if (year) {
        care.Composer = care.Composer.replace(year, '').trim();
        year = year[0].match(/[0-9]{4}-*[0-9]*/);
        if (year) {
          care.Year = year[0];
        }
      }
    } catch (err) { }
    try {
      year = care.Author.match(/\(d*\.* *[0-9]{4}-*[0-9]*\)/)
      if (year) {
        ret["Author"] = care.Author.replace(year, '').trim();
        year = year[0].match(/[0-9]{4}-*[0-9]*/);
        if (year) {
          ret["Year"] = year[0];
        }
      }
    } catch (err) { }
    if (care.Tune) toolbox.parameters.options.t = care.Tune.toUpperCase();
    if (care.Key) toolbox.parameters.options.k = care.Key;
    if (care.Meter) toolbox.parameters.options.m = care.Meter;
    if (care.Composer) toolbox.parameters.options.c = care.Composer;
    if (care.Arranger) toolbox.parameters.options.a = care.Arranger;
    if (care.Year) toolbox.parameters.options.y = care.Year;
    [err, care] = await to(toolbox.edittuneheader(false));
    if (err) return toolbox.print.error(err);

    let ret1 = {};
    for (let i in ret) {
      let val = ret[i];
      i = i.toLowerCase().replace(/[^a-z]/g, '');
      ret1[i] = val;
    }
    let headerFields = {
      T: "title", f: "firstline", pp: "topic", t: "tune", a: "author", k: "key", n: "hymnnumber", y: "year"
    }
    
    for (let i in headerFields) {
      let key = headerFields[i];
      if (ret1[key]) {
        toolbox.parameters.options[i] = ret1[key];
      }
    }
    ;[err, care] = await to(toolbox.edithymnheader(false));
    if (err) return toolbox.print.error(err);
    /*T: "title", f: "firstline", p: "topic", t: "tune", a: "author", k: "key", n:"hymnnumber", y:"year"*/
    // console.log(ret1);
    // [err, care] = await to(toolbox.edithymnheader(false));
    // if (err) return toolbox.print.error(err);
  }
}
