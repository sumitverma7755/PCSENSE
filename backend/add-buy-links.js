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

function generateAmazonLink(name, category = '') {
    let searchTerm = name.replace(/ \/ /g, ' ').replace(/\//g, ' ');
    if (category) {
        searchTerm = `${searchTerm} ${category}`;
    }

    return `https://www.amazon.in/s?k=${encodeURIComponent(searchTerm)}`;
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

let totalAdded = 0;
let totalProducts = 0;

for (const [categoryKey, categoryName] of Object.entries(categories)) {
    if (!Array.isArray(data[categoryKey])) {
        continue;
    }

    for (const item of data[categoryKey]) {
        totalProducts += 1;
        if (!item.buyLink || item.buyLink === '') {
            item.buyLink = generateAmazonLink(item.name, categoryName);
            totalAdded += 1;
            console.log(`Added link for ${categoryKey}: ${(item.name || '').substring(0, 50)}...`);
        }
    }
}

writeDatabaseEverywhere(data);

console.log(`\nSuccessfully added ${totalAdded} Amazon buy links.`);
console.log(`Total products in database: ${totalProducts}`);
console.log('Synchronized shared/data plus frontend/data and root data mirrors.');
