# YKVM प्रशिक्षण पोर्टल

युवा कौशल विकास मण्डल, हमीरपुर (उ.प्र.) का प्रशिक्षण प्रोफाइल, आवेदन, Razorpay शुल्क भुगतान, रसीद और प्रमाण पत्र सत्यापन।

लाइव: https://manojk38904-gif.github.io/ykvm-training-portal/

## Admin / प्रबंधन

- पोर्टल के सबसे नीचे "Admin Login / प्रबंधन" बटन।
- पहली बार: GitHub Fine-grained token (केवल इस repository, Contents: Read and write) और Admin पासवर्ड से सेटअप।
- टोकन `data/admin.enc.json` में पासवर्ड से एन्क्रिप्टेड (PBKDF2-SHA256 600,000 + AES-GCM) रहता है; पासवर्ड कहीं सहेजा नहीं जाता।
- बदलाव GitHub पर commit होते हैं (`data/portal.json`, `data/certificates.json`); आवेदन रजिस्टर `data/applications.enc.json` में एन्क्रिप्टेड।
- 30 मिनट निष्क्रिय रहने पर सत्र अपने-आप समाप्त।
