package com.orderup.menu.controller;

import com.orderup.menu.model.MenuItem;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MenuController {

    @GetMapping("/menu")
    public List<MenuItem> getMenu() {
        return List.of(
                new MenuItem("pizza", "Margherita Pizza", "Main", 12.99, true, false, false),
                new MenuItem("salad", "Caesar Salad", "Starter", 8.49, false, false, true),
                new MenuItem("cake", "Chocolate Cake", "Dessert", 6.99, true, true, true),
                new MenuItem("cola", "Coca Cola", "Drink", 2.99, true, true, true)
        );
    }
}
