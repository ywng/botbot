var svg = d3.select('#stock-svg');
var width = svg.property('clientWidth');
var height = +svg.attr('height');
var centerX = width * 0.5;
var centerY = height * 0.5;
var strength = 0.1;
var focusedNode;
var format = d3.format(',d');
var percentChangeFormat = d3.format('+');
var scaleColor = d3.scaleOrdinal(d3.schemeCategory20);

// use pack to calculate radius of the circle
var pack = d3.pack().size([width, height]).padding(1.5);
var forceCollide = d3.forceCollide(d => d.r + 1);

// use the force
var simulation = d3.forceSimulation()
    .force('charge', d3.forceManyBody())
    .force('collide', forceCollide)
    .force('x', d3.forceX(centerX ).strength(strength))
    .force('y', d3.forceY(centerY ).strength(strength));

var root;
var nodes;
var node;

svg.style('background-color', '#eee');
if (localStorage.getItem("stockHoldingsDetails") !== null) {
    stockHoldingsDetails = JSON.parse(localStorage.getItem("stockHoldingsDetails"));
}
simulateSetup();
draw();

// blur
d3.select(document).on('click', () => {
    var target = d3.event.target;
    // check if click on document but not on the circle overlay
    if (!target.closest('#circle-overlay') && focusedNode) {
        focusedNode.fx = null;
        focusedNode.fy = null;
        simulation.alphaTarget(0.2).restart();
        d3.transition().duration(2000).ease(d3.easePolyOut)
            .tween('moveOut', function () {
                console.log('tweenMoveOut', focusedNode);
                var ir = d3.interpolateNumber(focusedNode.r, focusedNode.radius);
                return function (t) {
                    focusedNode.r = ir(t);
                    simulation.force('collide', forceCollide);
                };
            })
            .on('end', () => {
                focusedNode = null;
                simulation.alphaTarget(0);
            })
            .on('interrupt', () => {
                simulation.alphaTarget(0);
            });

        // hide all circle-overlay
        d3.selectAll('.circle-overlay').classed('hidden', true);
        d3.selectAll('.node-icon').classed('node-icon--faded', false);
    }
});

//================= functions ====================================//

function simulateSetup(){
    root = d3.hierarchy({ children: stockHoldingsDetails}).sum(d => d.mktVal);

	// we use pack() to automatically calculate radius conveniently only
	// and get only the leaves
    nodes = pack(root).leaves().map(node => {
    	const data = node.data;
		return {
			x: centerX + (node.x - centerX) * 3, // magnify start position to have transition to center movement
			y: centerY + (node.y - centerY) * 3,
			r: 0, // for tweening
			radius: node.r, //original radius
			id: data.stockHolding.code,
			cat: data.stockHolding.cat,
			name: data.name,
			price: data.price,
            priceChange:data.priceChange,
			quant: data.stockHolding.quant,
			mktVal: data.mktVal
    	};
	});

    simulation.nodes(nodes).on('tick', ticked);
}

function ticked() {
    node.attr('transform', d => `translate(${d.x},${d.y})`)
		.select('circle')
        .attr('r', d => d.r);
}

function draw() {

	node = svg.selectAll('.node')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        .call(d3.drag()
                .on('start', (d) => {
                    if (!d3.event.active) { simulation.alphaTarget(0.2).restart(); }
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (d) => {
                        d.fx = d3.event.x;
                    d.fy = d3.event.y;
                })
                .on('end', (d) => {
                        if (!d3.event.active) { simulation.alphaTarget(0); }
                    d.fx = null;
                    d.fy = null;
                })
        );

    node.append('circle')
        .attr('id', d => d.id)
        .attr('r', 0)
        .style('fill', d => scaleColor(d.cat))
        .transition().duration(2000).ease(d3.easeElasticOut)
        .tween('circleIn', (d) => {
        var i = d3.interpolateNumber(0, d.radius);
        return (t) => {
            d.r = i(t);
            simulation.force('collide', forceCollide);
        };
    });

    node.append('clipPath')
        .attr('id', d => `clip-${d.id}`)
        .append('use')
        .attr('xlink:href', d => `#${d.id}`);

    // display stock name
    node.append('text').classed('node-name', true)
        .attr('id', d => d.id)
        .selectAll('tspan')
        .data(d => d.name.split(';')).enter()
        .append('tspan')
        .attr('x', 0)
        .attr('y', (d, i, nodes) => (13 + (i - nodes.length / 2 - 0.5) * 10))
        .style("fill", "#333333")
        .text(name => name);

    // display stock price
    node.append('text').classed('node-price', true)
        .attr('id', d => d.id)
        .attr('x', 0)
        .attr('y', 20)
        .style("fill", function (d) {
            if (d.priceChange > 0) {
                return "#339966";
            } else if ( d.priceChange < 0){
                return "#990000";
            } else {
                return "#333333";
            }
        })
        .text(function (d) {
            return d.price + "\t\t(" + percentChangeFormat(d.priceChange) + "%)";
        });

    node.append('title')
        .attr('id', d => d.id)
        .text(d => (d.id + ' - ' + d.name +
            '\nQuantity: ' + format(d.quant) +
            '\nPrice: ' + d.price + " (" + percentChangeFormat(d.priceChange) + "%)" +
            '\nMarket Value: ' + format(d.mktVal)));

    var legendOrdinal = d3.legendColor()
        .scale(scaleColor)
        .shape('circle');

    // legend 1
    svg.append('g')
        .classed('legend-color', true)
        .attr('text-anchor', 'start')
        .attr('transform', 'translate(20,30)')
        .style('font-size', '12px')
        .call(legendOrdinal);
    var sizeScale = d3.scaleOrdinal()
        .domain(['smaller marker value', '...', 'larger marker value'])
        .range([3, 7, 11] );
    var legendSize = d3.legendSize()
        .scale(sizeScale)
        .shape('circle')
        .shapePadding(10)
        .labelAlign('end');

    // legend 2
    svg.append('g')
        .classed('legend-size', true)
        .attr('text-anchor', 'start')
        .attr('transform', 'translate(150, 25)')
        .style('font-size', '12px')
        .call(legendSize);

    var infoBox = node.append('foreignObject')
        .classed('circle-overlay hidden', true)
        .attr('x', -350 * 0.5 * 0.8)
        .attr('y', -350 * 0.5 * 0.8)
        .attr('height', 350 * 0.8)
        .attr('width', 350 * 0.8)
        .append('xhtml:div')
        .classed('circle-overlay__inner', true);

    infoBox.append('h2')
        .classed('circle-overlay__title', true)
        .text(d => d.name);

    infoBox.append('p')
        .classed('circle-overlay__body', true)
        .html(d => d.code);


    node.on('click', (currentNode) => {
        d3.event.stopPropagation();
        console.log('currentNode', currentNode);
        var currentTarget = d3.event.currentTarget; // the <g> el

        if (currentNode === focusedNode) {
            // no focusedNode or same focused node is clicked
            return;
        }
        var lastNode = focusedNode;
        focusedNode = currentNode;

        simulation.alphaTarget(0.2).restart();
        // hide all circle-overlay
        d3.selectAll('.circle-overlay').classed('hidden', true);
        d3.selectAll('.node-icon').classed('node-icon--faded', false);

        // don't fix last node to center anymore
        if (lastNode) {
            lastNode.fx = null;
            lastNode.fy = null;
            node.filter((d, i) => i === lastNode.index)
                .transition().duration(2000).ease(d3.easePolyOut)
                .tween('circleOut', () => {
                    var irl = d3.interpolateNumber(lastNode.r, lastNode.radius);
                    return (t) => {
                        lastNode.r = irl(t);
                    };
                })
                .on('interrupt', () => {
                        lastNode.r = lastNode.radius;
                });
        }

        d3.transition().duration(2000).ease(d3.easePolyOut)
            .tween('moveIn', () => {
                console.log('tweenMoveIn', currentNode);
                var ix = d3.interpolateNumber(currentNode.x, centerX);
                var iy = d3.interpolateNumber(currentNode.y, centerY);
                var ir = d3.interpolateNumber(currentNode.r, centerY * 0.5);
                return function (t) {
                    currentNode.fx = ix(t);
                    currentNode.fy = iy(t);
                    currentNode.r = ir(t);
                    simulation.force('collide', forceCollide);
                };
            })
            .on('end', () => {
                    simulation.alphaTarget(0);
                var $currentGroup = d3.select(currentTarget);
                $currentGroup.select('.circle-overlay').classed('hidden', false);
                $currentGroup.select('.node-icon').classed('node-icon--faded', true);

            })
            .on('interrupt', () => {
                    console.log('move interrupt', currentNode);
                currentNode.fx = null;
                currentNode.fy = null;
                simulation.alphaTarget(0);
            });

    });

}

function redraw() {
    console.log("Redrawing svg graph ...");
    simulation.alphaTarget(0.1).restart();

    simulateSetup();
    svg.selectAll('.legend-color').remove();
    svg.selectAll('.legend-size').remove();
    svg.selectAll('.node').remove();
    draw();
}
