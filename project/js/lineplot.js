// lineplot.js
document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item1");  // Ensure this targets the right div
    
    // Set the margins and dimensions
    const margin = { top: 10, right: 60, bottom: 10, left: 60 };
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Clear any existing SVG
    d3.select(container).selectAll("*").remove();

    // Create the SVG container
    const svg = d3.select(container)
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Fetch data
    const dataUrl = "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_data.csv";
    fetch(dataUrl)
        .then(response => response.text())
        .then(csvString => {
            const data = d3.csvParse(csvString);
            
            // Parse the data
            data.forEach(d => {
                d.fatalities = +d.fatalities || 0;
                d.event_date = +d.event_date || 0;
                d.date = d3.timeParse("%Y-%m")(d.month_year);
            });

            // Set up the scales for axes
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width])
                .nice();

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => Math.max(d.fatalities, d.event_date)) * 1.1])
                .range([height, 0])
                .nice();

            // Add X and Y axes
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(12))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

            svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y));

            // Add Y axis label
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Count");

            // Define line generator
            const line = d3.line()
                .defined(d => !isNaN(d.fatalities))
                .x(d => x(d.date))
                .y(d => y(d.fatalities));

            // Append bars for event data
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.date) - 10)
                .attr("y", d => y(d.event_date))
                .attr("width", 20)
                .attr("height", d => height - y(d.event_date))
                .attr("fill", "steelblue")
                .attr("opacity", 0.7);

            // Append line path for fatalities
            svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2);

            // Add annotations (specific points on the line plot)
            svg.append("line")
                .attr("class", "annotation")
                .attr("x1", x(new Date("2021-10")))
                .attr("x2", x(new Date("2021-10")))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "red")
                .attr("stroke-width", 2);

            svg.append("text")
                .attr("x", x(new Date("2021-10")) + 5)
                .attr("y", 20)
                .text("Military coup")
                .style("fill", "red");

            svg.append("line")
                .attr("class", "annotation")
                .attr("x1", x(new Date("2023-04")))
                .attr("x2", x(new Date("2023-04")))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "red")
                .attr("stroke-width", 2);

            svg.append("text")
                .attr("x", x(new Date("2023-04")) + 5)
                .attr("y", 40)
                .text("Conflict outbreak")
                .style("fill", "red");
        });
});
