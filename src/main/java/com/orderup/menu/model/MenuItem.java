package com.orderup.menu.model;

public class MenuItem {
    private String id;
    private String name;
    private String category; // e.g. starter, main, dessert, drink
    private double price;
    private boolean vegetarian;
    private boolean vegan;
    private boolean glutenFree;

    // Constructors
    public MenuItem() {}
    public MenuItem(String id, String name, String category, double price,
                    boolean vegetarian, boolean vegan, boolean glutenFree) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.vegetarian = vegetarian;
        this.vegan = vegan;
        this.glutenFree = glutenFree;
    }

    // Getters and setters
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
}
