# Dependencies
import time
import pandas as pd
import numpy as np
import os
import re
from splinter import Browser
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager

def scrape():
    game_info_df=pd.read_csv("data/boardgames2_06022021.csv")
    ranking_df=pd.read_csv("data/2021-05-29_game_id_rankings.csv")

    # get the top 200 rankings
    ranking_df.drop_duplicates(subset=['BoardGameRank'], inplace=True)
    ranking_df.set_index('BoardGameRank', inplace=True)
    ranking_df.fillna(0, inplace=True)
    rank_int_df=ranking_df.astype('int64')
    ranking_200_df=rank_int_df.head(200).copy()
    ranking_200_dict=ranking_200_df.to_dict()
    ranking_200_json=ranking_200_df.to_json('data/ranking.json')

    # check if any game in the top 200 list is not the 20k game info list
    game_id_list=game_info_df['objectid']
    game_20k_list=[*game_id_list]
    game_20k_set=set(game_20k_list)
    game_ids=[]
    for i in range(200):
        game_id=ranking_200_df.iloc[i].unique()
        game_ids.extend(game_id)
    unique_game_ids=set(game_ids)
    unique_game_ids.remove(0)
    game_out=0
    for game_id in unique_game_ids:
        if game_id not in game_20k_set:
            print(f'{game_id} not found')
            game_out+=1
    print(f'there are/is {game_out} game(s) from top 200 games that not cover in the 20k game info')


    # add a column "is_top200" to game_info_df
    is_top200_list=[]
    for game_id in game_info_df['objectid']:
        if game_id in unique_game_ids:
            is_top200_list.append(True)
        else:
            is_top200_list.append(False)
    game_info_df['is_top200']=is_top200_list

    # convert unicode to printable format
    a=game_info_df['name']
    kk=[]
    for b in a:
        b=re.sub('\s\s+', ' ', b)
        try:
            c=(b.encode('utf-8').decode('unicode-escape'))
            kk.append(c)
        except:
            x=b.replace('\\u','/u').replace('\\', "").replace('/u','\\u')
            c=(x.encode('utf-8').decode('unicode-escape'))
            kk.append(c)
    game_info_df['game_name']=kk

    # parse the category, publisher, and mechanic info
    bg_cat=game_info_df['boardgamecategory']
    game_info_df['boardgamecategory']=[cc[1:-1].replace("'",'').split(",") for cc in bg_cat]
    bg_pub=game_info_df['boardgamepublisher']
    game_info_df['boardgamepublisher']=[cc[1:-1].replace("'",'').split(",") for cc in bg_pub]
    bg_mec=game_info_df['boardgamemechanic']
    game_info_df['boardgamemechanic']=[cc[1:-1].replace("'",'').split(",") for cc in bg_mec]

    # select and rename columns
    game_info_selected_df=game_info_df[['objectid', 'game_name', 'description', 'yearpublished','is_top200',
                                    'average','numplays','maxplaytime','minage', 'languagedependence',
                                    'minplayers','maxplayers', 'minplaytime',  
                                    'news', 'blogs', 'weblink','podcast', 
                                    'boardgamepublisher', 'boardgamecategory', 'boardgamemechanic','gamelink']].copy()
    game_info_selected_df.drop_duplicates(subset=['objectid'], inplace=True)
    game_info_selected_df=game_info_selected_df.sort_values(by=['game_name']).reset_index(drop=True)
    game_info_json=game_info_selected_df.T.to_json('data/game_info.json')
    game_info_dict=game_info_selected_df.T.to_dict()


    # Set up Splinter
    executable_path = {'executable_path': ChromeDriverManager().install()}
    browser = Browser('chrome', **executable_path, headless=False)
    # URL of page to be scraped
    url = 'https://boardgamegeek.com/blog/1/boardgamegeek-news'

    # Retrieve the page
    browser.visit(url)
    # Wait for 2 seconds to load the page
    time.sleep(2)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    # Examine the results, then determine element that contains sought info
    # results are returned as an iterable list
    news_titles = soup.find(class_='blog_post')
    # find the news title and image
    news_title = news_titles.find(class_='post_title').text
    print(news_title)
    featured_image_url = soup.find(class_="post-img").a.img['src']
    print(f"featured_image_url: {featured_image_url}")



    # organize all scraped data into one dictionary
    bgg_data={"news_title":news_title, "featured_image_url":featured_image_url,"ranking":ranking_200_dict,
                "game_info":game_info_dict}

    browser.quit()

    return bgg_data