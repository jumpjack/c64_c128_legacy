document.getElementById('download-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const startNumber = parseInt(document.getElementById('start-number').value);
  const endNumber = parseInt(document.getElementById('end-number').value);
  const proxyURL = "http://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";
  const resultsTable = document.querySelector('#links-table tbody');
  const jsonOutput = document.getElementById('json-output');
  let linksArray = [];

  resultsTable.innerHTML = ''; // Pulisce la tabella
  jsonOutput.innerHTML = '';   // Pulisce il JSON

  for (let i = startNumber; i <= endNumber; i++) {
    const dataURL = `https://www.retromagazine.net/category/retromagazine-world/numeri-in-italiano/page/${i}`;
    const response = await fetch(proxyURL + encodeURIComponent(dataURL));
    const text = await response.text();
    
    // Crea un DOM parser per estrarre i link
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const entries = doc.querySelectorAll('h2.entry-title a');

    entries.forEach((entry, index) => {
      const link = entry.href;
      linksArray.push(link);

      // Aggiunge una riga nella tabella
      const row = resultsTable.insertRow();
      row.insertCell(0).textContent = linksArray.length; // Numero
      row.insertCell(1).innerHTML = `<a href="${link}" target="_blank">${link}</a>`;
    });
  }

  // Mostra il JSON finale
  jsonOutput.textContent = JSON.stringify(linksArray, null, 2);
});

// Funzione per salvare l'array come file .js
document.getElementById('save-json').addEventListener('click', function () {
  const dataStr = `const linksArray = ${JSON.stringify(linksArray, null, 2)};`;
  const blob = new Blob([dataStr], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'links.js';
  a.click();
  URL.revokeObjectURL(url);
});

// Funzione per salvare la tabella come file .html
document.getElementById('save-table').addEventListener('click', function () {
  const tableHTML = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Links Table</title>
      <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
      </style>
    </head>
    <body>
      <h1>Links Table</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from(document.querySelectorAll('#links-table tbody tr'))
            .map(row => `<tr>${Array.from(row.cells).map(cell => `<td>${cell.innerHTML}</td>`).join('')}</tr>`)
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'links_table.html';
  a.click();
  URL.revokeObjectURL(url);
});

// Function to process a single page and extract data
async function processPage(url) {
  const proxyURL = "http://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";
  const resultsTable = document.querySelector('#links-table tbody');
  try {
console.log("   Downloading ", proxyURL + encodeURIComponent(url))
    const response =  await fetch(proxyURL + encodeURIComponent(url));
    const html = await response.text();
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get all lists with the specified class
    const lists = doc.querySelectorAll('ul.wp-block-list.has-light-green-cyan-background-color');
console.log("lists=",lists);    
    // We want the second list
    if (lists.length >= 2) {
      const targetList = lists[1];
      const items = targetList.querySelectorAll('li');
      
      // Process each item
      const results = [];
      items.forEach(item => {
        const text = item.textContent.trim();
        const match = text.match(/(.*?)\s*(?:\((.*?)\))?$/);
        
        if (match) {
          results.push({
            name: match[1].trim(),
            platform: match[2] ? match[2].trim() : ''
          });
        }
      });
      
      return results;
    }
    return [];
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
    return [];
  }
}

// Main function to process all pages
async function processAllPages() {
console.log("main...");
  // Get all links from the current table
  const tbody = document.querySelector('#links-table tbody');
  const rows = tbody.querySelectorAll('tr');
  const links = Array.from(rows).map(row => row.querySelector('td:nth-child(2)').textContent);
  
  // Process all pages
  const allResults = [];
console.log("Links to download:", links);  
  for (const link of links) {
    const pageResults = await processPage(link);
    allResults.push(...pageResults);
  }
console.log("result:", allResults);
  
  // Clear the existing table
  tbody.innerHTML = '';
  
  // Create new table with processed data
  allResults.forEach((result, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${result.name}</td>
      <td>${result.platform}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Update table header
  const headerRow = document.querySelector('#links-table thead tr');
  headerRow.innerHTML = `
    <th>#</th>
    <th>Name</th>
    <th>Platform</th>
  `;
}

// Add button click handler
document.getElementById('process-button').addEventListener('click', processAllPages);
