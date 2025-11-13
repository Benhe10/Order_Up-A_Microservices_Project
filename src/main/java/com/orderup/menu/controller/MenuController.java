package com.orderup.menu.controller;

import com.orderup.menu.model.MenuItem;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class MenuController {

    // static in-memory menu used by demo
    private static final Map<String, MenuItem> MENU = new ConcurrentHashMap<>();

    static {
        // Starters
        MENU.put("bruschetta", new MenuItem(
                "bruschetta", "Bruschetta", "Starter", 6.50,
                true, false, false,
                Arrays.asList("bread", "tomato", "garlic", "basil"),
                "Grilled bread topped with diced tomato, garlic and basil.",
                null
        ));
        MENU.put("springrolls", new MenuItem(
                "springrolls", "Spring Rolls", "Starter", 7.00,
                true, true, false,
                Arrays.asList("rice paper", "vegetables"),
                "Crispy vegetable spring rolls served with sweet chili dip.",
                null
        ));
        MENU.put("caesarsalad", new MenuItem(
                "caesarsalad", "Caesar Salad", "Starter", 8.50,
                false, false, true,
                Arrays.asList("lettuce", "croutons", "parmesan", "anchovy"),
                "Classic Caesar salad with crunchy croutons and parmesan.",
                null
        ));
        MENU.put("garlicbread", new MenuItem(
                "garlicbread", "Garlic Bread", "Starter", 5.00,
                true, false, false,
                Arrays.asList("bread", "garlic", "butter"),
                "Warm garlic bread, a perfect starter to share.",
                null
        ));

        // Mains
        MENU.put("margherita", new MenuItem(
                "margherita", "Margherita Pizza", "Main", 12.99,
                true, false, false,
                Arrays.asList("dough", "tomato", "mozzarella", "basil"),
                "Classic pizza with tomato sauce, mozzarella and fresh basil.",
                null
        ));
        MENU.put("spaghetti", new MenuItem(
                "spaghetti", "Spaghetti Bolognese", "Main", 13.50,
                false, false, false,
                Arrays.asList("spaghetti", "beef", "tomato", "onion"),
                "Homemade Bolognese sauce over al dente spaghetti.",
                null
        ));
        MENU.put("chickenparma", new MenuItem(
                "chickenparma", "Chicken Parmigiana", "Main", 14.90,
                false, false, false,
                Arrays.asList("chicken", "breadcrumbs", "tomato", "cheese"),
                "Breaded chicken breast baked with tomato sauce and cheese.",
                null
        ));
        MENU.put("vegpasta", new MenuItem(
                "vegpasta", "Vegetable Pasta", "Main", 11.00,
                true, true, false,
                Arrays.asList("pasta", "seasonal vegetables", "olive oil"),
                "Pasta with sautéed seasonal vegetables and olive oil.",
                null
        ));

        // Desserts
        MENU.put("chocolatecake", new MenuItem(
                "chocolatecake", "Chocolate Cake", "Dessert", 6.99,
                true, true, true,
                Arrays.asList("chocolate", "flour", "sugar"),
                "Rich chocolate cake served with a scoop of vanilla ice cream.",
                null
        ));
        MENU.put("bananasplit", new MenuItem(
                "bananasplit", "Banana Split", "Dessert", 7.50,
                true, false, false,
                Arrays.asList("banana", "ice cream", "syrup"),
                "Classic banana split with ice cream and toppings.",
                null
        ));
        MENU.put("cheesecake", new MenuItem(
                "cheesecake", "Cheesecake", "Dessert", 6.50,
                true, false, false,
                Arrays.asList("cream cheese", "crust", "sugar"),
                "Creamy cheesecake with a buttery crust.",
                null
        ));
        MENU.put("icecream", new MenuItem(
                "icecream", "Ice Cream Scoop", "Dessert", 3.00,
                true, true, true,
                Arrays.asList("milk", "sugar"),
                "Single scoop of seasonal ice cream.",
                null
        ));

        // Drinks (with options; no ingredient removal allowed for drinks)
        MENU.put("cola", new MenuItem(
                "cola", "Coca Cola", "Drink", 2.99,
                true, false, true,
                Arrays.asList("carbonated water", "sugar", "caramel color"),
                "Carbonated sugary drink.",
                Arrays.asList("Regular", "Diet", "Zero")
        ));
        MENU.put("fanta", new MenuItem(
                "fanta", "Fanta", "Drink", 2.79,
                true, false, true,
                Arrays.asList("carbonated water", "orange flavor"),
                "Orange-flavoured fizzy drink.",
                Arrays.asList("Regular", "Zero")
        ));
        MENU.put("sprite", new MenuItem(
                "sprite", "Sprite", "Drink", 2.79,
                true, false, true,
                Arrays.asList("carbonated water", "lemon-lime flavor"),
                "Clear lemon-lime soda.",
                Arrays.asList("Regular", "Zero")
        ));
        MENU.put("water", new MenuItem(
                "water", "Mineral Water", "Drink", 1.99,
                true, true, true,
                Collections.singletonList("water"),
                "Still mineral water.",
                Arrays.asList("Still", "Sparkling")
        ));
    }

    @GetMapping("/menu")
    public Collection<MenuItem> getMenu() {
        return MENU.values();
    }

    // helper used by OrderController to validate menuIds
    public static boolean contains(String menuId) {
        return MENU.containsKey(String.valueOf(menuId));
    }

    // helper to return a menu item by id (if needed)
    public static MenuItem get(String menuId) {
        return MENU.get(String.valueOf(menuId));
    }
}
