# Dependencies
import numpy as np
import pandas as pd
from sqlalchemy import create_engine
import pandas as pd
from bs4 import BeautifulSoup
import requests
import os
import re

def scrape():
    game_info_df=pd.read_csv("../bgg_csv/boardgames2_06022021.csv")
    ranking_df=pd.read_csv("../bgg_csv/2021-05-29_game_id_rankings.csv")

    # Create database connection
    # change the owner name, password and port number based on your local situation
    # engine = create_engine(f'postgresql://{*database_owner}:{*password}@localhost:{*port}/housing_db')
    rds_connection_string = "postgres:Di2JieDu@n@localhost:5432/boardgame_db"
    engine = create_engine(f'postgresql://{rds_connection_string}')

    # URL of page to be scraped
    url = 'https://boardgamegeek.com/blog/1/boardgamegeek-news'
    # Retrieve page with the requests module
    response = requests.get(url)
    # Create BeautifulSoup object; parse with 'lxml'
    soup = BeautifulSoup(response.text, 'html.parser')
    news_titles = soup.find(class_='blog_post')
    # find the news title and image
    news_title = news_titles.find(class_='post_title').text.strip('\n')
    featured_image_url = soup.find(class_="post-img").a.img['src']
    news_df=pd.DataFrame([{"news_title":news_title}, {"featured_image_url":featured_image_url}])

    # get the top 200 rankings
    ranking_df.drop_duplicates(subset=['BoardGameRank'], inplace=True)
    ranking_df.fillna(0, inplace=True)
    ranking_int_df=ranking_df.astype('int64')
    ranking_int_df['BoardGameRank'] = ranking_int_df.BoardGameRank.astype(str)
    ranking_200_df=ranking_int_df.head(200).copy()
    ranking_200_df.set_index('BoardGameRank', inplace=True)

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
        x=b.replace('\\u','/u').replace('\\', "").replace('/u','\\u')
        c=(x.encode('utf-8').decode('unicode-escape'))
        kk.append(c)
    game_info_df['game_name']=kk
    # convert description to JSON parsible format
    a=game_info_df['description']
    kk=[]
    for b in a:
        b=re.sub(r'[^\x20-\x7F]',r'', b)
        b=b.replace('"',"")
        kk.append(b)
    game_info_df['game_description']=kk
    game_info_df = game_info_df.replace(to_replace= r'\\', value= '', regex=True)  

    # get only the needed columns
    game_info_selected_df=game_info_df[['objectid', 'game_name', 'game_description', 'yearpublished','is_top200',
                                    'average','numplays','maxplaytime','minage', 'languagedependence',
                                    'minplayers','maxplayers', 'minplaytime','gamelink']].copy()
    # drop the duplicates based on objectid
    game_info_selected_df.drop_duplicates(subset=['objectid'], inplace=True)
    game_info_selected_df['objectid'] = game_info_selected_df.objectid.astype(str)
    game_info_selected_df.set_index('objectid', inplace=True)
    # Load dataframes into databases
    ranking_200_df.to_sql(name = 'ranking_200', con = engine, if_exists = 'append', index = True)
    game_info_selected_df.to_sql(name = 'game_info', con = engine, if_exists = 'append', index = True)
    news_df.to_sql(name = 'news', con = engine, if_exists = 'append', index = False)
    return [ranking_200_df,game_info_selected_df, news_df]
    