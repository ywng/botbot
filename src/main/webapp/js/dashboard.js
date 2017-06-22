var industryMktValDonutChart;
var totalMktValLineChart;

var mktValOverTime;
var industryMktValDataList;

$(function() {
    reduceLocalStorageByRemovingOldData();

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
    drawTotalMktValChart();

    setInterval(function() {
        retrievalTask();
        updatePortfolioIndustryMktVal();
        drawIndustryMktValDonutChart();
        drawTotalMktValChart();
    }, 60000);//every 1 mins



});

function drawTotalMktValChart(){
    if (localStorage.getItem("mktValOverTime") !== null) {
        mktValOverTime = JSON.parse(localStorage.getItem("mktValOverTime"));
    } else {
        mktValOverTime= [{ //sample for the chart to load
            time: '2010 Q1',
            totalMktVal: 1000
        }, {
            time: '2010 Q1',
            totalMktVal: 2000
        }, {
            time: '2010 Q1',
            totalMktVal: 3000
        }];
    }

    if(totalMktValLineChart === undefined) {

        totalMktValLineChart =
            Morris.Line({
                element: 'morris-line-chart',
                data: mktValOverTime ,
                xkey: 'time',
                ykeys: ['totalMktVal'],
                labels: ['Market Value'],
                pointSize: 0,
                preUnits: '$',
                hideHover: 'auto',
                resize: true,
                behaveLikeLine: true,
                lineColors:['#8BB3E0']
            });

    } else {
        totalMktValLineChart.setData(mktValOverTime);
    }


}

function drawIndustryMktValDonutChart(){
    if (localStorage.getItem("mktValOverTime") !== null) {
        industryMktValDataList = JSON.parse(localStorage.getItem("industryMktValDataList"));
    } else {
        industryMktValDataList= [{ //sample for the chart to load
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

function updatePortfolioIndustryMktVal(){
    if (localStorage.getItem("stockHoldingsDetails") !== null) {
        stockHoldingsDetails = JSON.parse(localStorage.getItem("stockHoldingsDetails"));
    } else {
        return; //do nothing
    }

    if (localStorage.getItem("mktValOverTime") !== null) {
        mktValOverTime = JSON.parse(localStorage.getItem("mktValOverTime"));
    } else {
        mktValOverTime = [];
    }

    var industryMktValMap = new Map();
    var totalMktVal = 0;
    for (var i=0; i<stockHoldingsDetails.length; i++) {
        var industry = stockHoldingsDetails[i].stockHolding.cat;
        if(industryMktValMap.get(industry) === undefined) {
            industryMktValMap.set(industry, stockHoldingsDetails[i].mktVal);
        } else {
            industryMktValMap.set(industry, stockHoldingsDetails[i].mktVal + industryMktValMap.get(industry));
        }

        totalMktVal = totalMktVal + stockHoldingsDetails[i].mktVal;
    }

    industryMktValDataList = [];
    for (var [key, value] of industryMktValMap.entries()) {
        var industryMktVal = {};
        industryMktVal.label = key;
        industryMktVal.value = mktValFormatK(value);
        industryMktValDataList.push(industryMktVal);
    }

    var mktValEntry = {};
    mktValEntry.time = new Date().toLocaleString();
    mktValEntry.totalMktVal = totalMktVal;
    mktValEntry.industryMktValMap = industryMktValMap;
    mktValOverTime.push(mktValEntry);


    localStorage.setItem("industryMktValDataList", JSON.stringify(industryMktValDataList));
    localStorage.setItem("mktValOverTime", JSON.stringify(mktValOverTime));

}

function retrievalTask() {
    for (var i = 0 ; i < stockHoldings.length; i++){
        $.ajax({
            type: "post",
            url: "/getStockPrice",
            data: "[" + JSON.stringify(stockHoldings[i]) + "]",
            contentType: "application/json",
            success: function(stockDetailsList){
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


