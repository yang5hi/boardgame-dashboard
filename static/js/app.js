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
            // sort by game_name
            topGames.sort(function(a, b) {
                var nameA = a.game_name.toUpperCase(); // ignore upper and lowercase
                var nameB = b.game_name.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                return -1;
                }
                if (nameA > nameB) {
                return 1;
                }
                // names must be equal
                return 0;
            });
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
            console.log(selectedInfo); // validate the selected game info
            // // output the game Info to DOM
            // selectedMeta.forEach(demoInfo=> {
            //     Object.entries(demoInfo).forEach(([key,value])=> {
            //         d3.select("#sample-metadata").append("p").append("strong").text(`${key}: ${value}`);
            //     })
            // });
            // 
        });

    });
};
// function PlotBubble(otuIds, sampleValues,selectedList, selectedId){
//   var trace1 = {
//           x: otuIds,
//           y: sampleValues,
//           text: selectedList,
//           mode: 'markers',
//           marker: {
//               color: otuIds,
//               size: sampleValues
//           }
//       };
//   var layout = {
//           title: `all OTUs found in test subject ${selectedId}`,
//           font: {size: 12},
//           xaxis: {title: 'OTU ID Number'},
//           yaxis: {title: 'OTU Values'},
//           showlegend: false
//       };
//   Plotly.newPlot('bubble', [trace1], layout);
// };

//         // Fetch the JSON data and log it into console to check the array size
//         console.log(dataSamples);
//         // make sure every object is unique in the dataset
//         let uniqueNames=dataSamples["names"].filter((item, i, ar) => ar.indexOf(item) === i);
//         console.log(uniqueNames);
//         // apppend the subject id into the dropdown menu
//         uniqueNames.forEach(name => d3.select("#selDataset").append("option").text(name));
//         //-------------------------update demographic info---------------------------------------
//         // get the Test Subject ID number from the dropdown menu
//         let selectedId=d3.select("#selDataset").property("value");
//         console.log(selectedId); // validate ID
//         d3.select("#sample-metadata").html(""); // clear the previrous paragraphs
//         // match the id with metadata
//         let selectedMeta=dataSamples['metadata'].filter(sampleInfo =>sampleInfo["id"]==selectedId);
//         console.log(selectedMeta[0]); // validate the selected metadata
//         // output the Demographic Info to DOM
//         selectedMeta.forEach(demoInfo=> {
//             Object.entries(demoInfo).forEach(([key,value])=> {
//                 d3.select("#sample-metadata").append("p").append("strong").text(`${key}: ${value}`);
//             })
//         });
//         // select the sample otu data based on id
//         let selectedOtus=dataSamples['samples'].filter(otu => otu["id"]==selectedId);
//         // store id, value, and labels to an array
//         let otuIds=selectedOtus[0].otu_ids;
//         let sampleValues=selectedOtus[0].sample_values;
//         let otuLabels=selectedOtus[0].otu_labels;
//         let selectedList=otuIds.map((a,i)=>[a,sampleValues[i],otuLabels[i]]);
//         console.log(selectedList);
//         // get the top 10 OTUs 
//         sortedList=selectedList.sort((a,b)=>(b[1]-a[1])).slice(0,10);
//         console.log(sortedList); // validate the data
//         //create the horizontal bar chart
//         PlotBar(sortedList, selectedId);
//         //create bubble chart
//         PlotBubble (otuIds, sampleValues,selectedList, selectedId);  
//         //create the gauge chart(Bonus Part)
//         PlotGauge (selectedMeta[0].wfreq);
//         // create a pie chart based on top 10 OTUs
//         PlotPie (sortedList, selectedId);
//         // create a donut chart based on wash frequence
//         PlotDonut (selectedMeta[0].wfreq);
//     });
// };

// function PlotBar (sortedList, selectedId) {
//     var data = [{
//             type: 'bar',
//             x: sortedList.map(a=>a[1]).reverse(),
//             y: sortedList.map(a=>`OTU${a[0]} `).reverse(),
//             text: sortedList.map(a=>a[2]).reverse(),
//             marker: {
//                 color: 'e5f9f8',
//                 line: {width: 0.5}
//             },
//             orientation: 'h'
//         }];
//     var layout = {
//             title: `top 10 OTUs in test subject ${selectedId}`,
//             xaxis: {title: 'OTU Values'},
//             font: {size: 12},
//             showlegend: false
//         };
//     Plotly.newPlot('bar', data, layout);
// };



// function PlotGauge (inNum) {
//   var trace2={
//         value: inNum,
//         title: { text: "Scrubs per Week" },
//         type: "indicator",
//         gauge: {
//             axis: { range: [null, 9] },
//             bar: { color: "#fff" },
//             steps: [{ range: [0,1], color: '#ff9f1c'},
//                     { range: [1,2], color: '#ffaf43'},
//                     { range: [2,3], color: '#ffbf69'},
//                     { range: [3,4], color: '#ffdfb4'},
//                     { range: [4,5], color: '#ffefda'},
//                     { range: [5,6], color: '#e5f9f8'},
//                     { range: [6,7], color: '#cbf3f0'},
//                     { range: [7,8], color: '#7ddcd3'},
//                     { range: [8,9], color: '#2ec4b6'}]
//         },
//         mode: "gauge+number"
//     };      
//     var layout = {
//             title: 'Belly Button Washing Frequency',
//             font: {size: 14}
//         };
//   Plotly.newPlot('gauge', [trace2] , layout);
// };

// function PlotPie (sortedList, selectedId){
//   var dataPie=[{
//           type:'pie',
//           marker: {
//             colors: ["ff9f1c","ffaf43","ffbf69","ffdfb4","ffefda","ffffff","e5f9f8","cbf3f0","7ddcd3","2ec4b6"]
//           },
//           values:sortedList.map(a=>a[1]),
//           labels:sortedList.map(a=>`OTU${a[0]} `)
//       }];
//   var layout = {
//           title: `top 10 OTUs in test subject ${selectedId}`,
//           font: {size: 12}
//       };
//   Plotly.newPlot('pie',dataPie,layout);
// };

// function PlotDonut(x) {
//   var data = [{
//     values: [1,1,1,1,1,1,1,1,1,9],
//     labels: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9','Scrubs per Week'],
//     marker: {colors: [ "#ff9f1c","#ffaf43","#ffbf69","#ffdfb4","#fff","e5f9f8","cbf3f0","7ddcd3","2ec4b6", "#ffffff"]},
//     direction: 'clockwise',
//     hole: .5,
//     textinfo:"label",
//     domain: {"x": [0,1]},
//     rotation:90,
//     textposition: 'inside',
//     type: 'pie'
//   }];
//   var layout = {
//     title: 'Belly Button Washing Frequency',
//     annotations: [
//           {
//               showarrow: true,
//               arrowside: 'start',
//               arrowcolor: '#f00',
//               startarrowhead:3,
//               arrowwidth:4,
//               x: 0.5,
//               y: 0.5,
//               ax: Math.cos(Math.PI*(9-x)/9)*70,
//               ay: -Math.sin(Math.PI*(9-x)/9)*70
//           },
//       ],
//     showlegend: false,
//     xaxis:{zeroline: false}
//   };
  
//   Plotly.newPlot('donut', data, layout);
// };