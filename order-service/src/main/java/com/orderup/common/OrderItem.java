package com.orderup.common;

import java.util.List;
import java.util.Objects;

public class OrderItem {
    private String menuId;
    private int quantity;
    private List<String> removedIngredients;

    public OrderItem() {}

    public OrderItem(String menuId, int quantity, List<String> removedIngredients) {
        this.menuId = menuId;
        this.quantity = quantity;
        this.removedIngredients = removedIngredients;
    }

    public String getMenuId() { return menuId; }
    public void setMenuId(String menuId) { this.menuId = menuId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public List<String> getRemovedIngredients() { return removedIngredients; }
    public void setRemovedIngredients(List<String> removedIngredients) { this.removedIngredients = removedIngredients; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderItem)) return false;
        OrderItem that = (OrderItem) o;
        return quantity == that.quantity &&
                Objects.equals(menuId, that.menuId) &&
                Objects.equals(removedIngredients, that.removedIngredients);
    }

    @Override
    public int hashCode() {
        return Objects.hash(menuId, quantity, removedIngredients);
    }
}
