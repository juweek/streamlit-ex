const exceptions = ["UAE", "SAR"];
let cohortData;

/*
------------------------
METHOD: turn whole numbers into single point decimal ones
------------------------
*/
function formatNumber(input) {
    let n = parseFloat(input); // Convert string to float number
  
    // Check if conversion was successful and it's an integer
    if (!isNaN(n) && Number.isInteger(n)) {
      return n + ".0";
    }
    return input; // If the input wasn't a valid number or wasn't an integer, return the original input
  }
  
  
  /*
  ------------------------
  METHOD: create the table that shows the country data
  ------------------------
  */
  function createCountryDivs(data) {
    //remove the existing divs except the first one
    var tableData = document.getElementById('tableContent'); // Changed from 'datavizCopy' to 'tableContent'
    while (tableData.children.length > 1) {
      tableData.removeChild(tableData.lastChild);
    }
    var benchmarkIndex = data.findIndex(d => d.Benchmark == 1);  // Find the first benchmark country
    data.forEach(function(d, index) {
      var div = document.createElement("div");
      //give the div a class of 'country'
      if (index == benchmarkIndex) {
        var blankDiv = document.createElement("div");
        blankDiv.style.height = "18px";  // Adjust this to your needs
        blankDiv.style.borderTop = '1px solid black';
        blankDiv.style.borderBottom = '2px solid black';
        var textPara = document.createElement("p");
        textPara.textContent = "Benchmarking Participants";
        textPara.style.margin = 0;
        textPara.style.font = "bold 14px PT Sans";
        blankDiv.appendChild(textPara);
        tableData.appendChild(blankDiv);
      }
  
      div.classList.add("tableCountry");
  
      //if the data has d.intermediate, fill in the following inner html
      if (d.intermediate) {
        div.innerHTML =
          `<p><sup>${d.prefix} </sup>${d.Country}</p>
          <p>${d.advanced ? Math.round(d.advanced) : ''} ${d.advanced_se ? '(' + formatNumber(d.advanced_se) + ')' : ''}</p>
          <p>${d.high ? Math.round(d.high) : ''} ${d.high_se ? '(' + formatNumber(d.high_se) + ')' : ''}</p>
          <p>${d.intermediate ? Math.round(d.intermediate) : ''} ${d.intermediate_se ? '(' + formatNumber(d.intermediate_se) + ')' : ''}</p>
          <p>${d.low ? Math.round(d.low) : ''} ${d.low_se ? '(' + formatNumber(d.low_se) + ')' : ''}</p>`;
      }
      else {
        div.innerHTML =
          `<p><sup>${d.prefix} </sup>${d.Country}</p>
          <p>${d.average} (${d.standardError})</p>
          <p>${d.fifth_percentile}</p>
          <p>${d.twentyfitfh_percentile}</p>
          <p>${d.ninetyfifth_lower} - ${d.ninetyfifth_higher}</p>
          <p>${d.seventyfifth}</p>
          <p>${d.ninteyfifth}</p>
          `
      }
  
      tableData.appendChild(div);
    })
  }
  
  
  /*
  ------------------------
  METHOD: add the button handler to the side panel button
  ------------------------
  */
  function sidePanelButtonHandler(sidePanelButton, sidePanel) {
    let sidePanelHolder = document.getElementById(sidePanelButton);
    let datavizCopy = document.getElementById(sidePanel);
    let isVisible = false;
  
    sidePanelHolder.addEventListener("click", function() {
      if (isVisible) {
        datavizCopy.style.left = "0%";
        datavizCopy.style.opacity = 0;
        datavizCopy.style.pointerEvents = "none"; // disable pointer events
        isVisible = false;
        //change text of the button to "Show Data"
        sidePanelHolder.innerHTML = "Show Numerical Results";
        //change the x-axis opacity to 0
        d3.select("#xAxisDiv")
          .classed("hiddenXAxis", false)
      } else {
        datavizCopy.style.left = "0%";
        datavizCopy.style.opacity = 1;
        datavizCopy.style.pointerEvents = "auto"; // enable pointer events
        isVisible = true;
        sidePanelHolder.innerHTML = "Hide Numerical Results";
        d3.select("#xAxisDiv")
          .classed("hiddenXAxis", true)
      }
    });
  }

  
/*
  ------------------------
  METHOD: function to turn strings into title case
  ------------------------
  */
function toTitleCase(str) {
    let words = str.split(' ');
  
    for(let i = 0; i < words.length; i++) {
      if (words[i].startsWith('(') && words[i].endsWith(')')) {
        let subWords = words[i].slice(1, -1).split(' ');
        for (let j = 0; j < subWords.length; j++) {
          subWords[j] = subWords[j][0].toUpperCase() + subWords[j].substr(1).toLowerCase();
        }
        words[i] = '(' + subWords.join(' ') + ')';
      } else if (!exceptions.includes(words[i].toUpperCase())) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
      } else {
        words[i] = words[i].toUpperCase();
      }
    }
  
    return words.join(' ');
  }
  
  /*
  ------------------------
  METHOD: show all of the clicked buttons in a div. Have data be the master data where you check your data against, and currentlySelectedCountries is the abbreviated data that fits in with the rest of the filters
  ------------------------
  */
  function showClicked(currentlySelectedCountries, data) {
    //clear out the current Search Bar results and populate it with the currentSelectedCountries.
    d3.select("#searchBarResults").selectAll("*").remove();
    d3.select("#searchBarResults")
      .selectAll("div")
      .data(currentlySelectedCountries)
      .enter()
      .append("div")
      .attr("id", function(d) {
        return "selectedCountry" + d;
      })
      .attr("class", "selectedCountry")
      .text(function(d) {
        return d;
      })
  
    //if currentlSelectedCountries is empty, hide the divs
    if (currentlySelectedCountries.length != 0) {
      //add a button at the end of the group that erases all of the selections
      d3.select("#searchBarResults")
        .append("div")
        .attr("id", "clearSelections")
        .text("RESET")
    }
  
    //attach a click event to the clear selections button
    d3.select("#clearSelections")
    .on("click", function() {
      //clear out the current Search Bar results and populate it with the currentSelectedCountries.
      d3.selectAll('.chart').style('display', 'flex');
      d3.select("#searchBarResults").selectAll("*").remove();
      d3.selectAll('.chart').classed('low-opacity', false);
      d3.selectAll('.chart').classed('presentOnSearch', false);
      d3.selectAll('.resultButton').classed('resultButtonSelected', false);
      
      // Reset the cohort selector dropdown
      d3.select("#cohortSelector").property("value", "");
      
      // Bring focus back to search bar section
      toggleGroups('searchSortGroup');
      
      d3.select("#clearSelections").remove();
      d3.select('.dropdownMenu').dispatch('change');
      
      // Redraw the chart with all data
      createChart(svg, data);
      globalDataSet = data;
      currentlySelectedCountriesDataset = data;
      currentClickedButtons = [];
  
      // Reset the search input
      document.querySelector('#searchBarSelector').value = '';
    });
  }
  
  /*
  ------------------------
  METHOD: create the results for the searchbar menu and handle w hen a button is clicked
  ------------------------
  */
  function createSearchResults(data, searchValue, countriesList, searchBarResultsDiv) {
    //loop through the data and create a new array that only has the countries with the searchValue in them
    const countriesFromSearch = countriesList.filter(result => result.includes(searchValue.toLowerCase()));
    let html = '';
  
    //if the search inputValue is empty, then don't show the results and instead show 'no results'
    if (searchValue === '') {
      searchBarResultsDiv.innerHTML = '';
      return;
    }
    else if (countriesFromSearch == '') {
      searchBarResultsDiv.innerHTML = 'No results';
      return;
    }
    else {
      //sort through countriesFromSearch so the ones that start with the searchValue are at the top
      //change string to titleCase and create a new button for each matching result
      countriesFromSearch.sort((a, b) => {
        // Convert both strings to lower case
        let lowerA = a.toLowerCase();
        let lowerB = b.toLowerCase();
        let lowerSearchValue = searchValue.toLowerCase();
  
        // Check if a and b starts with the searchValue
        let aStartsWithSearchValue = lowerA.startsWith(lowerSearchValue);
        let bStartsWithSearchValue = lowerB.startsWith(lowerSearchValue);
  
        // If both a and b starts with searchValue, or neither do, sort alphabetically
        if (aStartsWithSearchValue === bStartsWithSearchValue) {
          return lowerA.localeCompare(lowerB);
        }
  
        // If a starts with searchValue, it should come first
        if (aStartsWithSearchValue) {
          return -1;
        }
  
        // If b starts with searchValue, it should come first
        if (bStartsWithSearchValue) {
          return 1;
        }
      });
  
      countriesFromSearch.forEach(result => {
        html += `<button class="resultButton" id="${toTitleCase(result)}" data-countryName="${toTitleCase(result)}">${toTitleCase(result)}</button>`;
      });
  
      // Update the searchResultsDiv with the new buttons in the html. create variables for the new HTML and the new button list
      searchBarResultsDiv.innerHTML = html;
      let selectedCountriesDiv = document.querySelectorAll('.selectedCountry');
      let currentCountriesInSearchResults = document.querySelectorAll('.resultButton');
  
      //for every button in searchBarResults, mark it gray if it already appears selected
      for (let i = 0; i < selectedCountriesDiv.length; i++) {
        let currentButtonID = selectedCountriesDiv[i].id.replace('selectedCountry', '');
        for (let j = 0; j < currentCountriesInSearchResults.length; j++) {
          if (currentButtonID == currentCountriesInSearchResults[j].id) {
            currentCountriesInSearchResults[j].classList.add('resultButtonSelected');
          }
        }
      }
    }
  }

  
/*
------------------------
METHOD: load in the images with Promises; this is best standard
------------------------
*/
function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  
  /*
  ------------------------
  METHOD: serialized the svg into data to put into png
  ------------------------
  */
  function convertSvgToDataURL(svg) {
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    return URL.createObjectURL(svgBlob);
  }
  
  
  /*
  ------------------------
  METHOD: take the svgs you fetched and put them onto a canvas; this will be what you serialize and put in png
  ------------------------
  */
  function drawOntoCanvas(images, padding, fontSize, KEY_WIDTH, KEY_HEIGHT) {
    const [mainImg, xAxisImg, keyImg] = images;
    const textMargin = 10;
    const keyMargin = 20; // space between graphTitle and key
  
    // Adjust canvas height to add space for the key and its margin
    const canvas = document.createElement("canvas");
    canvas.width = mainImg.width + 2 * padding;
    canvas.height = mainImg.height + xAxisImg.height + fontSize + textMargin + keyMargin + KEY_HEIGHT + 2 * padding;
  
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = "#000000";
    ctx.font = `${fontSize}px PT Sans`;
    const graphTitle = document.getElementById("graphTitle");
    const content = graphTitle.textContent.replace(/\s+/g, ' ').trim();
  
    let destinationX = (canvas.width - KEY_WIDTH) / 2;  // center the key on the canvas width
    let destinationY = fontSize + padding + textMargin + 10;  // place it right below the title
  
    ctx.fillText(content, padding, fontSize + padding);
  
    // Draw the key immediately below the title
    ctx.drawImage(keyImg, 0, 0, keyImg.width, keyImg.height, destinationX, destinationY, KEY_WIDTH, KEY_HEIGHT);
  
    // Adjust the y-coordinate of the main graph and xAxis to account for the key
    ctx.drawImage(mainImg, padding, fontSize + textMargin + padding + KEY_HEIGHT + keyMargin);
    ctx.drawImage(xAxisImg, padding, fontSize + textMargin + padding + KEY_HEIGHT + keyMargin + mainImg.height);
  
     // Draw the additional text at the bottom-center of the canvas
    const additionalTextFontSize = 15;  // Set your desired font size here
    ctx.font = `${additionalTextFontSize}px PT Sans`;  // Set the font size for the additional text
    const additionalText = "Downloaded from ";
    const additionalTextWidth = ctx.measureText(additionalText).width;
    const linkText = "https://pirls2021.org/results";
    const linkTextWidth = ctx.measureText(linkText).width;
    const yOffset = 10;  // Y offset to move the text up by 10 pixels
    ctx.fillStyle = "#000000";
    ctx.fillText(additionalText, (canvas.width - (additionalTextWidth + linkTextWidth)) / 2, canvas.height - padding - yOffset);
    ctx.fillStyle = "#0000FF";
    ctx.fillText(linkText, (canvas.width + additionalTextWidth - linkTextWidth) / 2, canvas.height - padding - yOffset);
  
  
    return canvas.toDataURL("image/png");
  }
  
  
  /*
  ------------------------
  METHOD: the function that combines all the steps. take in the html elements you want to print out, load them, serialize them, then draw them on the canvas
  ------------------------
  */
  function svgToJpegDownload(svgEl, filename, padding = 10) {
    const xAxisEl = document.querySelector("#xAxisDiv");
    const keyImgElementSrc = document.querySelector(".modalContent img").src;
  
    Promise.all([
      loadImage(convertSvgToDataURL(svgEl)),
      loadImage(convertSvgToDataURL(xAxisEl)),
      loadImage(keyImgElementSrc)
    ]).then(images => {
      const pngDataUrl = drawOntoCanvas(images, padding, 17, 600, 200);
  
      const downloadLink = document.createElement("a");
      downloadLink.href = pngDataUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }).catch(error => {
      console.error("Error loading images:", error);
    });
  }

  
/*
------------------------
METHOD: sort data to use after a dropdown is selected
------------------------
  */
function sortList(data, property, order) {
    // Sort the list of objects based on the specified property and sort order
    if (order !== 'asc' && order !== 'desc') {
      throw new Error('Invalid sort order. Must be "asc" or "desc"');
    }
    //detect if data is an object)
    if (data[0] == undefined) {
      // Assume inputObject is the object in Form A
      const outputArray = [];
      for (const country in data) {
        const currentData = data[country];
        const countryData = {};
        for (const item of currentData) {
          countryData[item.time] = item.Average;
        }
        countryData['Country'] = country;
        outputArray.push(countryData);
      }
      data = outputArray;
    }
  
    const sortedList = data.sort((a, b) => {
      // special case for 'Country' property
      if (property === 'Country') {
        if (order === 'asc') {
          return a[property].localeCompare(b[property]);
        } else {
          return b[property].localeCompare(a[property]);
        }
      }
  
      // for other properties, convert string to number and compare
      const aValue = Number(a[property]);
      const bValue = Number(b[property]);
  
      if (order == 'asc') {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      }
  
      if (order == 'desc') {
        if (aValue < bValue) return 1;
        if (aValue > bValue) return -1;
        return 0;
      }
    });
  
  
    return sortedList;
  }
  
  
  /*
   ------------------------
   METHOD: get the position of the line based on order
   */
  function getLastBenchmarkYPosition(data, yScale) {
    // Initialize benchmarkY to 0
    var benchmarkY = 0;
    var countryName = '';
    var countryPosition = 0;
  
    for (var i = 0; i < data.length; i++) {
      // If the current country is a benchmark, update benchmarkY
      if (data[i].Benchmark == 1) {
        benchmarkY = yScale(data[i].Country);
        countryName = data[i].Country;
        countryPosition = i;
        break;
      }
    }
    // Return the y position of the benchmark line
    return benchmarkY;
  }
  
  
  /*
  ------------------------
  METHOD: add the button handler to the side panel button
  ------------------------
  */
  function sortDropdownHandler(orderDropdown, globalDataSet) {
    var sortDropdown = d3.select("#sortDropdown");
    let value = sortDropdown.property("value")
    let newData = []
    console.log(value)
    console.log(orderDropdown.property("value"))
    console.log(globalDataSet)
    console.log('----------------')
    //first, check if the orderDropdown is set to asc or desc, then call the sort function you created above
    if (orderDropdown.property("value") === "asc") {
      newData = sortList(globalDataSet, value, "asc")
    } else {
      newData = sortList(globalDataSet, value, "desc")
    }
    return newData;
  }

/*
------------------------
METHOD: set the dimensions of the graph
------------------------
*/
var margin = { top: 10, right: 40, bottom: 0, left: 225 },
  width = 640 - margin.left - margin.right,
  height = 1320 - margin.top - margin.bottom;

  let currentlySelectedCountriesDataset = [];

/*
------------------------
METHOD: append the svg to the body
------------------------
  */
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

//select xAxisDiv element from the html page
var xAxisDiv = d3.select("#xAxisDiv");

/*
------------------------
METHOD: //select all the dropdowns 
------------------------
*/
var sortDropdown = d3.select("#sortDropdown");
var orderDropdown = d3.select("#orderDropdown");

/*
------------------------
METHOD: //detect the current browser you're using
------------------------
*/
if (navigator.userAgent.includes('Windows')) {
  document.body.classList.add('windows-os');
}

/*
------------------------
METHOD: Function to calculate similarity between two countries
------------------------
*/
function calculateSimilarity(country1, country2, percentileRange) {
  let diff;
  switch(percentileRange) {
    case "5th Percentile":
      diff = Math.abs(parseFloat(country1.fifth_percentile) - parseFloat(country2.fifth_percentile));
      break;
    case "25th Percentile":
      diff = Math.abs(parseFloat(country1.twentyfitfh_percentile) - parseFloat(country2.twentyfitfh_percentile));
      break;
    case "75th Percentile":
      diff = Math.abs(parseFloat(country1.seventyfifth) - parseFloat(country2.seventyfifth));
      break;
    case "95th Percentile":
      diff = Math.abs(parseFloat(country1.ninteyfifth) - parseFloat(country2.ninteyfifth));
      break;
    case "95% Confidence Interval for Average":
      const avgDiff = Math.abs(parseFloat(country1.average) - parseFloat(country2.average));
      const seDiff = Math.abs(parseFloat(country1.standardError) - parseFloat(country2.standardError));
      diff = avgDiff + seDiff * 2;
      break;
    default:
      // Default to average if percentile range is not recognized
      diff = Math.abs(parseFloat(country1.average) - parseFloat(country2.average));
  }
  return diff;
}

/*
------------------------
METHOD: Function to find cohorts from the CSV data
------------------------
*/
function findCohorts(selectedCountry, allData) {
  const country = allData.find(c => c.Country === selectedCountry.Country);
  if (!country || !country.similarCountries) {
    return [];
  }
  
  const cohortNames = country.similarCountries.split(';').map(c => c.trim());
  return cohortNames.map(name => allData.find(c => c.Country === name)).filter(Boolean);
}

/*
------------------------
METHOD: create the d3 chart. set the y axis to the countries
------------------------
*/
function createChart(svg, data) {

  //clear out the svg,  set the height relative to the length of the data
  var width = svg.attr("width")
  var height = data.length * 25;
  svg.selectAll("*").remove();
  // Select the SVG under #my_dataviz and set its height

  //change the height of the svg to the height of the data. IS THIS IMPOSSIBLE
  d3.select("#my_dataviz").style("height", (height + 20) + "px");
  d3.select("#my_dataviz svg").attr("height", height + 20);
  //svg.attr("height", height);

  //call the sortList function to sort the data
  var sortedData = sortList(data, "Benchmark", 'asc');

  // Remove the current x-axis element
  svg.select("#xAxis").remove();
  xAxisDiv.select("#xAxis2").remove();

  // Create a new x-axis element
  var x = d3.scaleLinear()
    .domain([50, 850])
    .range([0, width - 225]);

  // Append the second x-axis to the div element with id "xAxisDiv". make sure it matches the x and y of the first x-axis
  var xAxis2 = d3.axisBottom(x);

  let gX = xAxisDiv.append("g")
    .attr("id", "xAxis2")
    .attr("transform", "translate(" + 225 + ",0)")
    .call(xAxis2);

  // Select all text within the xAxis2 and adjust their position
  gX.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "1em")
    .attr("dy", "1em")
    .attr("font-family", "PT Sans")
    .attr("font-size", "11.5px")


  var graphData = [...data];  // Start with a copy of your original data
  var benchmarkIndex = data.findIndex(d => d.Benchmark == 1);  // Find the first benchmark country
  if (benchmarkIndex !== -1) {
    graphData.splice(benchmarkIndex, 0, { Country: "Benchmarking Participants" });  // Insert the placeholder at the correct position
  }

  // Y axis
  var padding = 10;  // Adjust this value to your needs
  var y = d3.scaleBand()
    .range([-20, height + 10])
    .domain(graphData.map(function(d) { return d.Country; }))
    .padding(1);

  svg.append("g")
    .attr("id", "yAxis")
    .call(d3.axisLeft(y).tickValues(y.domain().filter(function(d) { return d !== "Benchmarking Participants"; })))
    .selectAll("text")
    .each(function(d, i) { // Notice the 'i' for index
      var matchingObject = data.find(function(obj) {
        return obj.Country === d;
      });

      var fillColor = "black";  // default fill

      var rectHeight = 20;  // Our fixed height
      var gap = 0;  // Gap between bars, adjust to your needs

      // Draw rectangles before adding text. This will ensure that the rectangle appears behind the text.
      d3.select(this.parentNode)
        .insert("rect", "text")
        .attr("x", '-250px')
        .attr("y", -10) // Setting y based on index
        .attr("height", rectHeight + "px")
        .attr("width", '250px')
        .attr('class', 'yaxistextbar')
        .attr("fill", fillColor === "white")
        .attr("opacity", 0.2);  // Lower the opacity

      // This refers to the SVG text element just created
      var text = d3.select(this);
      text.text(""); // clear existing text

      if (matchingObject && matchingObject.prefix && matchingObject.prefix.trim() !== '') {
        // Append a tspan for the main text
        var mainText = text.append('tspan')
          .text(d);

        // Append a tspan for the prefix with different style
        var prefixText = text.append('tspan')
          .attr('dy', '-0.3em') // Adjusts the vertical position of the prefix
          .attr('font-size', '0.7em') // Makes the prefix smaller
          .style("font-family", "PT Sans")
          .text(matchingObject.prefix);

        // Wait until next tick to calculate the lengths
        setTimeout(function() {
          // Get the length of the main text
          var mainTextLength = mainText.node().getComputedTextLength();

          // Get the length of the prefix
          var prefixTextLength = prefixText.node().getComputedTextLength();

          // Positions the prefix before the main text, considering the lengths of both texts
          prefixText.attr('x', (-mainTextLength - prefixTextLength) - (padding / 1.5));
        });
      } else {
        // If there's no prefix, just append the text as normal
        text.text(d);
      }
    })
    .style("text-anchor", "end")
    .attr('class', 'yAxisText')
    .style("font-family", "PT Sans")
    .style('font-weight', "normal")
    .style("fill", "black");

  //create a loop that creates a vertical zebra background for the chart that alternates between grey and white every 10 points on the x axis
  var zebra = 0;
  for (var i = 100; i < 900; i++) {
    svg.append("rect")
      .attr("x", x(i))
      .attr("y", 0)
      .attr("width", x(i + 100) - x(i))
      .attr("height", height)
      .attr("fill", function() {
        if (zebra == 0) {
          zebra = 1;
          return "#f1f7fd";
        } else {
          zebra = 0;
          return "#ffffff";
        }
      });
    i = i + 99;
  }

    /*
  ------------------------
 // Add this new code for background rectangles
  ------------------------
  */
  svg.selectAll("rect.background")
     .data(graphData)
     .enter()
     .append("rect")
     .attr("class", "background")
     .attr("x", 0)
     .attr("y", function(d) { 
      return (y(d.Country) - y.bandwidth()/2 - 10); 
    })
     .attr("width", width)
     .attr("height", 20)
     .attr("fill", function(d) {
      return d.Country === "TIMSS 2023 International Average" ? "#d6e4ec" : "transparent";
    });

  /*
  ------------------------
  METHOD: draw the first rectangle used to show the 5th and 25th%. outer red. 
  ------------------------
  */
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("rect")
    //the x will be the start of the rectangle
    .attr("x", function(d) {
      return x(d.fifth_percentile);
    })
    .attr("y", function(d) { return y(d.Country) - 3; })
    //the width will be the total distribution of scores
    .attr("class", "barRect")
    .attr("data-percentile-range", "5th Percentile")
    .attr("data-percentile-value", function(d) {
      return d.fifth_percentile
    })
    .attr("width", function(d) {
      let fifth = x(d.fifth_percentile)
      let nintey_fifth = x(d.twentyfitfh_percentile)
      return (nintey_fifth - fifth)
    })
    .attr("height", 8)
    .attr("z-index", 1)
    .attr("stroke", "black")
    .attr("stroke-width", 1)  // add initial stroke width
    .style("fill", "#3A83BD")

  /*
------------------------
METHOD: draw the second rectangle used to show the 25th to confidence lever lower bound
------------------------
*/
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.twentyfitfh_percentile); })
    .attr("y", function(d) { return y(d.Country) - 3; })
    .attr("class", "barRect")
    .attr("data-percentile-range", "25th Percentile")
    .attr("data-percentile-value", function(d) {
      return d.twentyfitfh_percentile
    })
    .attr("width", function(d) {
      let twentyFifth = x(d.twentyfitfh_percentile)
      let seventy_fifth = x(d.ninetyfifth_lower)
      return (seventy_fifth - twentyFifth)
    })
    .attr("height", 8)
    .attr("z-index", 2)
    .attr("stroke", "black")
    .style("fill", "#BFBFBF")

  /*
  ------------------------
  METHOD: draw the third rectangle used to show the lower and upper bounds of confidence loever
  ------------------------
  */
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.ninetyfifth_lower); })
    .attr("y", function(d) { return y(d.Country) - 3; })
    .attr("class", "barRect")
    .attr("data-percentile-range", "95% Confidence Interval for Average")
    .attr("data-percentile-value", function(d) {
      return `${d.ninetyfifth_lower} - ${d.ninetyfifth_higher}`
    })
    .attr("width", function(d) {
      let twentyFifth = x(d.ninetyfifth_lower)
      let seventy_fifth = x(d.ninetyfifth_higher)
      return (seventy_fifth - twentyFifth)
    })
    .attr("height", 8)
    .attr("z-index", 2)
    .attr("stroke", "black")
    .style("fill", "#333")

  /*
  ------------------------
  METHOD: draw the fourth rectangle used to show the upper bound of cnfidence level to 75th
  ------------------------
  */
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.ninetyfifth_higher); })
    .attr("y", function(d) { return y(d.Country) - 3; })
    .attr("class", "barRect")
    .attr("data-percentile-range", "75th Percentile")
    .attr("data-percentile-value", function(d) {
      return d.seventyfifth
    })
    .attr("width", function(d) {
      let twentyFifth = x(d.ninetyfifth_higher)
      let seventy_fifth = x(d.seventyfifth)
      return (seventy_fifth - twentyFifth)
    })
    .attr("height", 8)
    .attr("z-index", 2)
    .attr("stroke", "black")
    .style("fill", "#BFBFBF")

  /*
  ------------------------
  METHOD: draw the fifth rectangle used to show between 75% and 95th
  ------------------------
  */
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.seventyfifth); })
    .attr("y", function(d) { return y(d.Country) - 3; })
    .attr("class", "barRect")
    .attr("data-percentile-range", "95th Percentile")
    .attr("data-percentile-value", function(d) {
      return d.ninteyfifth
    })
    .attr("width", function(d) {
      let twentyFifth = x(d.seventyfifth)
      let seventy_fifth = x(d.ninteyfifth)
      return (seventy_fifth - twentyFifth)
    })
    .attr("height", 8)
    .attr("z-index", 2)
    .attr("stroke", "black")
    .style("fill", "#3A83BD")


  if (benchmarkIndex !== -1) {
    var benchmarkLineY = getLastBenchmarkYPosition(sortedData, y);

    // Append light gray rectangle
    svg.append("rect")
      .attr("x", 1)
      .attr("y", benchmarkLineY - 27)
      .attr("width", width)
      .attr("height", 23 - 5) // the difference between y values of your lines
      .style("fill", "lightgray");  // use any light gray 

    // Append bottom benchmark line
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", benchmarkLineY - 9)
      .attr("x2", width)
      .attr("y2", benchmarkLineY - 9)
      .style("stroke", "black") // change the color as per your requirement
      .style("stroke-width", 1.5);
    // Append top benchmark line
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", benchmarkLineY - 27)
      .attr("x2", width)
      .attr("y2", benchmarkLineY - 27)
      .style("stroke", "black") // change the color as per your requirement
      .style("stroke-width", 1.5);

    // Benchmark label - Place it where "Benchmarking Participants" is on the y scale
    svg.append("text")
      .attr("x", 5)
      .attr("y", benchmarkLineY - 14)  // Adjust this value to your needs
      .text("Benchmarking Participants")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style('font-family', 'PT Sans');
  }

  let dataChart = d3.select("#my_dataviz")

  dataChart.on("mouseleave", function() {
    //remove 'active' from all line elements
    let tooltip = d3.select("#tooltip");
    tooltip.style("display", "none");
  })

  svg.selectAll(".barRect")
  .on('mouseenter', function(d) {
    d3.select(this).attr('stroke-width', 3);
    let percentileRange = d3.select(this).attr("data-percentile-range");
    let percentileValue = d3.select(this).attr("data-percentile-value");
    let tooltip = d3.select("#tooltip");
    
    const cohorts = findCohorts(d, data);
        
    tooltip.style("display", "block")
      .html(`
        <h3>${d.Country}</h3>
        <p>${percentileRange}: ${percentileValue}</p>
        <p>Countries w/ similar scores:</p>
        <ul>
          ${cohorts.map(c => `<li>${c.Country}</li>`).join('')}
        </ul>
      `);

    tooltip.style("left", (d3.event.pageX + 10) + "px")
      .style("top", (d3.event.pageY - 80) + "px")
      .transition()
      .duration(200)
      .style("opacity", 1);

    svg.selectAll(".lineChartElement").classed("active", false);
    d3.select(event.target).classed("active", true);
  })
  .on('mouseleave', function(d) {
    d3.select(this).attr('stroke-width', 1);
    d3.select("#tooltip")
      .transition()
      .duration(200)
      .style("opacity", 0)
      .on("end", function() {
        d3.select(this).style("display", "none");
      });
  });
  createCountryDivs(data)
}

/*
------------------------
METHOD: create a smaller createMiniChart function 
------------------------
*/
function createMiniChart(data, selectedCountry, width, height) {
  const margin = { top: 10, right: 10, bottom: 20, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([50, 850])
    .range([0, innerWidth]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.Country))
    .range([0, innerHeight])
    .padding(0.1);

  // Zebra background
  var zebra = 0;
  for (var i = 100; i < 900; i += 100) {
    g.append("rect")
      .attr("x", x(i))
      .attr("y", 0)
      .attr("width", x(i + 100) - x(i))
      .attr("height", innerHeight)
      .attr("fill", zebra % 2 === 0 ? "#f1f7fd" : "#ffffff");
    zebra++;
  }

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(5));

 // Y-axis with emphasized selected country
 g.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll(".tick text")
    .attr("fill", d => d === selectedCountry.Country ? "black" : "#999")
    .attr("font-weight", d => d === selectedCountry.Country ? "bold" : "normal");

  // Draw percentile rectangles
  const percentiles = ["fifth_percentile", "twentyfitfh_percentile", "ninetyfifth_lower", "ninetyfifth_higher", "seventyfifth", "ninteyfifth"];
  const colors = ["#3A83BD", "#BFBFBF", "#333", "#BFBFBF", "#3A83BD"];

  data.forEach(d => {
    const isSelected = d.Country === selectedCountry.Country;
    for (let i = 0; i < percentiles.length - 1; i++) {
      g.append("rect")
        .attr("x", x(d[percentiles[i]]))
        .attr("y", y(d.Country) + y.bandwidth() / 2 - 4)
        .attr("width", x(d[percentiles[i+1]]) - x(d[percentiles[i]]))
        .attr("height", 8)
        .attr("fill", colors[i])
        .attr("stroke", "black")
        .attr("stroke-width", isSelected ? 1 : 0.5)
        .style("opacity", isSelected ? 1 : 0.5);
    }
  });

  return svg.node();
}

/*
------------------------
METHOD: Set up event listeners on both divs to update the scroll position of the other when it's scrolled
------------------------
*/
var myDataviz = document.getElementById("my_dataviz");
var datavizCopy = document.getElementById("datavizCopy");

myDataviz.addEventListener("scroll", function() {
  datavizCopy.scrollTop = myDataviz.scrollTop;
});

datavizCopy.addEventListener("scroll", function() {
  myDataviz.scrollTop = datavizCopy.scrollTop;
});

/*
------------------------
METHOD: create a click event listener for datavizCopy that toggles the display of the div
------------------------
*/
sidePanelButtonHandler('sidePanelButton', 'datavizCopy')

/*g
------------------------
METHOD: create a click event listener for datavizCopy that prints out the graph
------------------------
*/
document.getElementById('downloadButton1').addEventListener('click', function() {
  const svgElement = document.querySelector('#my_dataviz svg');
  svgToJpegDownload(svgElement, 'TIMSS2023_Exhibit 1.1.png');
});

/*
------------------------
METHOD: read in the data and create the axes
------------------------
*/
d3.csv("./data/standardDeviation.csv", function(data) {
  var globalDataSet = [];
  globalDataSet = data



  // Add X axis
  var x = d3.scaleLinear()
    .domain([100, 850])
    .range([0, width]);
  var xAxis2 = d3.axisBottom(x);

  // Create the x-axis
  d3.select("#xAxisDiv")
    .append("g")
    .attr("id", "xAxis2")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis2)


  /*
  ------------------------
  METHOD: create the dropdowns that determine if we will sort asc or desc
  ------------------------
  */
  d3.selectAll(".dropdownMenu").on("change", function() {
    let newData = sortDropdownHandler(orderDropdown, globalDataSet)
    globalDataSet = newData
    createChart(svg, newData);
    createCountryDivs(newData);
  })


      /*
  ------------------------
  METHOD:    // Populate the cohort selector dropdown'
  ------------------------
  */
    var cohortSelector = d3.select("#cohortSelector");
    var sortedData = data.slice().sort((a, b) => a.Country.localeCompare(b.Country));
    // Populate the dropdown with sorted country options
    cohortSelector.selectAll("option.country")
      .data(sortedData)
      .enter()
      .append("option")
      .attr("class", "country")
      .attr("value", d => d.Country)
      .text(d => d.Country);


  /*
  ------------------------
  METHOD: populate the search input with the list of countries and called createSearchResulta whenever an input event is fired
  ------------------------
  */
  //push the lowercase version of the country into the array
  let countries = []
  data.forEach(country => {
    countries.push(country.Country.toLowerCase())
  })

  // Get references to the search input and the results dropdown
  const searchInput = document.querySelector('#searchBarSelector');
  const resultsDropdown = document.querySelector('#resultsSelector');
  let currentClickedButtons = [];

  // Add an event listener to the search input that filters the results whenever the input value changes
  searchInput.addEventListener('input', event => {
    const inputValue = event.target.value;
    createSearchResults(data, inputValue, countries, resultsDropdown);

    /*
    ------------------------
    SEARCH RESULTS BUTTONS: Select all buttons in the searchResults area. attach a click event listener to each button so, when clicked, it adds the country to the currentlySelectedCountries section, then redraws the chart
    ------------------------
    */
    const searchResultsButtons = d3.selectAll('.resultButton');
    searchResultsButtons.on('click', function() {
      currentlySelectedCountriesDataset = []
      let button = d3.select(this);

      currentClickedButtons.push(button._groups[0][0].textContent);
      button.classed("resultButtonSelected", true);

      // For each country in currentClickedButtons, go through the data array and find the entry where its Country property matches country
      currentClickedButtons.forEach(function(country) {
        let index = data.findIndex(d => d.Country === country);
        currentlySelectedCountriesDataset.push(data[index])
      })

      //call the function to filter the buttons that have been clicked, then call the createChart function
      showClicked(currentClickedButtons, data);

      //attach the click event to the clear selections button that will erase all the buttons. it's made during the showClicked function
      d3.select("#clearSelections")
        .on("click", function() {
          //remove the buttons from the div
          d3.select("#searchBarResults").selectAll("*").remove();
          createChart(svg, data);
          globalDataSet = data;
          currentlySelectedCountriesDataset = data;
          currentClickedButtons = [];
          d3.select("#cohortSelector").property("value", "");
          d3.selectAll('.resultButton').classed('resultButtonSelected', false);
          d3.select('.dropdownMenu').dispatch('change');
        })
      createChart(svg, currentlySelectedCountriesDataset);
      globalDataSet = currentlySelectedCountriesDataset;
      d3.select('.dropdownMenu').dispatch('change');
      /*
       ------------------------
       SELECTED COUNTRIES BUTTONS: Select all buttons in the selectedCountries area. attach a click event listener to each button so, when clicked, it removes the country from the currentlySelectedCountries section, then redraws the chart
       ------------------------
       */
      const selectedResultsButtons = d3.selectAll('.selectedCountry');
      selectedResultsButtons.on('click', function() {

        //get the name of the current button clicked
        let currentCountryButton = d3.select(this);
        let currentCountryButtonName = currentCountryButton._groups[0][0].textContent;

        // Remove the currently selected country from the currentClickedButtons list
        let index = currentClickedButtons.indexOf(currentCountryButtonName);
        if (index > -1) {
          currentClickedButtons.splice(index, 1);
        }

        //Remove the country that was clicked from the currentlySelectedCountriesDataset 
        currentlySelectedCountriesDataset = [];
        currentClickedButtons.forEach(function(country) {
          let index = data.findIndex(d => d.Country === country);
          currentlySelectedCountriesDataset.push(data[index]);
        })

        //Remove the currently selected country from the currentlySelectedCountries section
        const selectedElements = document.querySelectorAll('.selectedCountry');
        selectedElements.forEach(element => {
          if (element.id.includes(currentCountryButtonName)) {
            element.remove();
          }
        });

        //remove '.resultButtonSelected' class from the button in the results div'
        let searchBarResults = document.querySelectorAll('.resultButton');
        for (let i = 0; i < searchBarResults.length; i++) {
          if (searchBarResults[i].id == currentCountryButtonName) {
            searchBarResults[i].classList.remove('resultButtonSelected');
          }
        }

        //if currentlySelectedCountries is empty, redraw createChart with the data from the data array
        if (currentlySelectedCountriesDataset.length != 0) {
          createChart(svg, currentlySelectedCountriesDataset);
          globalDataSet = currentlySelectedCountriesDataset;
          d3.select('.dropdownMenu').dispatch('change');
        } else {
          d3.select("#clearSelections").remove()
          createChart(svg, data);
          globalDataSet = data;
          d3.select('.dropdownMenu').dispatch('change');
        }
      })
    })
  })

  /*
------------------------
CLICK EVENT TO CLOSE SEARCH RESULTS: Listen for clicks on the entire document
------------------------
*/
  let ignoreNextDocumentClick = false;

  // Existing code for the 'focus' event on searchInput
  searchInput.addEventListener('focus', function() {
    resultsDropdown.style.display = 'block'; // Adjust as per your CSS
    ignoreNextDocumentClick = true;  // Set the flag
  });

  // Existing code for the 'click' event on document
  document.addEventListener('click', function(event) {
    if (ignoreNextDocumentClick) { // If the flag is set, do not hide the dropdown
      ignoreNextDocumentClick = false; // Reset the flag
      return;
    }

    const isClickInsideSearchBar = searchInput.contains(event.target);
    const isClickInsideResults = resultsDropdown.contains(event.target);
    const isResultButton = event.target.classList.contains('selectedCountry');

    // If clicked outside search bar, resultsDropdown, or a resultButton, hide the dropdown
    if (!isClickInsideSearchBar && !isClickInsideResults && !isResultButton) {
      resultsDropdown.style.display = 'none';
    }
  });

   // Function to toggle activation of groups
   function toggleGroups(activeGroupId) {
    const groups = ['searchSortGroup', 'cohortGroup'];
    groups.forEach(groupId => {
      const group = document.getElementById(groupId);
      if (groupId === activeGroupId) {
        group.classList.remove('deactivated');
      } else {
        group.classList.add('deactivated');
      }
    });
  }

// Event listeners for search and sort group
document.getElementById('searchBarSelector').addEventListener('focus', () => toggleGroups('searchSortGroup'));
document.getElementById('sortDropdown').addEventListener('focus', () => toggleGroups('searchSortGroup'));
document.getElementById('orderDropdown').addEventListener('focus', () => toggleGroups('searchSortGroup'));

// Event listeners for group containers
document.getElementById('searchSortGroup').addEventListener('click', () => toggleGroups('searchSortGroup'));
document.getElementById('cohortGroup').addEventListener('click', () => toggleGroups('cohortGroup'));

// Prevent toggling when clicking on form elements
const formElements = document.querySelectorAll('input, select');
formElements.forEach(element => {
  element.addEventListener('click', (event) => {
    event.stopPropagation();
  });
});


// Event listener for cohort group
document.getElementById('cohortSelector').addEventListener('focus', () => toggleGroups('cohortGroup'));
document.getElementById('cohortText').addEventListener('click', () => {
  toggleGroups('cohortGroup');
  document.getElementById('cohortSelector').focus();
});

// Initial state: activate search and sort group
toggleGroups('searchSortGroup');

  /*
  ------------------------
  METHOD: create a new ui based off of the cohort buttons
  ------------------------
  */
  d3.select("#cohortSelector").on("change", function() {
    let selectedCountry = this.value;
    if (!selectedCountry) return; // Do nothing if no country is selected
  
    currentlySelectedCountriesDataset = [];
    currentClickedButtons = [];
  
    // Add the selected country to the dataset
    let index = data.findIndex(d => d.Country === selectedCountry);
    if (index !== -1) {
      currentlySelectedCountriesDataset.push(data[index]);
      currentClickedButtons.push(selectedCountry);
    }
  
   // Find cohorts for the selected country
    let countryData = data[index];
    let cohorts = findCohorts(countryData, data); // Removed .slice(0, 3)
    
    cohorts.forEach(cohort => {
      if (cohort.Country !== selectedCountry) {
        currentClickedButtons.push(cohort.Country);
        currentlySelectedCountriesDataset.push(cohort);
      }
    });
  
    
  // Update UI
  showClicked(currentClickedButtons, data);

  // Redraw chart
  createChart(svg, currentlySelectedCountriesDataset);
  globalDataSet = currentlySelectedCountriesDataset;
  d3.select('.dropdownMenu').dispatch('change');

  d3.select("#clearSelections")
  .on("click", function() {
    d3.select("#searchBarResults").selectAll("*").remove();
    createChart(svg, data);
    globalDataSet = data;
    currentlySelectedCountriesDataset = data;
    currentClickedButtons = [];
    
    // Reset the cohort selector dropdown
    d3.select("#cohortSelector").property("value", "");
    
    // Bring focus back to search bar section
    toggleGroups('searchSortGroup');
    
    d3.selectAll('.resultButton').classed('resultButtonSelected', false);
    d3.select('.dropdownMenu').dispatch('change');
    
    // Reset the search input
    document.querySelector('#searchBarSelector').value = '';
  });


// Add the event handlers for .selectedCountry buttons here
const selectedResultsButtons = d3.selectAll('.selectedCountry');
selectedResultsButtons.on('click', function() {
  let currentCountryButton = d3.select(this);
  let currentCountryButtonName = currentCountryButton._groups[0][0].textContent;
  toggleGroups('searchSortGroup');


  let index = currentClickedButtons.indexOf(currentCountryButtonName);
  if (index > -1) {
    currentClickedButtons.splice(index, 1);
  }

  currentlySelectedCountriesDataset = [];
  currentClickedButtons.forEach(function(country) {
    let index = data.findIndex(d => d.Country === country);
    currentlySelectedCountriesDataset.push(data[index]);
  });

  const selectedElements = document.querySelectorAll('.selectedCountry');
  selectedElements.forEach(element => {
    if (element.id.includes(currentCountryButtonName)) {
      element.remove();
    }
  });

  let searchBarResults = document.querySelectorAll('.resultButton');
  for (let i = 0; i < searchBarResults.length; i++) {
    if (searchBarResults[i].id == currentCountryButtonName) {
      searchBarResults[i].classList.remove('resultButtonSelected');
    }
  }

  if (currentlySelectedCountriesDataset.length != 0) {
    createChart(svg, currentlySelectedCountriesDataset);
    globalDataSet = currentlySelectedCountriesDataset;
    d3.select('.dropdownMenu').dispatch('change');
  } else {
    d3.select("#clearSelections").remove()
    createChart(svg, data);
    globalDataSet = data;
    d3.select('.dropdownMenu').dispatch('change');
  }
});
    
    console.log("Cohort finding process completed");
});
  /*
  ------------------------
  METHOD: make width the half the size of the viewport width, until it gets down to mobile, where it should be 100% of the width
  ------------------------
  */
  function reportWindowSize() {
    if (window.innerWidth > 968) {
      width = 640;
      height = 1050;
    }
    else if (window.innerWidth > 728) {
      width = 520;
      height = 1050;
    }
    else {
      width = window.innerWidth - 60;
      height = 1050;
    }
    //set the new width and height of the svg, set the new width and height of the x-axis
    svg.attr("width", width)
    svg.attr("height", height);
    xAxisDiv.attr("width", width)
    xAxisDiv.attr("height", 50);
    createChart(svg, globalDataSet);
    createCountryDivs(globalDataSet);
  }

  window.onresize = reportWindowSize;
  //fire resize event on load
  reportWindowSize();
});