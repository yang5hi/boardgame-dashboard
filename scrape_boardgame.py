# Dependencies
import time
import pandas as pd
from splinter import Browser
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager

def scrape():
    # Set up Splinter
    executable_path = {'executable_path': ChromeDriverManager().install()}
    browser = Browser('chrome', **executable_path, headless=False)

    #----------------------(NASA Mars News)----------------------------------------------
    # URL of page to be scraped 
    url = 'https://boardgamegeek.com/blog/1/boardgamegeek-news'
    # Retrieve the page
    browser.visit(url)
    # Wait for 1 second to load the page
    time.sleep(1)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    # Examine the results, then determine element that contains sought info
    # results are returned as an iterable list
    news_titles = soup.find(class_='post_title')
    # find the news title and body
    news_title = news_titles.find(class_='content_title').text
    news_p = news_titles.find(class_="article_teaser_body").text

    #----------------------(Featured Image)--------------------------------------------
    # URL of page to be scraped 
    url="https://www.jpl.nasa.gov/images?search=&category=Mars"
    # Retrieve the page
    browser.visit(url)
    # Wait for 1 second to load the page
    time.sleep(1)
    browser.links.find_by_partial_text('Image').click()
    # Wait for 1 second to load the page
    time.sleep(1)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    # Examine the results, then determine element that contains sought info
    # results are returned as an iterable list
    featured_image_url = soup.find('img', class_="BaseImage")['src']

    # organize all scraped data into one dictionary
    boardgame_data={"news_title":news_title, "news_p":news_p, "featured_image_url":featured_image_url,"boardgame_ranking":[],
                "game_info_table":[]}

    browser.quit()

    return boardgame_data