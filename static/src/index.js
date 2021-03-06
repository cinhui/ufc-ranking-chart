const height = 600;
const width = 960;

const tickDuration  = 700;
const delayDuration = 1000;

let sequenceArray = [];

// const weightclass passed in from html

const title1 = "HISTORY OF UFC";
title2 = weightclass;
const title3 = "RANKINGS";
const subTitle = "February 2013-present";

if (weightclass == "lightheavyweight"){
   title2 = "light heavyweight"
}

const svg = d3.select("#bar-chart").append("svg")
   .attr("width", width)
   .attr("height", height);

const margin = {
   top: 80,
   right: 50,
   bottom: 80,
   left: 0
};

const barPadding = 0;
const bar_offset = 3;
const max_value = 11;
const shift_y = 85;

// Add title
svg.append('text')
   .attr('class', 'title')
   .attr('x', 45)
   .attr('y', shift_y)
   .html(title1);
svg.append('text')
   .attr('class', 'title')
   .attr('x', 45)
   .attr('y', 40+shift_y)
   .html(title2);
svg.append('text')
   .attr('class', 'title')
   .attr('x', 45)
   .attr('y', 80+shift_y)
   .html(title3);

// Add subtitle
svg.append("text")
   .attr("class", "subTitle")
   .attr('x', 45)
   .attr("y", 110+shift_y)
   .html(subTitle);

// Add color legend
const rect_size = 15
const rect_offset = 25
const from_top = 200;

// Add subscript caption
svg.append("text")
   .attr("class", "caption")
   .attr("x", 45)
   // .attr('y', height-20)
   .attr('y', from_top+4*rect_offset+23)
   .html("Sources: https://www.kaggle.com/martj42/ufc-rankings/data");
svg.append("text")
   .attr("class", "caption")
   .attr("x", 45+42)
   // .attr('y', height-5)
   .attr('y', from_top+4*rect_offset+23+15)
   .html("http://mma-stats.com/rankings/");

svg.append("text")
   .attr("class", "caption")
   .attr("x", 45)
   .attr('y', from_top+4*rect_offset+8)
   .html("Status as of Sept 28, 2020");
   // .html("Status as of June 29, 2020");
   // .html("Status as of March 14, 2020");

svg.append("rect")
   .attr("x",50).attr("y", from_top+rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#f0a500");
svg.append("text")
   .attr("class", "legend")
   .attr("x",75).attr("y", from_top+rect_offset+10)
   .attr("alignment-baseline","middle")
   .text("UFC Roster");
svg.append("rect")
   .attr("x",50).attr("y", from_top+2*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#c1a57b");
svg.append("text")
   .attr("class", "legend")
   .attr("x",75).attr("y", from_top+2*rect_offset+10)
   .attr("alignment-baseline","middle")
   .text("Fighting Outside of UFC");
svg.append("rect")
   .attr("x",50).attr("y", from_top+3*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#dbdbdb");
svg.append("text")
   .attr("class", "legend")   
   .attr("x",75).attr("y", from_top+3*rect_offset+10)
   .attr("alignment-baseline","middle")
   .text("Inactive/Retired");

Promise.all([
   d3.csv("sequence.csv"),
   d3.csv(weightclass+"-rankings.csv"),
   d3.json("https://raw.githubusercontent.com/cinhui/ufc-ranking-chart/master/"+weightclass+"-fighters.json"),
   ])
   .then(function(data) {
      data[0].forEach(d => {
         sequenceArray.push(d.date_formatted)
      })

      const sequenceStart     = 0;
      const sequenceEnd       = sequenceArray.length;
      let sequence = sequenceStart;

      // console.log(sequenceStart)
      // console.log(sequenceEnd)
   
      let fighters = {};
      data[2].forEach( d => {
         fighters[d.fighter] = d.bar_color
      });

      // console.log(fighters)

      // Assign colors to each 
      data[1].forEach( d => {
         // d.color = d3.hsl("Cyan");
         // d.color = d3.hsl(Math.random()*360,1,0.5);
         d.color = fighters[d["fighter"]]
      });

      let lastValues = {};
   
      function computeDataSlice(){
         const values = {};
   
         const ret = [];
         data[1].forEach( d => {
            const name = d["fighter"];
            const txt  = d[sequence];
            let val  = 0;
            val = parseFloat(txt);
            val = Math.round(val);
   
            let lastValue = lastValues[ name ];
            if( lastValue == null )
               lastValue = 0;
   
            ret.push({
                  name     : name,
                  color   : d.color,
                  value    : val,
                  lastValue: lastValue
            });
            
         //    console.log(val)
            values[name] = val;
         });
         
         lastValues = values;
   
         return ret.sort((a,b) => b.value - a.value).slice(0, max_value);
      }
   
      let sequenceValue = computeDataSlice();
      sequenceValue.forEach((d,i) => d.rank = i);
   
      // console.log(sequenceValue)
   
      // Format axes
      let x = d3.scaleLinear()
         .domain([0, 10])
         .range([margin.left, width-margin.right+20]);
   
      let y = d3.scaleLinear()
         .domain([max_value, 0])
         .range([height-margin.bottom, margin.top]);

      svg.selectAll('rect.bar')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('rect')
         .attr('class', 'bar')
         .attr('x', x(6)+1)
         // .attr('y', d => y(d.rank)+5)
         .attr('y', d => y(d.rank)+35)
         .attr('width', d => x(d.lastValue)-x(0))
         .attr('height', y(1)-y(0)-barPadding)
         .style('fill', d => d.color);
   
      svg.selectAll('text.label')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('text')
         .attr('class', 'label')
         // .attr('x', d => x(d.lastValue)-200)
         // .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13)
         // .attr('x', d => x(9)+1)
         // .attr('y', d => y(max_value+1)+((y(1)-y(0))/2)+38)
         .attr('x', d => x(10)+260)
         .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13)
         .style('text-anchor', 'middle')
         .html(d => d.name);
   
      let dateText = svg.append('text')
         .attr('class', 'dateText')
         // .attr('x', 45)
         // .attr('y', 2*margin.top)
         .attr('x', x(8))
         .attr('y', margin.top+10)
         .style('text-anchor', 'middle');
      
      let rankText = svg.append("g");
      rankText.append('text')
         .attr('class', 'annotate')
         .attr('x', x(5)+75)
         .attr('y', 1.7*margin.top)
         .style('text-anchor', 'end')
         .html("Champion");

      for (i = 1; i < 11; i++) {
         rankText.append('text')
            .attr('class', 'annotate')
            .attr('x', x(5)+45)
            .attr('y', y(i)+((y(1)-y(0))/2)+38)
            .style('text-anchor', 'end')
            .html(i);
      }
   
      d3.selectAll(".annotate").style('visibility', 'hidden');

      let ticker = d3.interval(e => {
   
         dateText.html(sequenceArray[sequence]);
         d3.selectAll(".annotate").style('visibility', 'visible');

         sequenceValue = computeDataSlice();
         sequenceValue.forEach((d,i) => d.rank = i);
         x.domain([0, d3.max(sequenceValue, d => d.value)]); 
   
         const bars = svg.selectAll('.bar').data(sequenceValue, d => d.name);
   
         bars
            .enter()
            .append('rect')
            .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
            // .attr('x', x(6)+45)
            .attr('x', x(7)-33)
            .attr('y', d => y(max_value+1)+50)
            .attr('width', d => x(1.5*bar_offset))
            .attr('height', y(1)-y(0)-barPadding)
            .style('fill', d => d.color)
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank)+35);
   
         bars
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('width', d => x(1.5*bar_offset))
            .attr('y', d => y(d.rank)+35);
   
         bars
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('width', d => x(1.5*bar_offset))
            .attr('x', d => width-margin.right)
            .attr('y', d => y(max_value+1)+5)
            .remove();
   
         const labels = svg.selectAll('.label')
            .data(sequenceValue, d => d.name);
   
         labels
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', x(9)+1)
            // .attr('y', d => y(0))
            .attr('y', d => y(max_value+1)+((y(1)-y(0))/2)+38)
            .style('text-anchor', 'middle')
            .html(d => d.name)    
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+38);
   
   
         labels
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', x(9)+1)
            .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+38);
   
         labels
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => width-margin.right)
            .attr('y', d => y(max_value+1)+5)
            .remove();
   
         sequence++;
         if(sequence> sequenceEnd) ticker.stop();

      }, delayDuration);

}).catch(function(err) {
   // handle error here
   console.log("error")
})


