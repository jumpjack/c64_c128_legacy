let allData = [];

function extractPageData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const pageNumbers = [];
    const links = [];
    
    // Trova tutti i link che contengono 'pagina.php'
    const pageLinks = doc.querySelectorAll('a[href*="pagina.php"]');
 
    pageLinks.forEach(link => {
        // Prendi il testo contenuto nel link
        const pageNum = link.textContent.trim();
        const pageLink = link.getAttribute("href");   
        pageNumbers.push(pageNum);
        links.push(pageLink);
    });
    
    return { pageNumbers: pageNumbers, pageLinks: links};
}


function parseArticleData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const articles = [];
    
    // Troviamo tutti i div menu-scomparsa che contengono i dettagli
    const menuDivs = doc.querySelectorAll('.menu-scomparsa');
    menuDivs.forEach(div => {
        // Troviamo il titolo che è nel link precedente al div
        const id = div.id;
        const titleLink = doc.querySelector(`a[onclick="return mostraMenu(${id})"]`);
        const title = titleLink ? titleLink.textContent.trim() : '';

        const article = {
            titolo: title
        };

        const spans = div.querySelectorAll('span');
        spans.forEach(span => {
            const text = span.innerHTML;
            if (text.includes('Categoria:')) {
                article.categoria = text.split('Categoria:</b> ')[1].split('<br>')[0].trim();
                article.autore = text.split('Autore:</b> ')[1].split('<br>')[0].trim();
                article.descrizione = text.split('Descrizione:</b> ')[1].split('<br>')[0].trim();
                article.keywords = text.split('Keywords:</b> ')[1].trim();
            }
        });
        
        if (Object.keys(article).length > 0) {
            articles.push(article);
        }
    });

    return articles;
}

async function fetchPage(numero) {
    const url = `https://ready64.org/ccc/sommario.php?azione=consulta&numero=${numero}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const articles = parseArticleData(html);
        const pageData = extractPageData(html);
        const pageNumbers = pageData.pageNumbers;
        const pageLinks = pageData.pageLinks;
        
        return {
            numero,
            articles: articles.map((article, index) => ({
                ...article,
                pagine: pageNumbers[index] || '',
                link: pageLinks[index] || ''
            }))
        };
    } catch (error) {
        console.error(`Error fetching numero ${numero}:`, error);
        return null;
    }
}

async function startScraping() {
    const startNum = parseInt(document.getElementById('startNum').value);
    const endNum = parseInt(document.getElementById('endNum').value);
    
    if (startNum > endNum) {
        alert('Il numero iniziale deve essere minore del numero finale!');
        return;
    }

    const startButton = document.getElementById('startButton');
    startButton.disabled = true;

    allData = [];
    document.querySelector('#dataTable tbody').innerHTML = '';
    const progressDiv = document.getElementById('progress');
    const downloadBtn = document.getElementById('downloadJson');
    const downloadBtn2 = document.getElementById('downloadHtml');
    downloadBtn.style.display = 'none';
    downloadBtn2.style.display = 'none';
    for (let i = startNum; i <= endNum; i++) {
        progressDiv.textContent = `Elaborazione numero ${i}...`;
        const data = await fetchPage(i);
        
        if (data && data.articles.length > 0) {
            allData.push(data);
            updateTable(data);
        }
    }
    progressDiv.textContent = 'Scraping completato!';
    downloadBtn.style.display = 'block';
    downloadBtn2.style.display = 'block';
    startButton.disabled = false; 

    
}

function updateTable(data) {
    const tbody = document.querySelector('#dataTable tbody');
    
    data.articles.forEach(article => {
        const row = tbody.insertRow();
        row.insertCell().innerHTML = "<a href='https://ready64.org/ccc/" + article.link + "'>" + article.titolo + "</a>";
        row.insertCell().textContent = article.descrizione;
        const coverLink = article.link.substring(0, article.link.indexOf("pag=")+4) + "001.jpg";
        row.insertCell().innerHTML = "<a href='https://ready64.org/ccc/" + coverLink + "'>" + data.numero + "</a>";
        row.insertCell().textContent = article.pagine;
        row.insertCell().textContent = article.autore;
        row.insertCell().textContent = article.categoria;
        row.insertCell().textContent = article.keywords;
    });
}
function downloadJsonData() {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ready64_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadHtmlTable() {
    // Crea uno stile CSS inline per la tabella
    const style = `
        <style>
            table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 20px 0;
                font-family: Arial, sans-serif;
            }
            th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
            }
            th { 
                background-color: #f4f4f4; 
                font-weight: bold;
            }
            tr:nth-child(even) { 
                background-color: #f9f9f9; 
            }
            h1 {
                font-family: Arial, sans-serif;
            }
        </style>
    `;

    // Prendi la tabella esistente e crea un documento HTML completo
    const table = document.getElementById('dataTable').cloneNode(true);
    const html = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <title>Dati Ready64 Magazine</title>
            ${style}
        </head>
        <body>
            <h1>Dati Ready64 Magazine</h1>
            ${table.outerHTML}
        </body>
        </html>
    `;

    // Crea e scarica il file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ready64_table.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


document.getElementById('startButton').addEventListener('click', startScraping);
document.getElementById('downloadJson').addEventListener('click', downloadJsonData);
document.getElementById('downloadHtml').addEventListener('click', downloadHtmlTable);

