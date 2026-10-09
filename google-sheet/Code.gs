/**
 * YKVM प्रशिक्षण पोर्टल → Google Sheet
 * हर आवेदन और हर रसीद अपने-आप इस Google Sheet में दर्ज होती है।
 * सेटअप: README वाले चरण देखें। इस फ़ाइल में कोई पासवर्ड/कुंजी नहीं है;
 * पढ़ने की कुंजी setup() चलाने पर Script Properties में अपने-आप बनती है।
 */
const ALL = 'सभी आवेदन व रसीदें';
const SUM = 'ट्रेडवार सारांश';
const H = ['आवेदन संख्या','स्थिति','आवेदन तिथि','रसीद संख्या','भुगतान तिथि','नाम','पिता/पति का नाम','जन्म तिथि','लिंग','मोबाइल','ई-मेल','श्रेणी','शैक्षिक योग्यता','पता','ट्रेड','ट्रेड कोड','बैच','अवधि','प्रशिक्षण राशि (₹)','छूट (₹)','प्राप्त राशि (₹)','Razorpay Payment ID','अतिरिक्त जानकारी','दर्ज समय'];
const K = ['appNo','status','appDate','rcptNo','payDate','name','father','dob','gender','mobile','email','cat','edu','address','trade','tradeId','batch','duration','fee','discount','amount','payId','extra','at'];
const PAID = 'भुगतान व रसीद', APPLIED = 'आवेदन';

/** एक बार चलाएँ: शीट बनाता है और "पढ़ने की कुंजी" Execution log में दिखाता है */
function setup() {
  const p = PropertiesService.getScriptProperties();
  let k = p.getProperty('READ_KEY');
  if (!k) { k = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').slice(0, 40); p.setProperty('READ_KEY', k); }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  sheet_(ss, ALL); summary_(ss);
  Logger.log('पोर्टल के लिए पढ़ने की कुंजी: ' + k);
  return k;
}

function sheet_(ss, name) {
  let s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    s.getRange(1, 1, 1, H.length).setValues([H]).setFontWeight('bold').setBackground('#e6efe9');
    s.setFrozenRows(1);
  }
  return s;
}
function clean_(v) {
  v = v == null ? '' : String(v);
  if (/^[=+\-@]/.test(v)) v = "'" + v;   // formula injection से बचाव
  return v.slice(0, 500);
}
function upsert_(s, row) {
  const n = s.getLastRow();
  if (n > 1) {
    const ids = s.getRange(2, 1, n - 1, 2).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(row[0])) {
        if (ids[i][1] === PAID && row[1] !== PAID) return;   // रसीद वाली पंक्ति को आवेदन से न बदलें
        s.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }
  s.appendRow(row);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!d.appNo || !/^YKVM\/APP\//.test(d.appNo) || !d.name) return json_({ ok: false, error: 'invalid' });
    if (d.payId && !/^pay_[A-Za-z0-9]{6,}$/.test(d.payId)) return json_({ ok: false, error: 'payId' });
    d.status = d.payId ? PAID : APPLIED;
    const row = K.map(k => k === 'at' ? new Date() : (['fee', 'discount', 'amount'].indexOf(k) >= 0 ? (Number(d[k]) || 0) : clean_(d[k])));
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    upsert_(sheet_(ss, ALL), row);
    if (d.payId) upsert_(sheet_(ss, ('रसीद - ' + String(d.trade || 'अन्य')).replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 90)), row);
    summary_(ss);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** केवल Admin: पोर्टल का "Google Sheet से रजिस्टर अपडेट करें" बटन यहीं से डेटा लेता है */
function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty('READ_KEY');
  if (!key || !e || !e.parameter || e.parameter.key !== key) return json_({ ok: false, error: 'unauthorized' });
  const v = sheet_(SpreadsheetApp.getActiveSpreadsheet(), ALL).getDataRange().getValues();
  const rows = v.slice(1).map(r => {
    const o = {};
    K.forEach((k, i) => {
      let x = r[i];
      if (x instanceof Date) x = Utilities.formatDate(x, 'Asia/Kolkata', k === 'at' ? "yyyy-MM-dd'T'HH:mm:ss" : 'yyyy-MM-dd');
      if (typeof x === 'string' && x[0] === "'") x = x.slice(1);
      o[k] = x;
    });
    return o;
  });
  return json_({ ok: true, rows: rows });
}

function summary_(ss) {
  const a = sheet_(ss, ALL).getDataRange().getValues().slice(1), m = {};
  a.forEach(r => {
    const t = r[14] || 'अन्य';
    m[t] = m[t] || [0, 0, 0, 0, 0];
    m[t][0]++;
    if (r[1] === PAID) { m[t][1]++; m[t][2] += Number(r[18]) || 0; m[t][3] += Number(r[19]) || 0; m[t][4] += Number(r[20]) || 0; }
  });
  let s = ss.getSheetByName(SUM);
  if (!s) s = ss.insertSheet(SUM);
  s.clear();
  const rows = [['ट्रेड', 'कुल आवेदन', 'भुगतान व रसीद', 'कुल प्रशिक्षण राशि (₹)', 'कुल छूट (₹)', 'कुल प्राप्त राशि (₹)']];
  Object.keys(m).forEach(t => rows.push([t].concat(m[t])));
  const tot = ['कुल', 0, 0, 0, 0, 0];
  rows.slice(1).forEach(r => { for (let i = 1; i < 6; i++) tot[i] += r[i]; });
  rows.push(tot);
  s.getRange(1, 1, rows.length, 6).setValues(rows);
  s.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#e6efe9');
  s.getRange(rows.length, 1, 1, 6).setFontWeight('bold');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
