// Coverage and placeholder contracts keep board/compartment values intact in every language.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/languages-data.js','utf8'),context);
const data=context.window.WallfidLanguages,keys=Object.keys(data.translations.en).sort();
const eu=['bg','hr','cs','da','nl','en','et','fi','fr','de','el','hu','ga','it','lv','lt','mt','pl','pt','ro','sk','sl','es','sv'];
assert.equal(data.languages.length,28);assert.equal(new Set(data.languages.map(l=>l.code)).size,28);
for(const code of [...eu,'zh-Hans','zh-Hant','ja','ko'])assert(data.translations[code],code);
const tokens=s=>Array.from(s.matchAll(/\{\w+\}/g),m=>m[0]).sort();
for(const {code,name,short} of data.languages){assert(name&&short);const table=data.translations[code];assert.deepEqual(Object.keys(table).sort(),keys,code+' has complete copy coverage');for(const key of keys){assert.equal(typeof table[key],'string');assert(table[key].trim(),code+' '+key);assert.deepEqual(tokens(table[key]),tokens(key),code+' preserves values: '+key);assert(!/__W\d+__|⟦|⟧/.test(table[key]),code+' has no build markers');}}
for(const code of ['zh-Hans','zh-Hant','ja','ko','fr','de','es','it','pl'])assert.notEqual(data.translations[code]['Choose an image'],'Choose an image',code+' upload control is translated');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
assert(html.includes('id="languageButton"'));assert(html.indexOf('languages.js')<html.indexOf('app-localized.js'));
assert(!/https?:\/\/translate\./.test(fs.readFileSync(__dirname+'/languages.js','utf8')));
console.log('PASS: 28 languages; '+keys.length+' copy entries each; placeholder and local-only contracts.');
