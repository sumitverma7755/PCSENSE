const fs = require('fs');
const path = require('path');

const SOURCE_DATA_PATH = path.join(__dirname, '..', 'shared', 'data', 'components.json');
const MIRROR_DATA_PATHS = [
    path.join(__dirname, '..', 'data', 'components.json'),
    path.join(__dirname, '..', 'frontend', 'data', 'components.json')
];

function writeDatabaseEverywhere(data) {
    const serialized = JSON.stringify(data, null, 2);
    const targets = [SOURCE_DATA_PATH, ...MIRROR_DATA_PATHS];

    for (const target of targets) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, serialized, 'utf8');
    }
}

// Read the component database from the source-of-truth path.
const data = JSON.parse(fs.readFileSync(SOURCE_DATA_PATH, 'utf8'));

function generateShoppingLinks(name, category = '') {
    const searchTerm = name.replace(/ \/ /g, ' ').replace(/\//g, ' ');
    const searchQuery = category ? `${searchTerm} ${category}` : searchTerm;

    return {
        amazon: `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`,
        flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`,
        reliance: `https://www.reliancedigital.in/search?q=${encodeURIComponent(searchQuery)}`,
        croma: `https://www.croma.com/search?q=${encodeURIComponent(searchQuery)}`,
        vijay: `https://www.vijaysales.com/search?q=${encodeURIComponent(searchQuery)}`,
        mdcomputers: `https://mdcomputers.in/index.php?route=product/search&search=${encodeURIComponent(searchQuery)}`
    };
}

const categories = {
    laptops: 'laptop',
    cpus: 'processor',
    gpus: 'graphics card',
    mobos: 'motherboard',
    ram: 'RAM memory',
    storage: 'SSD',
    psu: 'power supply',
    case: 'PC case'
};

let totalUpdated = 0;
let totalProducts = 0;

for (const [categoryKey, categoryName] of Object.entries(categories)) {
    if (!Array.isArray(data[categoryKey])) {
        continue;
    }

    for (const item of data[categoryKey]) {
        totalProducts += 1;
        item.shopLinks = generateShoppingLinks(item.name, categoryName);
        delete item.buyLink;
        totalUpdated += 1;

        if (totalUpdated % 100 === 0) {
            console.log(`Processed ${totalUpdated} products...`);
        }
    }
}

writeDatabaseEverywhere(data);

console.log(`\nSuccessfully added multi-store links to ${totalUpdated} products.`);
console.log(`Total products in database: ${totalProducts}`);
console.log('Stores integrated: Amazon, Flipkart, Reliance Digital, Croma, Vijay Sales, MD Computers');
console.log('Synchronized shared/data plus frontend/data and root data mirrors.');
