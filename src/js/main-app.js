const d3 = require('d3');
require('./resizer.js');
require('../scss/main.scss');
//require('./area-chart.js');
const drawSchoolTimeline = require('./school-timeline.js');

var target = window.location.hash,
    target = target.replace('#', '');

$(window).on('scroll', () => {
  let positions = [];
  const schoolsTop = $('.schools').position().top;
  
  $('.school').each( function() {
    const id = $(this).data('school');
    const top = $(this).position().top - 150;
    positions.push([top, id]);
  });

  const scrollTop = $(window).scrollTop();
  $(`.schools-nav a`).removeClass('active');
  
  if (scrollTop > schoolsTop) {
    $('.schools-nav').addClass('stuck');
    $('.schools-nav-placeholder').removeClass('hidden');

    positions.map((d, i) => {
      const position = d[0];
      const nextPosition = i < positions.length -1 ? positions[i+1][0] : Infinity;

      if (scrollTop > position & scrollTop < nextPosition) {
        const id = d[1];
        
        $(`.schools-nav .${id}`).addClass('active');
      }
    })
  } else {
    $('.schools-nav').removeClass('stuck');
  }
});

$('.schools-nav a').on('click', function() {
  const slug = $(this).data()['school'];
  $('html, body').animate({
    scrollTop: $(`#${slug}`).offset().top
  }, 500);
  location.hash = `#${slug}`;
})

// Draw timelines
const schools = [
  'uc-berkeley',
  'harvard',
  'yale',
  'stanford',
  'university-of-chicago',
  'university-of-pennsylvania',
  'dartmouth',
  'boston-university',
  'ucla',
  'george-washington-university',
  'northwestern'
];

schools.map(d => drawSchoolTimeline(d));

$(window).on('resize', function() {
  schools.map(d => drawSchoolTimeline(d));
});

// you'll be surprised
const $subhead = $('.subhead');
const defaultSubhead = $subhead.html();
const greek = 'As a member of the Greek community and a part of one of these organizations this is highly offensive. Sororities at UC Berkeley make it their goal to give women a place to feel comfortable as well as better the community. Comparing specific houses to characters from a movie about bullying is absurd and beyond inaccurate. Making the claim that sororities are cliques is demeaning the sisterhood and values they are founded on. This is clearly a stab at a community on campus that does nothing but support the rest of the student body.'
let switched = false;

$('.subhead').on('click', function() {
  if (switched) {
    $subhead.html(defaultSubhead);
    switched = false;
  }
  else {
    $subhead.html(greek);
    switched = true;
  }
});