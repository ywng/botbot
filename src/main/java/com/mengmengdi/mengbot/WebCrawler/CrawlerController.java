package com.mengmengdi.mengbot.WebCrawler;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
public class CrawlerController {

    @RequestMapping("/getStockPrice/{sid}")
    public double getStockPrice( @PathVariable("sid") String sid ) {
        double price = 0.0;

        try{
            Document doc = Jsoup.connect("https://xueqiu.com/s/" + sid).get();
            String priceStr = doc.getElementById("currentQuote").select("strong").first().attr("data-current");
            price = Double.parseDouble(priceStr);
        } catch (Exception e){

        }

        return price;
    }

}