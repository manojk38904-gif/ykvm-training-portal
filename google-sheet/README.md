# Google Sheet में हर आवेदन व रसीद अपने-आप दर्ज करना

1. https://sheets.new खोलकर नई Google Sheet बनाएँ, नाम: "YKVM प्रशिक्षण आवेदन व रसीदें"।
2. मेनू **Extensions → Apps Script** खोलें। वहाँ का सारा कोड हटाकर `Code.gs` का पूरा कोड चिपकाएँ और Save (💾) करें।
3. ऊपर फ़ंक्शन सूची में **setup** चुनकर **Run** दबाएँ। अनुमति माँगे तो अपना Google खाता चुनें → Advanced → "Go to … (unsafe)" → Allow।
   नीचे Execution log में "पोर्टल के लिए पढ़ने की कुंजी: …" दिखेगी। इसे कॉपी कर लें।
4. **Deploy → New deployment** → प्रकार (⚙) **Web app** चुनें।
   - Execute as: **Me**
   - Who has access: **Anyone**
   Deploy दबाएँ और **Web app URL** (…/exec) कॉपी करें।
5. पोर्टल में Admin Login → "भुगतान व प्रमाण पत्र सेटिंग" → **Google Sheet Web App URL** में URL चिपकाकर "सेटिंग सहेजें"।
6. "रिपोर्ट, रजिस्टर व Excel" → **Google Sheet पढ़ने की कुंजी** में कुंजी चिपकाकर "कुंजी सहेजें"।

इसके बाद हर आवेदन और हर रसीद अपने-आप Sheet में आएगी:
- "सभी आवेदन व रसीदें" शीट: सभी का पूरा विवरण
- "रसीद - <ट्रेड>" शीट: हर ट्रेड के भुगतान करने वालों का अलग विवरण
- "ट्रेडवार सारांश" शीट: हर ट्रेड की संख्या और राशि

Google Sheet को File → Download → Microsoft Excel (.xlsx) से कभी भी Excel में ले सकते हैं।
