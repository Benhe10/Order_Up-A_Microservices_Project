package com.orderup.order;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
public class MenuController {
    private static final Map<String, Map<String,Object>> MENU = new LinkedHashMap<>();

    static {
        MENU.put("burger", Map.of("id","burger","name","Classic Burger","category","Main","price",9.5,"vegetarian",false));
        MENU.put("vegburger", Map.of("id","vegburger","name","Veggie Burger","category","Main","price",8.5,"vegetarian",true));
        MENU.put("fries", Map.of("id","fries","name","French Fries","category","Side","price",3.0,"vegetarian",true));
        MENU.put("cola", Map.of("id","cola","name","Cola","category","Drink","price",2.5,"vegetarian",true));
        MENU.put("icecream", Map.of("id","icecream","name","Ice Cream","category","Dessert","price",2.5,"vegetarian",true));
    }

    @GetMapping("/api/menu")
    public Collection<Map<String,Object>> list() { return MENU.values(); }

    public static boolean contains(String id){ return MENU.containsKey(id); }
}