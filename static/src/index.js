const height = 600;
const width = 900;

const tickDuration  = 700;
const delayDuration = 1000;

let sequenceArray = [];

const title = "History of UFC’s Lightweight Rankings";
const subTitle = "2013-present";

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

svg.append('text')
   .attr('class', 'title')
   .attr('y', 45)
   .html(title);

svg.append("text")
   .attr("class", "subTitle")
   .attr("y", 75)
   .html(subTitle);

svg.append("text")
   .attr("class", "caption")
   .attr("x", 10)
   .attr('y', height-20)
   .html("Sources: https://www.kaggle.com/martj42/ufc-rankings/data");
svg.append("text")
   .attr("class", "caption")
   .attr("x", 10+42)
   .attr('y', height-5)
   .html("http://mma-stats.com/rankings/");

Promise.all([
   d3.csv("sequence.csv"),
   d3.csv("lightweight.csv"),
   d3.json("fighters.json"),
   ])
   .then(function(data) {
      data[0].forEach(d => {
         sequenceArray.push(d.date_formatted)
      })

      const sequenceStart     = 1;
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
   
      function _normalizeData(){
         const values = {};
   
         const ret = [];
         data[1].forEach( d => {
            const name = d["fighter"];
            const txt  = d[sequence];
            let val  = 0;
            val = parseFloat(txt);
            val = Math.round(val + bar_offset);
   
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
   
      let sequenceValue = _normalizeData();
      sequenceValue.forEach((d,i) => d.rank = i);
   
      // console.log(sequenceValue)
   
      // Format axes
      let x = d3.scaleLinear()
         .domain([0, d3.max(sequenceValue, d => d.value)])
         .range([margin.left, width-margin.right-65]);
   
      let y = d3.scaleLinear()
         .domain([max_value, 0])
         .range([height-margin.bottom, margin.top]);
   
      let xAxis = d3.axisTop()
         .scale(x)
         .ticks(width > 500 ? 5:2)
         .tickSize(-(height-margin.top-margin.bottom))
         .tickFormat("");

      svg.selectAll('rect.bar')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('rect')
         .attr('class', 'bar')
         .attr('x', x(2*bar_offset)+1)
         // .attr('x', x(bar_offset)+1)
         .attr('width', d => x(d.lastValue)-x(0))
         .attr('y', d => y(d.rank)+5)
         .attr('height', y(1)-y(0)-barPadding)
         .style('fill', d => d.color);
   
      svg.selectAll('text.label')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('text')
         .attr('class', 'label')
         .attr('x', d => x(d.lastValue)-200)
         .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13)
         .style('text-anchor', 'middle')
         .html(d => d.name);
   
      let dateText = svg.append('text')
         .attr('class', 'dateText')
         .attr('x', x(3*bar_offset)+1)
         // .attr('x', width-margin.right)
         .attr('y', margin.top+20)
         .style('text-anchor', 'middle');
      
      let rankText = svg.append("g");
      rankText.append('text')
         .attr('class', 'annotate')
         .attr('x', 6*margin.right)
         // .attr('x', width-(margin.right/2)+5)
         .attr('y', 1.7*margin.top)
         .style('text-anchor', 'end')
         .html("Champion");

      for (i = 1; i < 11; i++) {
         rankText.append('text')
            .attr('class', 'annotate')
            .attr('x', 6*margin.right)
            // .attr('x', width-(margin.right/2)+5)
            .attr('y', y(i)+((y(1)-y(0))/2)+13+25)
            .style('text-anchor', 'end')
            .html(i);
      }
   
      d3.selectAll(".annotate").style('visibility', 'hidden');

      let ticker = d3.interval(e => {
   
         sequenceValue = _normalizeData();
         sequenceValue.forEach((d,i) => d.rank = i);
         x.domain([0, d3.max(sequenceValue, d => d.value)]); 
   
         svg.select('.xAxis')
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .call(xAxis);
   
         const bars = svg.selectAll('.bar').data(sequenceValue, d => d.name);
   
         bars
            .enter()
            .append('rect')
            .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
            .attr('x', x(2*bar_offset)+1)
            .attr('width', d => x(2*bar_offset))
            // .attr('width', d => x(max_value + bar_offset)-x(0))
            // .attr( 'width', d => x(d.value)-x(0))
            .attr('y', d => y(max_value+1)+50)
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
            .attr('width', d => x(2*bar_offset))
            // .attr('width', d => x(max_value + bar_offset)-x(0))
            // .attr('width', d => Math.max(0, x(d.value)-x(0)))
            .attr('y', d => y(d.rank)+35);
   
         bars
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('width', d => x(2*bar_offset))
            // .attr('width', d => x(max_value + bar_offset)-x(0))
            // .attr('width', d => Math.max(0, x(d.value)-x(0)))
            .attr('x', d => width-margin.right)
            .attr('y', d => y(max_value+1)+5)
            .remove();
   
         const labels = svg.selectAll('.label')
            .data(sequenceValue, d => d.name);
   
         labels
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', x(3*bar_offset)+1)
            // .attr('x', d => x(4)-8)
            // .attr('x', d => x(d.value)-8)
            .attr('y', d => y(max_value+1)+((y(1)-y(0))/2)+13+25)
            .style('text-anchor', 'middle')
            .html(d => d.name)    
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13+25);
   
   
         labels
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', x(3*bar_offset)+1)
            // .attr('x', d => x(4)-8)
            // .attr('x', d => x(d.value)-8)
            .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13+25);
   
         labels
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => width-margin.right)
            // .attr('x', d => x(d.value)+8)
            .attr('y', d => y(max_value+1)+5)
            .remove();
   
         dateText.html(sequenceArray[sequence-1]);
         d3.selectAll(".annotate").style('visibility', 'visible');
   
         sequence++;
         if(sequence> sequenceEnd) ticker.stop();

      }, delayDuration);

}).catch(function(err) {
   // handle error here
   console.log("error")
})


