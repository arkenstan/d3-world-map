const width = d3
	.select('.world-map-wrapper')
	.node()
	.getBoundingClientRect().width;
const height = d3
	.select('.world-map-wrapper')
	.node()
	.getBoundingClientRect().height;

const center = [width / 2, height / 2];
const pinWidth = 20;
const pinHeight = 30;

let projection = d3.geoMercator().center([0, 10]);

const pinPath =
	'M8.075 23.516C1.265 13.642 0 12.629 0 9a9 9 0 1118 0c0 3.629-1.264 4.642-8.075 14.516a1.126 1.126 0 01-1.85 0zM9 12.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z';

let svg = d3
	.select('.world-map-wrapper')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

let path = d3.geoPath().projection(projection);
let g = svg.append('g');
let mapPins = null;

d3.json('./world-1102.json').then(function(topology) {
	console.log('Here', topojson.feature(topology, topology.objects.countries).features);

	g.selectAll('.map-path')
		.data(topojson.feature(topology, topology.objects.countries).features)
		.enter()
		.append('path')
		.attr('class', 'map-path')
		.style('stroke-width', 0)
		.style('fill', 'yellow')
		.attr('d', path);

	d3.csv('cities.csv').then(function(cities) {
		mapPins = g
			.selectAll('.map-pin')
			.data(cities)
			.enter()
			.append('g');
		mapPins
			.attr('class', '.map-pin')
			.attr('width', pinWidth)
			.attr('height', pinHeight)
			.attr('transform', function(d) {
				let projected = projection([d.lon, d.lat]);
				projected[0] = parseFloat(projected[0] - pinWidth / 2);
				projected[1] -= pinHeight;
				return `translate( ${projected.join(',')} ) scale(1)`;
			})
			.on('mouseover', function(d) {
				console.log(d.city);
			})
			.style('display', function(d) {
				if (d.city === 'DELHI') {
					return 'none';
				} else {
					return 'block';
				}
			})
			.append('path')
			.attr('d', pinPath)
			.style('fill', 'red');
		// .attr('cx', function(d) {
		// 	return projection([d.lon, d.lat])[0];
		// })
		// .attr('cy', function(d) {
		// 	return projection([d.lon, d.lat])[1];
		// })
		// .attr('r', 5)
	});
});

let zoomController = d3
	.zoom()
	.scaleExtent([1, 8])
	.on('zoom', function() {
		console.log('ZOOM', d3.event.transform.k);
		g.attr('transform', d3.event.transform);
		g.selectAll('.map-path').attr('d', path.projection(projection));
		mapPins.style('display', function(d) {
			let { k } = d3.event.transform;
			if (k > 2) {
				return d.city == 'DELHI' ? 'block' : 'none';
			} else {
				return d.city == 'DELHI' ? 'none' : 'block';
			}
		});
		// .attr('transform', function(d) {
		// 	console.log('d', d);
		// 	const { x, y, k } = d3.event.transform;
		// 	const xTent = parseFloat(x - pinWidth / 2);
		// 	const yTent = y - pinHeight;

		// 	return `translate(${xTent},${yTent}) scale(${k})`;
		// });
	});

svg.call(zoomController);
