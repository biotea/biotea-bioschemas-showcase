/*jslint node: true */
"use strict";

import * as jsonTableConverter from 'json-table-converter';
import * as d3 from 'd3';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import * as d3Cloud from 'd3-cloud';
//import BioteaBioschemasMetadata from 'biotea-bioschemas-metadata';
//import BioteaBioschemasAnnotations from 'biotea-bioschemas-annotations';

class BioteaBioschemasShowcase extends HTMLElement  {    
    constructor() {
        super();
        this._convertedData = {};
        this._data = undefined;
    }

    static get observedAttributes() { 
        return [
            "render", "annpath", "pmcpath", "pmcid"
        ]; 
    }

    get render() {
        return (this.getAttribute("render"));
    }

    get annpath() {
        return (this.getAttribute("annpath"));
    }

    get pmcpath() {
        return (this.getAttribute("pmcpath"));
    }

    get pmcid() {
        return (this.getAttribute("pmcid"));
    }

    set annpath(value) {
        this.setAttribute("annpath", value);
    }

    set pmcpath(value) {
        this.setAttribute("pmcpath", value);
    }

    set pmcid(value) {
        this.setAttribute("pmcid", value);
    }

    parseData() {
        const metadata = this._createMetadata();

        metadata.addEventListener('ready', e => {
            this._createTable(e.detail.data);
            
            const bbannot = this._createAnnotations(e.detail.data.mainEntity["@id"]);
            
            bbannot.addEventListener('ready', bbe => {
                e.detail.data.hasPart = bbe.detail.data;                
                this._createCloud(bbe.detail.data.hasPart);
                if (this.render !== null) {
                    this._renderData(e.detail.data);
                }
                console.log(e.detail.data);                
            });                
        });        
    }

    _createMetadata() {
        const metadata = document.createElement('biotea-bioschemas-metadata');
        metadata.publisher = 'http://biotea.github.io';
        metadata.version = '201903';
        metadata.metadataId = 'http://biotea.github.io/bioschemas?pmc={0}';
        metadata.queryurl = this.pmcpath;
        this.appendChild(metadata);
        return metadata;
    }

    _createTable(data) {
        const table = jsonTableConverter.jsonToTableHtmlString(data);
        const tableDiv = document.createElement('div');
        tableDiv.innerHTML = table;
        this.appendChild(tableDiv);
    }

    _createAnnotations(doi) {
        const bbannot = document.createElement('biotea-bioschemas-annotations');
        bbannot.publisher = "http://biotea.github.io";
        bbannot.version = "201903";
        bbannot.articleid = this.pmcid;
        bbannot.articledoi = doi;
        bbannot.annotator = "http://data.bioontology.org/documentation#nav_annotator";
        bbannot.queryurl = this.annpath;
        this.appendChild(bbannot); 
        return bbannot;
    }

    _createCloud(annot) {
        let self = this;
        let lst = [];
        annot.forEach(el => {
            if (+el.commentCount > 1) {
                lst.push({text: el.text.replace(/ /g, '_'), size: +el.commentCount});
            }            
        });     
        
        this._xScale = scaleLinear()
            .domain([0, d3.max(lst, (d) => d.size)])
            .range([5,25]);

        const xScale = this._xScale;
        
        d3Cloud.default().size([850, 450])
            .timeInterval(20)
            .words(lst)
            .fontSize((d) => xScale(+d.size))
            .text((d) => d.text)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .on("end", self._draw)
            .start()
        ;
    }

    _draw = (words) => {
        /*const color = scaleLinear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"])
        ;*/
        const xScale = this._xScale;
        const color = scaleOrdinal(schemeCategory10)
            .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const width = 820, height = 450;
        return d3.select("biotea-bioschemas-showcase").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "wordcloud")
            .append("g")
            .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", (d) => xScale(d.size) + "px")
            .style("fill", (d, i) => color(i))
            .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
            .text((d) => d.text);
    }

    _renderData(data) {        
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.innerHTML = JSON.stringify(data, null, 2);
        document.body.appendChild(s);        
    }    
}

customElements.define("biotea-bioschemas-showcase", BioteaBioschemasShowcase);