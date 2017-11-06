const d3 = require('d3');

// https://gist.github.com/mathewbyrne/1280286
function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const width = 280,
      height = 800,
      margin = {top: 20, right: 80, bottom: 30, left: 30};

const chartWidth = width - margin.left - margin.right,
      chartHeight = height - margin.top - margin.bottom;

const svg = d3.select('#area-chart').append('svg')
    .attr('width', width)
    .attr('height', height)

const schools = [
    'UC Berkeley',
    //'UCSD',
    'Stanford',
    'UCLA',
    'University of Pennsylvania',
    'Yale',
    'USC',
    'Brown',
    //'Duke',
    'Dartmouth',
    //'MIT',
    'Harvard',
    'Boston University',
    //'Princeton',
    'Northwestern',
    'University of Chicago',
    'George Washington University'
]

d3.csv('../data/weekly_counts.csv', (error, data) => {

    const dateParser = d3.timeParse('%Y-%m-%d');
    data = data.map((d) => {
        d.date = dateParser(d.date)
        return d;
    });

    const beginDate = new Date('2016-09-01');
    //const endDate = new Date('2017-06-01');

    //data = data.filter(d => d.date > beginDate && d.date < endDate);
    data = data.filter(d => d.date > beginDate);

    // stack data

    let stack = d3.stack()
        .keys(schools)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    let series = stack(data);

    // define scales
    let x = d3.scaleTime().range([0, chartWidth]);
    x.domain(d3.extent(data, d => d.date));

    let y = d3.scaleLinear().range([0, chartHeight]);
    let yMax = series.slice(-1)[0].slice(-1)[0][1];
    y.domain([35000, 0]);

    let chart = svg.append('g')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // gridlines in x axis function
    function make_x_gridlines() {       
        return d3.axisBottom(x)
        .ticks(5)
    }

    // gridlines in y axis function
    function make_y_gridlines() {       
        return d3.axisLeft(y)
        .ticks(5)
    }

    let area = d3.area()
        .x((d, i) => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    chart.append('g')
        .selectAll('.area')
        .data(series)
        .enter().append("path")
        .attr("class", d => `area ${slugify(d.key)}`)
        .attr("d", area);

    // lines
    let line = d3.line()
        .x((d, i) => x(d.data.date))
        .y(d => y(d[1]))

    chart.append('g')
        .selectAll('.line')
        .data(series)
        .enter().append("path")
        .attr("class", d => `line ${slugify(d.key)}`)
        .attr("d", line);

    // school labels
    chart.append('g')
        .selectAll('.school-label')
        .data(series)
        .enter().append('text')
        .attr('class', 'school-label')
        .attr('y', d => y(d.pop()[0]))
        .attr('x', chartWidth)
        .attr('dy', 5)
        .attr('dx', 5)
        //.style('text-anchor', 'end')
        .text(d => d.key)

    let xAxis = d3.axisTop(x)
        .tickArguments([d3.timeMonth.every(2)])
        .tickFormat(d3.timeFormat('%b %Y'))
        .tickSize(0) 

    chart.append("g")
      .attr("class", "axis axis--x")
      .call(xAxis);

    let yAxis = d3.axisLeft(y)
        .tickFormat(d => d/1000 + 'k')

    chart.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

    chart.append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', chartHeight)
        .attr('y2', chartHeight)
        .attr('class','axis')

    chart.append('line')
        .attr('x1', chartWidth)
        .attr('x2', chartWidth)
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('class','axis')
});