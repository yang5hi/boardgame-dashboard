// Initialize the page
UpdatePage();
var option_counter=0
// Update the page
d3.select("#gameSelect").on("change", UpdatePage);
// Function update the page content
function UpdatePage() {
    d3.json("data/game_info.json").then(function(gameInfo) {
        d3.json("data/ranking.json").then(function(ranking) {
            // store the top200 list to topGames variable
            let topGames=Object.values(gameInfo).filter(a=>a.is_top200==true);
            console.log(topGames);

            // apppend the game names to the dropdown menu
            // d3.select("#gameSelect").html(""); // clear the previrous options
            if (option_counter==0) {
                topGames.forEach(game => d3.select("#gameSelect").append("option").text(game.game_name));
                option_counter=1;
            };
            //-------------------------update slected game info---------------------------------------
            // get the game name from the dropdown menu
            let selectedGame=d3.select("#gameSelect").property("value");
            console.log(selectedGame); // validate game name
            d3.select("#game-info-basic").html(""); // clear the previrous paragraphs
            // match the name with game info
            let selectedInfo=topGames.filter(game => game.game_name.includes(selectedGame));

            // output the game Info to DOM
            var gameInfoBox=selectedInfo[0];
            console.log(gameInfoBox); // validate the selected game info
            Object.entries(gameInfoBox).forEach(([key,value])=> {
                if (['description', 'yearpublished','minage','minplayers','maxplayers'].includes (key)){
                    d3.select("#game-info-basic").append("p").append("strong").text(`${key}: ${value}`);
                } else if (key=='gamelink') {
                    d3.select("#game-info-basic").append("p").append("strong").text(`${key}: https://boardgamegeek.com${value}`);
                }
            });

            //-----------------------top 10 games published in the same year as selected----------------------------------
            var selectedYear=+selectedInfo[0].yearpublished;
            console.log(selectedYear);
            let yearGames=Object.values(gameInfo).filter(a=>a.yearpublished==+selectedInfo[0].yearpublished);
            // Get the top 10 games from the games published in the same year
            yearGames.sort((a,b)=>b.average-a.average);
            console.log(yearGames.slice(0,10));
            PlotBar(selectedYear,yearGames.slice(0,10));
            PlotRadar(yearGames.slice(0,10));
            let mdnGames=Object.values(gameInfo).filter(a=>(a.yearpublished>=1980 && a.is_top200==true));
            PlotBubble(mdnGames);
        });
    });
};
function PlotBar (year,games) {
    var data = [{
            type: 'bar',
            y: games.map(a=>a.average),
            x: games.map(a=>a.game_name),
            marker: {
                color: 'e5f9f8',
                line: {width: 0.5}
            },
        }];
    var layout = {
            title: `top 10 games published in ${year}`,
            yaxis: {title: 'Game Rating'},
            xaxis: {tickangle: -45},
            font: {size: 10},
            showlegend: false
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
          backgroundColor: 'rgba(247, 202, 24, 0.2',
          borderColor: 'rgb(247, 202, 24)',
          pointBackgroundColor: 'rgb(247, 202, 24)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(247, 202, 24)'
        }, {
          label: 'Language Dependence',
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
function PlotBubble(games){
  var trace1 = {
          x: games.map(a=>a.yearpublished),
          y: games.map(a=>a.average),
          text: games.map(a=>a.game_name),
          mode: 'markers',
          marker: {
              color: games.map(a=>a.objectid),
              size: games.map(a=>a.average)
          }
      };
  var layout = {
          title: `Games Published since 1980's`,
          font: {size: 12},
          xaxis: {title: 'Year Published'},
          yaxis: {title: 'Rating'},
          showlegend: false
      };
  Plotly.newPlot('bubble', [trace1], layout);
};
