import json
import urllib.parse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SOURCE_DATA_PATH = BASE_DIR.parent / 'shared' / 'data' / 'components.json'
MIRROR_DATA_PATHS = [
    BASE_DIR.parent / 'data' / 'components.json',
    BASE_DIR.parent / 'frontend' / 'data' / 'components.json',
]


def generate_amazon_link(name, category=''):
    search_term = name.replace(' / ', ' ').replace('/', ' ')
    if category:
        search_term = f"{search_term} {category}"
    encoded = urllib.parse.quote_plus(search_term)
    return f"https://www.amazon.in/s?k={encoded}"


with open(SOURCE_DATA_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

categories = {
    'laptops': 'laptop',
    'cpus': 'processor',
    'gpus': 'graphics card',
    'mobos': 'motherboard',
    'ram': 'RAM memory',
    'storage': 'SSD',
    'psu': 'power supply',
    'case': 'PC case',
}

total_added = 0
total_products = 0

for category_key, category_name in categories.items():
    if category_key not in data:
        continue

    for item in data[category_key]:
        total_products += 1
        if 'buyLink' not in item or not item.get('buyLink'):
            item['buyLink'] = generate_amazon_link(item['name'], category_name)
            total_added += 1
            print(f"Added link for {category_key}: {item['name'][:50]}...")

serialized = json.dumps(data, indent=2, ensure_ascii=False)

for target in [SOURCE_DATA_PATH, *MIRROR_DATA_PATHS]:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(serialized, encoding='utf-8')

print(f"\nSuccessfully added {total_added} Amazon buy links!")
print(f"Total products in database: {total_products}")
print('Synchronized shared/data plus frontend/data and root data mirrors.')
