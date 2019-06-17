import * as d3 from "d3";
import {data, svg} from "../config";

const linkWidthScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.links.map((link) => link.weight))])
    .range([0.5, 1.5]);

const linkDashScale = d3
    .scaleOrdinal()
    .domain([0, 2, 3])
    .range(["4 2", "2 2", null]);

export const link = svg
    .selectAll("path.link")
    .data(data.links)
    .enter()
    .append("path")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-dasharray", (d) => linkDashScale(d.weight))
    .attr("stroke-width", (d) => linkWidthScale(d.weight))
    .attr("marker-mid", (d) => {

        switch (d.type) {

        case "SUPERVISORY":
            return "url(#markerArrow)";

        default:
            return "none";

        }

    })
    .attr("fill", "none");

const lineGenerator = d3.line()
    .curve(d3.curveCardinal);

export const animate = () => {

    link.attr("d", (d) => {

        const mid = [
            (d.source.x + d.target.x) / 2,
            (d.source.y + d.target.y) / 2
        ];

        if (d.overlap.length > 0) {

            const index = d.overlap.filter((ol) => ol.weight > d.weight).length;

            const distance = Math.sqrt(
                Math.pow(d.target.x - d.source.x, 2) +
                Math.pow(d.target.y - d.source.y, 2)
            );

            const slopeX = (d.target.x - d.source.x) / distance;
            const slopeY = (d.target.y - d.source.y) / distance;

            const curveSharpness = 3 * index;
            mid[0] += curveSharpness * slopeY;
            mid[1] -= curveSharpness * slopeX;

        }

        return lineGenerator([
            [d.source.x, d.source.y],
            mid,
            [d.target.x, d.target.y]
        ]);

    });

};