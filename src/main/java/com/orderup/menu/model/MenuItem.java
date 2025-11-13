package com.orderup.menu.model;

import java.util.List;

public class MenuItem {
    private String id;
    private String name;
    private String category;
    private double price;
    private boolean vegetarian;
    private boolean vegan;
    private boolean glutenFree;
    private List<String> ingredients;
    private String description;         // textual description of the item
    private List<String> options;       // optional variants (used for drinks)

    public MenuItem() {}

    public MenuItem(String id, String name, String category, double price,
                    boolean vegetarian, boolean vegan, boolean glutenFree,
                    List<String> ingredients, String description, List<String> options) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.vegetarian = vegetarian;
        this.vegan = vegan;
        this.glutenFree = glutenFree;
        this.ingredients = ingredients;
        this.description = description;
        this.options = options;
    }

    // getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public boolean isVegetarian() { return vegetarian; }
    public void setVegetarian(boolean vegetarian) { this.vegetarian = vegetarian; }

    public boolean isVegan() { return vegan; }
    public void setVegan(boolean vegan) { this.vegan = vegan; }

    public boolean isGlutenFree() { return glutenFree; }
    public void setGlutenFree(boolean glutenFree) { this.glutenFree = glutenFree; }

    public List<String> getIngredients() { return ingredients; }
    public void setIngredients(List<String> ingredients) { this.ingredients = ingredients; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
}
