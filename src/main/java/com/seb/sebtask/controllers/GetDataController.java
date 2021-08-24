package com.seb.sebtask.controllers;

import java.net.URL;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.net.MalformedURLException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GetDataController {
    
    /**
     * getCurrentFxRates from www.lb.lt
     * @param tp rate type
     * @return XML data
     */
    @GetMapping("/getCurrentFxRates")
    public String getCurrentFxRates(@RequestParam String tp){
        String link = "http://www.lb.lt/webservices/FxRates/FxRates.asmx/getCurrentFxRates?tp=" + tp;
        return getXML(link);
    }

    /**
     * getFxRatesForCurrency from www.lb.lt
     * @param ccy currency (ISO 4217)
     * @return FxRate for Currency
     */
    @GetMapping("/getFxRatesForCurrency")
    public String getFxRatesForCurrency(@RequestParam String ccy){
        String tp = "EU";
        String dtFrom = "2015-01-01";
        String dtTo = currentDay();
        String link = "http://www.lb.lt/webservices/FxRates/FxRates.asmx/getFxRatesForCurrency?tp="+tp+"&ccy="+ccy+"&dtFrom="+dtFrom+"&dtTo="+dtTo;
        return getXML(link);
    }

    /**
     * getCurrencyList from www.lb.lt
     * @return list of Currencies (XML)
     */
    @GetMapping("/getCurrencyList")
    public String getCurrencyList() {
        String link = "http://www.lb.lt/webservices/FxRates/FxRates.asmx/getCurrencyList";
        return getXML(link);
    }

    /**
     * Get XML from URL
     * @param link URL
     * @return XML String
     */
    public String getXML(String link) {
        String message = "";
        try {
			URL url = new URL(link);
			URLConnection urlConnection = url.openConnection();
			InputStream is = urlConnection.getInputStream();
			InputStreamReader isr = new InputStreamReader(is);

			int numCharsRead;
			char[] charArray = new char[1024];
			StringBuffer sb = new StringBuffer();
			while ((numCharsRead = isr.read(charArray)) > 0) {
				sb.append(charArray, 0, numCharsRead);
			}
			String result = sb.toString();
            message = result;
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
        return message;
    }

    /**
     * Current day
     * @return String of today ("yyyy-MM-dd")
     */
    public String currentDay() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");  
        LocalDateTime now = LocalDateTime.now();
        return dtf.format(now);
    }
}