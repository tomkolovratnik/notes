module.exports = {
  pdf_options: {
    margin: { top: '15mm', right: '12mm', bottom: '20mm', left: '12mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="
        font-size: 9px;
        font-family: 'Ubuntu', sans-serif;
        color: #666;
        width: 100%;
        text-align: center;
        padding: 0 12mm;
        box-sizing: border-box;
      ">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`,
    printBackground: true,
    format: 'A4',
  },
  css: `
    body {
      font-family: 'Ubuntu', 'Noto Color Emoji', sans-serif;
      font-size: 13px;
      line-height: 1.6;
    }
    h1, h2, h3, h4 {
      font-family: 'Ubuntu', sans-serif;
    }
    code, pre {
      font-family: 'Ubuntu Mono', 'DejaVu Sans Mono', monospace;
      font-size: 12px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1em;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 5px 8px;
      text-align: left;
    }
    th {
      background: #f0f0f0;
    }
  `,
};
