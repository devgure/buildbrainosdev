import requests
from bs4 import BeautifulSoup

def scrape_example():
    # placeholder: fetch a page and parse titles
    r = requests.get('https://example.com')
    soup = BeautifulSoup(r.text, 'html.parser')
    titles = [t.get_text(strip=True) for t in soup.find_all('h1')]
    return titles

if __name__ == '__main__':
    print('Scraped titles:', scrape_example())
