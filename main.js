d3.dsv(',','data.csv',function(d){
    return {
        state: d.State,
        total: +d.Total
    };
}).then(function(data) {
    d3.json("us_states_hexgrid.geojson.json").then(function (states) {
        console.log(data);
        var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        // console.log("w: "+width+" h: "+height);

        var svg = d3.select("body")
            .append("svg")
        svg.attr("viewBox", "10 10 " + 800 + " " +400)
            .attr("preserveAspectRatio", "xMinYMin");

        var map = svg.append("g")
            .attr("class", "map");

        // geoMercator projection
        var projection = d3.geoMercator()
            .scale(350)
            .translate([width/1.5, height / 1.5]);

        // geoPath projection
        var path = d3.geoPath().projection(projection);

        // Create array from data values we are using
        var totalCases = {};
        var stateNames = {};
        var minVal = data[0].total;
        var maxVal = data[0].total;
        var i = 0;
        data.forEach(function (d) {
            var t = +d.total;
            totalCases[i] = {
                total: t,
            }
            if (t > maxVal)
                maxVal = t;
            if (t < minVal)
                minVal = t;
            stateNames[i] = {
                state: d.state,
            }
            i++;
        });
        console.log(minVal+" "+maxVal);

        // Takes state name and returns the total cases for that state from the csv
        function getTotalCases(d) {
            for (i = 0; i < data.length; i++) {
                if (stateNames[i].state == d)
                    return totalCases[i].total;
            }
            return null;
        };

        //colors for population metrics
        var color = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range(["#a972e0", "#781008"]);
         // // Create Map
        map.append("g")
            .selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("name", function (d) {
                return data.State;
            })
            .attr("id", function (d) {
                return d.id;
            })
            .attr("d", path)
            .style("fill", function (d) {
                var val = -1;
                for (var i = 0; i < data.length; i++) {
                    if (d.properties.googleName.includes(data[i].state)) {
                        d.properties.googleName = data[i].state;
                        val = data[i].total;
                    }
                }
                return color(val);
            })
            // Interactive tooltip
            .on('mouseover', function (d) {
                d3.select(this)
                    .style("stroke", "white")
                    .style("stroke-width", 2)
                d3.select(".state")
                    .text(d.properties.googleName);

                d3.select(".totalCases")
                    .text("Total Cases: " + getTotalCases(d.properties.googleName) || "¯\\_(ツ)_/¯");
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .style("stroke-width", 1);
                d3.select(".state")
                    .text("Covid-19 Total Cases Per State");

                d3.select(".totalCases")
                    .text("As of 12/6/2020");
                });

         // Add the labels
        map.append("g")
            .selectAll("labels")
            .data(states.features)
            .enter()
            .append("text")
            .attr("x", function (d) {
                return path.centroid(d)[0]
            })
            .attr("y", function (d) {
                return path.centroid(d)[1]
            })
            .text(function (d) {
                return d.properties.iso3166_2
            })
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .attr("alignment-baseline", "central")
            .style("font-size", 11)
            .style("fill", "white")
    });
});
