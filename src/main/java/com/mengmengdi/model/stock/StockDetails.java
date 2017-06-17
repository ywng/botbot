package com.mengmengdi.model.stock;

import com.google.gson.Gson;
import com.google.gson.JsonElement;

/**
 * Created by ywng on 15/6/2017.
 */
public class StockDetails {

    private StockHolding stockHolding;
    private String name;
    private double price;
    private double priceChange;
    private String desc;

    public StockDetails (StockHolding stockHolding, String name, double price, double priceChange, String desc) {
        this.stockHolding = stockHolding;
        this.name = name;
        this.price = price;
        this.desc = desc;
    }

    public StockHolding getStockHolding() {
        return stockHolding;
    }

    public void setStockHolding(StockHolding stockHolding) {
        this.stockHolding = stockHolding;
    }

    public String getName () {
        return name;
    }

    public void setName (String name) {
        this.name = name;
    }

    public double getPrice () {
        return price;
    }

    public void setPrice (double price) {
        this.price = price;
    }

    public double getPriceChange () {
        return priceChange;
    }

    public void setPriceChange (double priceChange) {
        this.priceChange = priceChange;
    }

    public String getDesc () {
        return desc;
    }

    public void setDesc (String desc) {
        this.desc = desc;
    }

    public double getMktVal () {
        return price * stockHolding.getQuant();
    }

    public String toJson() {
        Gson gson = new Gson();
        JsonElement jsonElement = gson.toJsonTree(this.getClass());
        jsonElement.getAsJsonObject().addProperty("mktVal", getMktVal());
        return gson.toJson(jsonElement);
    }

}
