package com.mengmengdi.mengbot.WebCrawler;

import com.mengmengdi.model.stock.StockDetails;
import com.mengmengdi.model.stock.StockHolding;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class StockCrawlerController extends AbstractCrawlerController {

    @RequestMapping("/getStockPrice/{code}")
    public double getStockPrice( @PathVariable("code") String code) {
        StockHolding stock = new StockHolding();
        stock.setCode(code);
        return getStockDetailsXuQiu(stock).getPrice();
    }

    @RequestMapping(value = "/getStockPrice", method = RequestMethod.POST)
    public List<StockDetails> getStockPrice(@RequestBody List<StockHolding> stockHoldingList) {
        List<StockDetails> stockHoldingListWithDetails = new ArrayList<StockDetails>();
        for (StockHolding stock: stockHoldingList) {
            StockDetails stockWithDetails = getStockDetailsXuQiu(stock);
            stockHoldingListWithDetails.add(stockWithDetails);
        }

        return stockHoldingListWithDetails;
    }

    private StockDetails getStockDetailsXuQiu(StockHolding stock) {
        StockDetails stockWithDetails = new StockDetails(stock, "To be fetching", 0.0, 0.0, "To be fetching ...");

        try{
            Document doc = Jsoup.connect("https://xueqiu.com/s/" +  stock.getCode()).get();

            String nameStr = doc.getElementsByClass("stockName").first().child(0).text();
            stockWithDetails.setName(nameStr.substring(0,nameStr.indexOf("(")));

            String priceStr = doc.getElementById("currentQuote").select("strong").first().attr("data-current");
            stockWithDetails.setPrice(Double.parseDouble(priceStr));

            String priceChangeStr = doc.getElementById("currentQuote").getElementsByClass("quote-percentage").first().text();
            stockWithDetails.setPriceChange(Double.parseDouble(priceChangeStr.replaceAll("[^\\d.-]","")));

            String descStr = doc.getElementsByClass("stock-company").first().child(2).text();
            stockWithDetails.setDesc(descStr);

        } catch (Exception e){

        }

        return stockWithDetails;
    }

}