from flask import Flask, render_template, redirect, jsonify
from sqlalchemy import create_engine
import pandas as pd
import json
import flask
import bgg_sql

# Create an instance of Flask
app = Flask(__name__)

# Create database connection
# change the owner name, password and port number based on your local situation
# engine = create_engine(f'postgresql://{*database_owner}:{*password}@localhost:{*port}/housing_db')
rds_connection_string = "postgres:Di2JieDu@n@localhost:5432/boardgame_db"
engine = create_engine(f'postgresql://{rds_connection_string}')

@app.route("/")
def index():
    news_df=pd.read_sql_query('select * from news', con=engine)
    game_info_df=pd.read_sql_query('select * from game_info', con=engine)
    ranking_200_df=pd.read_sql_query('select * from ranking_200', con=engine)
    news_dict=news_df.to_dict()
    game_info_dict=game_info_df.T.to_dict()
    ranking_200_df.set_index('BoardGameRank', inplace=True)
    ranking_dict=ranking_200_df.to_dict()
    bggData=[news_dict,game_info_dict,ranking_dict]
    # Return template and data
    return render_template("index.html", bggData=bggData)

@app.route("/scrape")
def scraper():
    # Run the scrape function
    boardgame_data = bgg_sql.scrape()
    ranking_200_df=boardgame_data[0]
    game_info_selected_df=boardgame_data[1]
    news_df=boardgame_data[2]
    # Load dataframes into databases
    
    ranking_200_df.to_sql(name = 'ranking_200', con = engine, if_exists = 'replace', index = True)
    game_info_selected_df.to_sql(name = 'game_info', con = engine, if_exists = 'replace', index = True)
    news_df.to_sql(name = 'news', con = engine, if_exists = 'replace', index = False)
    # Redirect back to home page
    return redirect("/") #performing URL redirection

if __name__ == "__main__":
    app.run(debug=True)