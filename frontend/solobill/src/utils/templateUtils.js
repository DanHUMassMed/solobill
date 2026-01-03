import nunjucks from 'nunjucks';

export const nunjucksEnv = () => {
      const env = new nunjucks.Environment();

      env.addFilter('formatDate', (str) => str ? new Date(str).toLocaleDateString() : '');
      
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
