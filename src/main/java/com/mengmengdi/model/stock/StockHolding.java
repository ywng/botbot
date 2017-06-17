package com.mengmengdi.model.stock;

import com.google.gson.Gson;

/**
 * Created by ywng on 15/6/2017.
 */
public class StockHolding {
    private String cat;
    private String code;
    private int quant;


    public String getCat () {
        return cat;
    }

    public void setCat (String cat) {
        this.cat = cat;
    }

    public String getCode () {
        return code;
    }

    public void setCode (String code) {
        this.code = code;
    }

    public int getQuant () {
        return quant;
    }

    public void setQuant (int quant) {
        this.quant = quant;
    }

    public String toJson() {
        Gson gson = new Gson();
        return gson.toJson(this) ;
    }

}
