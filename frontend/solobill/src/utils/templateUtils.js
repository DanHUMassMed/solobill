import nunjucks from 'nunjucks';
import html2pdf from 'html2pdf.js';

export const nunjucksEnv = () => {
      const env = new nunjucks.Environment();

      env.addFilter('formatDate', (str) => {
        if (typeof str !== 'string') return str ?? '';

        const trimmed = str.trim();

        // Match YYYY-MM-DD exactly
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
        if (!match) return str;

        const [, y, m, d] = match;

        const month = Number(m);
        const day = Number(d);

        // Basic sanity checks
        if (month < 1 || month > 12) return str;
        if (day < 1 || day > 31) return str;

        return `${m}/${d}/${y}`;
      });
      
      env.addFilter('fixed', (num) => {
          const n = Number(num);
          return isNaN(n) ? '0.00' : n.toFixed(2);
      });
      
      env.addFilter('currency', (value) => {
        if (value == null || isNaN(value)) return '$0.00';

        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(value);
      });

      return env  
   };

export const generatePdfBlob = async (html) => {
    const element = document.createElement('div');
    element.innerHTML = html;
    // We need to append to body to render styles properly? 
    // html2pdf can handle off-screen elements but styles might need to be inline or present.
    // The Invoice Template uses <style> block, so it should be fine.
    
    const opt = {
      margin: 0,
      filename: 'myfile.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // We use .output('blob')
    return await html2pdf().set(opt).from(element).output('blob');
  };

export const parseMailto = (mailto) => {
    const normalized = typeof mailto === 'string' ? mailto.trim() : '';
    if (!normalized?.startsWith('mailto:')) return {};
    console.log(normalized);
    const [scheme, queryString = ''] = normalized.split('?');
    const to = decodeURIComponent(scheme.replace('mailto:', ''));
    const params = new URLSearchParams(queryString);
    console.log("Subject: [", params.get('subject'), "]");
    console.log("Body: [", params.get('body').trim(), "]");
    return {
      to,
      subject: decodeURIComponent(params.get('subject') || ''),
      body: decodeURIComponent(params.get('body').trim() || ''),
    };
  };

export const mailToHTML = (mailto) => {
    const {to, subject, body} = parseMailto(mailto);
    return `
        <div style="
        border: 1px solid #ddd;
        padding: 3px;
        margin-bottom: 3px;
        background-color: #f6f5f5ff;
        font-family: monospace;
        ">
        <div style="
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 10px;
        ">
            <div style="font-size: 0.9rem;">
            <strong>To:</strong> ${to}
            </div>
            <div style="font-size: 0.9rem;">
            <strong>Subject:</strong> ${subject}
            </div>
        </div>
        <div style="white-space: pre-wrap">${body}</div>
        </div>
    `;
};
