var industryMktValDonutChart;

$(function() {

    Morris.Area({
        element: 'morris-area-chart',
        data: [{
            period: '2010 Q1',
            iphone: 2666,
            ipad: null,
            itouch: 2647
        }, {
            period: '2010 Q2',
            iphone: 2778,
            ipad: 2294,
            itouch: 2441
        }, {
            period: '2010 Q3',
            iphone: 4912,
            ipad: 1969,
            itouch: 2501
        }, {
            period: '2010 Q4',
            iphone: 3767,
            ipad: 3597,
            itouch: 5689
        }, {
            period: '2011 Q1',
            iphone: 6810,
            ipad: 1914,
            itouch: 2293
        }, {
            period: '2011 Q2',
            iphone: 5670,
            ipad: 4293,
            itouch: 1881
        }, {
            period: '2011 Q3',
            iphone: 4820,
            ipad: 3795,
            itouch: 1588
        }, {
            period: '2011 Q4',
            iphone: 15073,
            ipad: 5967,
            itouch: 5175
        }, {
            period: '2012 Q1',
            iphone: 10687,
            ipad: 4460,
            itouch: 2028
        }, {
            period: '2012 Q2',
            iphone: 8432,
            ipad: 5713,
            itouch: 1791
        }],
        xkey: 'period',
        ykeys: ['iphone', 'ipad', 'itouch'],
        labels: ['iPhone', 'iPad', 'iPod Touch'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            y: '2006',
            a: 100,
            b: 90
        }, {
            y: '2007',
            a: 75,
            b: 65
        }, {
            y: '2008',
            a: 50,
            b: 40
        }, {
            y: '2009',
            a: 75,
            b: 65
        }, {
            y: '2010',
            a: 50,
            b: 40
        }, {
            y: '2011',
            a: 75,
            b: 65
        }, {
            y: '2012',
            a: 100,
            b: 90
        }],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Series A', 'Series B'],
        hideHover: 'auto',
        resize: true
    });

    drawIndustryMktValDonutChart();

    setInterval(function() {
        retrievalTask();
        updatePortfolioIndustryMktVal();
        drawIndustryMktValDonutChart();
    }, 60000);//every 1 mins



});

function drawIndustryMktValDonutChart(){
    if (localStorage.getItem("industryMktValDataList") !== null) {
        industryMktValDataList = JSON.parse(localStorage.getItem("industryMktValDataList"));
    } else {
        industryMktValDataList= [{//sample for the chart to load
            label: "Download Sales",
            value: 12
        }, {
            label: "In-Store Sales",
            value: 30
        }, {
            label: "Mail-Order Sales",
            value: 20
        }];
    }

    if(industryMktValDonutChart === undefined) {
        industryMktValDonutChart = Morris.Donut({
            element: 'morris-donut-chart',
            data: industryMktValDataList,
            colors: d3.scaleOrdinal(d3.schemeCategory20).range(),
            formatter: function (y, data) { return 'HK$ ' + y },
            resize: true
        });
    } else {
        industryMktValDonutChart.setData(industryMktValDataList);
    }

}

function retrievalTask() {
    for (var i = 0 ; i < stockHoldings.length; i++){
        $.ajax({
            type: "post",
            url: "/getStockPrice",
            data: "[" + JSON.stringify(stockHoldings[i]) + "]",
            contentType: "application/json",
            success: function(stockDetailsList){
                console.log("Retrieved info for stock: " + stockDetailsList[0].name);
                updateStockData(stockDetailsList[0]);
            }
        });
    }

    console.log("# stock holdings: " + stockHoldings.length);
    console.log("# stock holdings details retrieved: " + stockHoldingsDetails.length);
    if(stockHoldings.length === stockHoldingsDetails.length){
        localStorage.setItem("stockHoldingsDetails", JSON.stringify(stockHoldingsDetails));
    }

}

function updateStockData(stockDetails){
    if (stockDetails.name === "To be fetching"){
        return;
    }
    var found = false;
    for (var i = 0 ; i < stockHoldingsDetails.length; i++) {
        if (stockHoldingsDetails[i].stockHolding.code === stockDetails.stockHolding.code) {
            stockHoldingsDetails[i] = stockDetails;
            found = true;
        }
    }
    if (!found) {
        stockHoldingsDetails[stockHoldingsDetails.length] = stockDetails;
    }
}

function updatePortfolioIndustryMktVal(){
    if (localStorage.getItem("stockHoldingsDetails") !== null) {
        stockHoldingsDetails = JSON.parse(localStorage.getItem("stockHoldingsDetails"));
    } else {
        return; //do nothing
    }

    var industryMktValMap = new Map();
    for (var i=0; i<stockHoldingsDetails.length; i++) {
        var industry = stockHoldingsDetails[i].stockHolding.cat;
        if(industryMktValMap.get(industry) === undefined) {
            industryMktValMap.set(industry, stockHoldingsDetails[i].mktVal);
        } else {
            industryMktValMap.set(industry, stockHoldingsDetails[i].mktVal + industryMktValMap.get(industry));
        }
    }

    var industryMktValDataList = [];
    for (var [key, value] of industryMktValMap.entries()) {
        var industryMktVal = {};
        industryMktVal.label = key;
        industryMktVal.value = mktValFormatK(value);
        industryMktValDataList.push(industryMktVal);
    }
    localStorage.setItem("industryMktValDataList", JSON.stringify(industryMktValDataList));


}

