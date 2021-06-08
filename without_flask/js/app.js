// Initialize the page
UpdatePage();
UpdateNews();
function UpdateNews(){
  d3.json("data/news.json").then(function(news) {
    // console.log(news);
    d3.select(".card-title").text(`${news.news_title[0]}`);
    d3.select("#news-image").attr("src", `${news.featured_image_url[0]}`);
    // Append the date to the news card
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    d3.select(".card-footer").append('p').text(today);
  });
};
var option_counter=0
// Update the page
d3.select("#gameSelect").on("change", UpdatePage);
// Function update the page content
function UpdatePage() {
    d3.json("data/game_info.json").then(function(gameInfo) {
        d3.json("data/ranking.json").then(function(ranking) {
            // store the top200 list to topGames variable
            let topGames=Object.entries(gameInfo).filter(([key,value])=>value.is_top200==true);
            // console.log(topGames);
            // apppend the game names to the dropdown menu
            if (option_counter==0) {
                topGames=topGames.sort(function(a, b) {
                   var nameA = a[1].game_name; // ignore upper and lowercase
                   var nameB = b[1].game_name; // ignore upper and lowercase
                   if (nameA < nameB) {
                     return -1;
                   }
                   if (nameA > nameB) {
                     return 1;
                   }
                   // names must be equal
                   return 0;
                 });
                topGames.forEach(game => d3.select("#gameSelect").append("option").text(game[1].game_name));
                option_counter=1;
            };
            //-------------------------update slected game info---------------------------------------
            // get the game name from the dropdown menu
            let selectedGame=d3.select("#gameSelect").property("value");
            // console.log(selectedGame); // validate game name
            d3.select("#game-info-basic").html(""); // clear the previrous paragraphs
            // match the name with game info
            let selectedInfo=topGames.filter(game => game[1].game_name.includes(selectedGame));
            // console.log(selectedInfo);
            // output the game Info to DOM
            var gameInfoBox=selectedInfo[0][1];
            // console.log(gameInfoBox); // validate the selected game info
            Object.entries(gameInfoBox).forEach(([key,value])=> {
                if (key=='description') {
                    d3.select("#game-info-basic").append("p").append("strong").text(`Desciption: ${value}`);
                  } else if (key=='yearpublished') {
                    d3.select("#game-info-basic").append("p").append("strong").text(`Published: ${value}`);
                  } else if (key=='minage') {
                    d3.select("#game-info-basic").append("p").append("strong").text(`Age Limit: ${value}`);
                  } else if (key=='minplayers') {
                    d3.select("#game-info-basic").append("p").append("strong").text(`Min Players: ${value}`);
                  } else if (key=='maxplayers') {
                    d3.select("#game-info-basic").append("p").append("strong").text(`Max Players: ${value}`);
                  } else if (key=='gamelink') {
                    d3.select("#game-info-basic").append("a").attr("href",`https://boardgamegeek.com${value}`).attr("id","game-link");
                    d3.select("#game-link").append("strong").append("p").text(`https://boardgamegeek.com${value}`);

                }
            });
            // find the publish year base on dropdown selection
            var selectedYear=+selectedInfo[0][1].yearpublished;
            // console.log(selectedYear);
            // find the game object id based on the dropdown selection
            var selectedId=selectedInfo[0][0]
            // console.log(selectedId);
            // get the games published in the same year as selected
            let yearGames=Object.values(gameInfo).filter(a=>a.yearpublished==+selectedInfo[0][1].yearpublished);
            PlotBubble(selectedYear,yearGames);
            // Get the top 10 games from the games published in the same year
            yearGames.sort((a,b)=>b.average-a.average);
            // console.log(yearGames.slice(0,10));
            PlotBar(selectedYear,yearGames.slice(0,10));
            PlotRadar(yearGames.slice(0,10));
            // get the list for the ranking and time
            let rankingList=Object.entries(ranking).map(([key,value]) => {
                var top200=value;
                var wklRank=205;
                Object.entries(top200).filter(([key,value])=> {
                  if (value==selectedId) {
                    wklRank=key;
                  };
                });
                return [key, +wklRank]
            });
            // console.log(rankingList);
            PlotLine (selectedGame,rankingList);
        });
    });
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
          xaxis: {title: 'Number of Play Count from members', type:'log'},
          yaxis: {title: 'Rating'},
          showlegend: false
      };
  Plotly.newPlot('bubble', [trace1], layout);
};
function PlotLine(selectedGame,rankingList){
  var trace1 = {
    x: rankingList.map(a=>a[0]),
    y: rankingList.map(a=>a[1]),
    mode: 'line',
    marker: {
      color: 'rgb(64,239,182)',
      size: 6
    }
  };
  var layout = {
    title: `${selectedGame} ranking`,
    xaxis: {title: 'Time'},
    yaxis: {title: 'Game Ranking', range: [0,200]},
    showlegend: false,
  };
  Plotly.newPlot('line_popularity', [trace1],layout);
};
