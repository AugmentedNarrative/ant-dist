$(document).ready (function () { 
	var conf = {
		data: {
			districts: {
				type: d3.json,
				url: "data/districts.json",
				id: "districts",
				key: "stdin",
				enumerator: "geometries",
			},
			roads: {
				type: d3.json,
				url: "data/roads.json",
				id: "roads",
				key: "stdin",
				enumerator: "geometries"
			}
		},
		prequantifiers: { 
			fio_district: function (district) {
				var d = this.data.fio_nest [district].items ();
				return { 
					data: [
						{"values": this.data.fio_nest [district].items (), "attrs": {"class": "count", "closed": true}},
						{"values": this.data.fio_nest [district].items (), "attrs": {"class": "black"}},
						{"values": this.data.fio_nest [district].items (), "attrs": {"class": "hispanic"}},
						{"values": this.data.fio_nest [district].items (), "attrs": {"class": "white"}},
						{"values": this.data.fio_nest [district].items (), "attrs": {"class": "asian"}},
						{"values": this.data.fio_nest [district].items (), "attrs": {"class": "unknown"}},
						{"values": this.data.fio_nest [district].items (), "attrs": {"class": "native"}},
						{"values": this.data.fio_nest [district].items (), "attrs": {"class": "no_data"}},
					],
					scale: d3.scale.linear ()
						.domain (this.data.fio_nest [district]
								.extent (function (a) { 
										return parseInt (a.values.count.value); 
								})
						)
				}
			},
			categorize: function () {
			}
		},
		quantifiers: {
			maps: {
				categorize: function (e, a) {
					if (e && e.properties.district !== undefined) {
						return {"class": "district district_" + e.properties.district }
					}

				},
				draw_roads: function (e, a) {
					var parse = [
						{"debug": e.properties.name}
					];
					return {"data": {"parse": parse}};
				}
			},
			lines: {
				fio_district: function (week, district, collection, line) {
					var d = week.values [line.attrs ["class"]].value,
						val = collection.scale (d),
						parse = [
							{"control_element": ".week", "element_remove_class": "highlight"},
							{"control_element": ".week_" + week.key, "element_add_class": "highlight"},
							{"control_element": ".fio." + district, "element_remove_class": "visible"},
							{"control_element": ".fio." + district + "." + week.key, "element_add_class": "visible"}
						];
					return {"class": line.attrs ["class"] + " week week_" + week.key, "note": d + " stops", "y": val && val > 0 ? val : collection.scale (0), "data": {"parse": parse }}
				}
			}
		},
		callbacks: {
			initScrolls: function () { 
				this.initScroll ();
			},
			fio_district: function(rows, download_id) {
				var d = new Nestify (rows, ["dist", "date"], ["date", "count", "asian", "black", "hispanic", "middle_eastern", "native", "no_data", "unknown", "white"]).data;
				this.data.fio_nest = d;
				return d.items ();
			},
			fio: function (circle, data, idx, total) {
				var projection = this.charts ["boston"].projection, p = projection ([data.lon, data.lat]);
				var element = d3.select (circle).attr ({
					"cy": p [1], 
					"cx": p [0], 
					"r": 3, 
					"class": "fio "+ data.week + " " + data.dist + " race_" + data.race_id,
				});	
				var parse = [
					{"debug": data.week + " " + data.dist + " " + data.race_id }
				];
				var dt = {
					"control_element": ".week_" + data.week,
					"element_add_class": "highlight",
					"parse": parse,
					"debug": "Hola!"
				}

				for (var d in dt) {
					element.attr ("data-" + d, dt [d] === Object (dt [d]) ? JSON.stringify (dt [d]) : dt [d]);
				}
			},
			cloner: function (element, data, idx, total) { 
				var parse = [
					{"control_element": ".district", "element_remove_class": "highlight"},
					{"control_element": ".district.district_" + data.key, "element_add_class": "highlight"},
					{"control_element": ".fio.visible", "element_remove_class": "visible"},
					{"control_element": ".fio."+data.key, "element_add_class": "visible" },
					{"control_chart": "boston", "zoom_to": ".district_" + data.key, "debug": "will zoom"},
				]
				var dt = {
					"control_chart": "district",
					"quantify": "fio_district",
					"quantifier": "fio_district",
					"quantifier_args": data.key,
					"debug": "scene " + data.key,
					"parse": parse
				},
				attr = {
					"id": "scene_" + data.key
				}, 

				elm = d3.select (element);

				var title = document.createElement ("h3");
				title.innerText = data.key;
				element.appendChild (title);
				
				
				for (var d in dt) {
					elm.attr ("data-" + d, dt [d] === Object (dt [d]) ? JSON.stringify (dt [d]) : dt [d]);
				}
			}
		}
	};
	var a = new Ant (conf);
});
