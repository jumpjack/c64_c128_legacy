document.getElementById('download-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const startNumber = parseInt(document.getElementById('start-number').value);
  const endNumber = parseInt(document.getElementById('end-number').value);
  const proxyURL = "https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";
  const resultsTable = document.querySelector('#links-table tbody');
  //const jsonOutput = document.getElementById('json-output');
  let linksArray = [];

  resultsTable.innerHTML = ''; // Pulisce la tabella
  //jsonOutput.innerHTML = '';   // Pulisce il JSON

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
 // jsonOutput.textContent = JSON.stringify(linksArray, null, 2);
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
    <th>Name</th>
    <th>Platform</th>
    <th>Issue number</th>
    <th>Issue Date</th>            
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


function getMonthNumber(monthName) {
  const months = {
    'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04', 
    'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
    'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
  };
  return months[monthName.toLowerCase()] || '00';
}



function extractIssueInfo(url) {
  let issue, month, year;  
  // Estrai il numero della rivista
    // https://www.retromagazine.net/retromagazine-world-n-30-giugno-2021/  // da 30 in poi
    // https://www.retromagazine.net/retromagazine-world-n29-aprile-2021/   // da 23 a 29
    // https://www.retromagazine.net/retromagazine-n22-aprile-2020/         // da 5 a 22   
  let match = url.match(/retromagazine-world-n-(\d+)/);
  if (match) {
    issue = match[1];
    // Formato 1
    // https://www.retromagazine.net/retromagazine-world-n-30-giugno-2021/ 
    const dateMatch = url.match(/n-\d+-([\w]+)-(\d{4})/);
    if (dateMatch) {
      month = getMonthNumber(dateMatch[1]);
      year = dateMatch[2];
    }
  } else {
    // Formato 2
    // https://www.retromagazine.net/retromagazine-world-n29-aprile-2021/ 
    match = url.match(/retromagazine-world-n(\d+)-([\w]+)-(\d{4})/);
    if (match) {
      issue = match[1];
      month = getMonthNumber(match[2]);
      year = match[3];
    } else {
        // Formato 3
      // https://www.retromagazine.net/retromagazine-n22-aprile-2020/ 
      match = url.match(/retromagazine-n(\d+)-([\w-]+)-(\d{4})/);
      if (match) {
        issue = match[1];
        month = getMonthNumber(match[2]);
        year = match[3];
      } else {
        // Formato 4
       // https://www.retromagazine.net/retromagazine-4/
        match = url.match(/retromagazine-(\d+)/);
        if (match) {
          issue = match[1];
          month = 0;
          year = 0;
        } else {
        // ???
        } 
      } 
    }
  }

  return {
    issue: parseInt(issue).toString().padStart(2, '0') || 'N/A',
    month: parseInt(month).toString().padStart(2, '0') || '00',
    year: year || '0000'
  };
}

// Function to process a single page and extract data
async function processPage(url) {
console.log("Page:", url);
  const proxyURL = "https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";
  try {
    const response = await fetch(proxyURL + encodeURIComponent(url));
    const html = await response.text();
    const issueInfo = extractIssueInfo(url);
    const issueNumber = issueInfo.issue;
    const issueMonth = issueInfo.month;
    const issueYear = issueInfo.year;
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get all lists with the specified class
    const lists = doc.querySelectorAll('ul.wp-block-list.has-light-green-cyan-background-color');
    // wp-block-list has-light-green-cyan-background-color has-background
    // We want the second list
    if (lists.length >= 2) {
      targetList = lists[1];
    } else if (lists.length === 1) {
      targetList = lists[0];
    } else {
        // has-vivid-green-cyan-background-color has-background wp-block-list
        targetList = doc.querySelectorAll('ul.wp-block-list.has-vivid-green-cyan-background-color')[0];
    }
console.log("targetList=",targetList)    ;
      const items = targetList.querySelectorAll('li');
      
      // Process each item
      const results = [];
      items.forEach(item => {
        const text = item.textContent.trim();
        const match = text.match(/(.*?)\s*(?:\((.*?)\))?$/);
        
        if (match) {
          results.push({
            issueNumber: issueNumber,
            issueMonth: issueMonth,
            issueYear: issueYear,
            name: match[1].trim(),
            platform: match[2] ? match[2].trim() : '',
            link: url
          });
        }
      });
      
      return results;
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
    return [];
  }
}

// Main function to process all pages
async function processAllPages() {
  console.log("all");
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

      
  const tbody = document.querySelector('#links-table tbody');
  const rows = tbody.querySelectorAll('tr');
  const links = Array.from(rows).map(row => {
    const link = row.querySelector('td:nth-child(2) a');
    return link ? link.href : '';
  }).filter(link => link);

  // Mostra la barra di progresso
  progressContainer.style.display = 'block';
  progressText.textContent = `Elaborazione pagine: 0/${links.length}`;
  progressBar.style.width = '0%';

  
  const allResults = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const pageResults = await processPage(link);
    allResults.push(...pageResults);
    
   // Aggiorna la barra di progresso
    const progress = ((i + 1) / links.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Elaborazione pagine: ${i + 1}/${links.length}`;
        
  }
  console.log("allResults",allResults);
  
  // Clear the existing table
  tbody.innerHTML = '';
  
  // Create new table with processed data
  allResults.forEach((result, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-sort="${index + 1}">${index + 1}</td>
      <td data-sort="${result.name.toLowerCase()}">${result.name}</td>
      <td data-sort="${result.platform.toLowerCase()}">${result.platform}</td>
      <td data-sort="${result.issueNumber}">
        ${result.issueNumber} 
        (<a href="${result.link}">Web</a>) (<a href="https://www.retromagazine.net/download/RetroMagazine_${result.issueNumber}.pdf">PDF</a>)
      </td>
      <td data-sort="${result.issueYear}${result.issueMonth}">${result.issueYear}/${result.issueMonth}</td>      
    `;
    tbody.appendChild(row);
  });
  
  // Update table header with sortable columns
  const headerRow = document.querySelector('#links-table thead tr');
  headerRow.innerHTML = `
    <th data-sort-type="number" style="cursor: pointer">#</th>
    <th data-sort-type="text" style="cursor: pointer">Name</th>
    <th data-sort-type="text" style="cursor: pointer">Platform</th>
    <th data-sort-type="number" style="cursor: pointer">Issue number</th>
    <th data-sort-type="text" style="cursor: pointer">Issue Date</th>
  `;

  // Add click event listeners to headers
  document.querySelectorAll('#links-table th').forEach((header, index) => {
    header.addEventListener('click', () => sortTable(index));
  });
  
  // Nascondi la barra di progresso al completamento
  setTimeout(() => {
    progressContainer.style.display = 'none';
  }, 1000);
    
}

// Funzione per l'ordinamento della tabella
function sortTable(columnIndex) {
  const table = document.getElementById('links-table');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const headers = table.querySelectorAll('th');
  const header = headers[columnIndex];
  const sortType = header.getAttribute('data-sort-type');
  
  // Toggle sort direction
  const currentOrder = header.getAttribute('data-sort-order') || 'asc';
  const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
  
  // Reset all headers
  headers.forEach(h => {
    h.removeAttribute('data-sort-order');
    h.textContent = h.textContent.replace(' ▲', '').replace(' ▼', '');
  });
  
  // Set new sort order and indicator
  header.setAttribute('data-sort-order', newOrder);
  header.textContent += newOrder === 'asc' ? ' ▲' : ' ▼';

  // Sort rows
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].getAttribute('data-sort');
    const bValue = b.cells[columnIndex].getAttribute('data-sort');
    
    if (sortType === 'number') {
      const aNum = parseFloat(aValue) || 0;
      const bNum = parseFloat(bValue) || 0;
      return newOrder === 'asc' ? aNum - bNum : bNum - aNum;
    } else {
      return newOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });

  // Reattach sorted rows
  tbody.innerHTML = '';
  rows.forEach(row => tbody.appendChild(row));
}

// Add button click handler
document.getElementById('process-button').addEventListener('click', processAllPages);
