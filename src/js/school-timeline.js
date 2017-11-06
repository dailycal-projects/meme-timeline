const d3 = require('d3');
const allAnnotationData = require('../data/data.json');
const memeData = require('../data/memes.json');
const moment = require('moment');

function drawSchoolTimeline(slug) {
  const width = $(`#${slug}-timeline`).width();

  const isMobile = width < 600;

  const height = 200,
        margin = {top: 30, right: 30, bottom: 40, left: 40};

  const chartWidth = width - margin.left - margin.right,
        chartHeight = height - margin.top - margin.bottom;

  d3.select(`#${slug}-timeline`).html('');

  const svg = d3.select(`#${slug}-timeline`).append('svg')
    .attr('class', 'school-timeline')
      .attr('width', width)
      .attr('height', height)

    let annotationData = allAnnotationData.memes.filter(d => d.slug == slug && d.include == 'yes');

    annotationData = annotationData.map((d) => {
        d.date = moment(d.created_time).toDate();
        //d.date = d3.isoParse(d.created_time);
        d.num_reactions = +d.num_reactions;
        return d;
    });

    let data = memeData.filter(d => d.slug == slug)

    data = data.map((d) => {
      d.date = moment(d.created_time).toDate();
        d.num_reactions = +d.num_reactions;
        return d;
    });

    // Only the dates we're considering
    const beginDate = moment('2017-01-01').toDate();
    const endDate = moment('2017-11-01').toDate();
    data = data.filter(d => d.date > beginDate && d.date < endDate);

    // Sort by date
    data = data.sort((a, b) => {
      if (a.date < b.date) {
        return -1;
      } else {
        return 1;
      }
    });

    // define scales
    let x = d3.scaleTime().range([0, chartWidth]);
    x.domain([beginDate, endDate]);

    let y = d3.scaleLinear().range([0, chartHeight]);
    let yMin = d3.min(data.map(d => d.num_reactions));
    let yMax = d3.max(data.map(d => d.num_reactions));
    y.domain([yMax, yMin]);

    data = data.map((d) => {
        d.x = x(d.date);
        return d;
    });

    let chart = svg.append('g')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    chart.append('g')
        .selectAll('.line')
        .data(data)
        .enter().append("line")
        .attr('x1', d => x(d.date))
        .attr('x2', d => x(d.date))
        .attr('y1', chartHeight + 10)
        .attr('y2', d => y(d.num_reactions))
        .attr('class', `meme-line ${slug}`)
        .attr('data-post-id', (d, i) => i);

    let xAxis = d3.axisBottom(x)
        .tickArguments([d3.timeMonth.every(1)])
        .tickFormat(d3.timeFormat('%b'))
        .tickSize(0) 

    chart.append("g")
      .attr("class", "axis axis--x")
      .attr('transform', `translate(0, ${chartHeight + 12})`)
      .call(xAxis);

    chart.append('line')
      .attr('class', 'axis')
      .attr('x1', -10)
      .attr('x2', chartWidth + 10)
      .attr('y1', chartHeight + 10)
      .attr('y2', chartHeight + 10)

    const tickFormatter = (a) => d3.format('.2s')(a).replace('k', 'K');

    let yAxis = d3.axisLeft(y)
        .tickFormat(tickFormatter)
        .ticks(3)

    chart.append("g")
      .attr("class", "axis axis--y")
      .attr('transform', `translate(-10, 0)`)
      .call(yAxis);

    chart.append('text')
      .attr('x', -margin.left)
      .attr('y', -20)
      .attr('class', 'axis axis-label')
      .text('Number of reactions')

    chart.append('g')
      .selectAll('circle')
      .data(annotationData)
      .enter().append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.num_reactions))
      .attr('r', 12)
      .attr('class', `annotation-circle ${slug}`);

    chart.append('g')
      .selectAll('text')
      .data(annotationData)
      .enter().append('text')
      .attr('x', d => x(d.date))
      .attr('y', d => y(d.num_reactions) + 4)
      .text((d, i) => d.index)
      .attr('class', 'annotation-text');

    let bounds = data.map((d, i) => {
      var thisX = x(d.date);
      if (i > 0) {
        var prevX = (x(data[i-1].date) + thisX) / 2;
      } else {
        var prevX = 0;
      }

      if (i < data.length - 1) {
        var nextX = (thisX + x(data[i+1].date)) / 2;
      } else {
        var nextX = chartWidth;
      }

      return {
        x: prevX,
        width: nextX - prevX,
        post_id: i,
        permalink_url: d.permalink_url
      }
    });

    let rects = chart.append('g')
      .attr('class', 'rects')
      .selectAll('.rect')
      .data(bounds)
      .enter().append('rect')
      .attr('class', 'rect')
      .attr('x', d => d.x)
      .attr('y', 0)
      .attr('width', d => d.width)
      .attr('height', chartHeight)

    if (!isMobile) {
    
      rects.on('mouseover', function(d, i) {
          $(`.meme-line.${slug}`).removeClass('active');
          $(`.meme-line.${slug}`)
          .filter(function() {
            return $(this).data("post-id") == d.post_id;
          })
          .addClass('active');
        })
        .on('mouseout', () => $('.meme-line').removeClass('active'))
        .on('mousedown', d => window.open(d.permalink_url));

    }
}

module.exports = drawSchoolTimeline;