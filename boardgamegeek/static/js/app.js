//-----------------prase the json data-------------------------------------------
var jsNewsData = JSON.parse(newsData);
var jsRankingData = JSON.parse(rankingData);
var jsGameData = JSON.parse(gameData);
// console.log(jsNewsData);
// console.log(jsRankingData);
// console.log(jsGameData);
// ---------------------------Initialize the page----------------------------------
var newsTitle=Object.values(jsNewsData.news_title).filter(value=>value !=null)
var imgUrl=Object.values(jsNewsData.featured_image_url).filter(value=>value !=null)
// console.log(newsTitle);
// console.log(imgUrl);
d3.select(".card-title").text(`${newsTitle}`)
d3.select("#news-image").attr("src",`${imgUrl}`)
// store the top200 list to topGames variable
var dropdownfrm=d3.select(".form-select")
let topGames=Object.values(jsGameData).filter(a=>a.is_top200==true);
// sort the game name to list to the dropdown
topGames=topGames.sort(function(a, b) {
  if (a.game_name < b.game_name) {return -1;}
  if (a.game_name > b.game_name) {return 1;}
  return 0;// names must be equal
});
// console.log(topGames);
d3.select(".form-select").selectAll("option").remove()
// apppend the game names to the dropdown menu
topGames.forEach(game=> d3.select(".form-select").append("option").text(game.game_name));
UpdateDate();
UpdatePage();
// Update the page
d3.select("#gameSelect").on("change", UpdatePage);
// Function update the page content
function UpdatePage() {
    //-------------------------update slected game info---------------------------------------
    // get the game name from the dropdown menu
    let selectedGame=d3.select("#gameSelect").property("value");
    // console.log(selectedGame); // validate game name
    d3.select("#game-info-basic").html(""); // clear the previrous paragraphs
    // match the name with game info
    let selectedInfo=topGames.filter(game => game.game_name==selectedGame);
    // output the game Info to DOM
    var gameInfoBox=selectedInfo[0];
    // console.log(gameInfoBox); // validate the selected game info
    Object.entries(gameInfoBox).forEach(([key,value])=> {
      if (key=='game_description') {
        d3.select("#game-info-basic").append("p").append("strong").text(`Description: \b${value}`);
      } else if (key=='yearpublished') {
        d3.select("#game-info-basic").append("p").append("strong").text(`Published: \b${value}`);
      } else if (key=='minage') {
        d3.select("#game-info-basic").append("p").append("strong").text(`Min Player Age: \b${value}`);
      } else if (key=='minplayers') {
        d3.select("#game-info-basic").append("p").append("strong").text(`Min Players: \b${value}`);
      } else if (key=='maxplayers') {
        d3.select("#game-info-basic").append("p").append("strong").text(`Max Players: \b${value}`);
      } else if (key=='gamelink') {
        d3.select("#game-info-basic").append("a").attr("href",`https://boardgamegeek.com${value}`).attr("id","game-link");
        d3.select("#game-link").append("strong").append("p").text(`Game Link: \n https://boardgamegeek.com${value}`);
      }
    });
    //------------------------Update the Plots-----------------------------------------------------------
    // find the publish year base on dropdown selection
    var selectedYear=+selectedInfo[0].yearpublished;
    // console.log(selectedYear);
    // find the game object id based on the dropdown selection
    var selectedId=selectedInfo[0].objectid
    // console.log(selectedId);
    // get the games published in the same year as selected
    let yearGames=Object.values(jsGameData).filter(a=>a.yearpublished==+selectedInfo[0].yearpublished);
    // Get the top 10 games from the games published in the same year
    yearGames.sort((a,b)=>b.average-a.average);
    // console.log(yearGames.slice(0,10));
    // get the list for the ranking and time
    let rankingList=Object.entries(jsRankingData).map(([key,value]) => {
        var rank_date=value;
        let wklRank="";
        Object.entries(rank_date).filter(([key,value])=> {
          if (value==selectedId) {
            wklRank=key;
          };
        });
        return [key, wklRank]
    });
    rankingList=rankingList.filter(a=>a[1]>0);
    var lineColor='#bb0300'
    if (rankingList[0][1]-rankingList[rankingList.length-1][1]>=0) {
      lineColor='rgb(64,239,182)';
    };
    // console.log(rankingList);
    PlotLine (selectedGame,rankingList,lineColor);
    PlotBar(selectedYear,yearGames.slice(0,10));
    PlotRadar(yearGames.slice(0,10));
    PlotBubble(selectedYear,yearGames);
};
function PlotBar (year,games) {
    var data = [{
            type: 'bar',
            y: games.map(a=>a.average),
            x: games.map(a=>a.game_name),
            marker: {
                color: 'rgba(200,0,0,0.5)',
                line: {
                  color: '#bb0300',
                  width: 1.5
                }
              }
        }];
    var layout = {
            title: `top 10 games published in ${year}`,
            yaxis: {title: 'Game Rating', range: [5,10]},
            xaxis: {tickangle: 30},
            font: {size: 8, family: 'Raleway, sans-serif'},
            showlegend: false,
            bargap :0.5
        };
    Plotly.newPlot('game_graph_1', data, layout);
};
function PlotRadar(games) {
    d3.select("#myChart").remove();
    d3.select(".radar_div").append("canvas").attr("id","myChart");
      const data = {
        labels: games.map(a=>a.game_name),
        datasets: [{
          label: 'Min Age',
          data: games.map(a=>a.minage),
          fill: true,
          backgroundColor: 'rgba(247, 202, 24, 0.2)',
          borderColor: 'rgb(247, 202, 24)',
          pointBackgroundColor: 'rgb(247, 202, 24)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(247, 202, 24)'
        }, {
          label: 'Language Dependence out of 10',
          data: games.map(a=>2*a.languagedependence),
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(54, 162, 235)'
        }]
      };
      const config = {
        type: 'radar',
        data: data,
        options: {
          elements: {
            line: {
              borderWidth: 2
            }
          }
        },
      };
      var myChart = new Chart(
        document.getElementById('myChart'),
        config
      );
};
function PlotBubble(year, games){
  var trace1 = {
          y: games.map(a=>a.average),
          x: games.map(a=>(a.numplays)),
          text: games.map(a=>`${a.game_name}<br>Min Playtime: ${a.minplaytime}<br>Min Number of Players: ${a.minplayers}`),
          mode: 'markers',
          marker: {
              color: games.map(a=> {
                if (a.minplayers<=1) {
                  return "#94de75";
                } else if (a.minplayers<=2) {
                  return "#88b6f1";
                } else if (a.minplayers<=4) {
                  return 'rgba(247, 202, 24, 0.5)';
                } else {
                  return 'rgba(200,0,0,0.5)';
                }
              }),
              size: games.map(a=>(a.minplaytime**0.6))
          }
      };
  var layout = {
          title: `Games Published in ${year}`,
          font: {size: 12},
          xaxis: {title: 'Number of Play Counts from Members', type:'log'},
          yaxis: {title: 'Rating'},
          showlegend: false
      };
  Plotly.newPlot('bubble', [trace1], layout);
};
function PlotLine(selectedGame,rankingList,lineColor){
  var trace1 = {
    x: rankingList.map(a=>a[0]),
    y: rankingList.map(a=>a[1]),
    type:'scatter',
    mode: 'lines',
    marker: {
      color: lineColor,
      size: 6
    }
  };
  var layout = {
    title: `${selectedGame} ranking`,
    xaxis: {title: 'Time', type:'date'},
    yaxis: {title: 'Game Ranking', autorange:"reversed"},
    showlegend: false,
  };
  Plotly.newPlot('line_popularity', [trace1],layout);
};
function UpdateDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  d3.select(".card-footer").selectAll('p').remove()
  d3.select(".card-footer").append('p').text(today);
}