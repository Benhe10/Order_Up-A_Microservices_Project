package com.orderup.common;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class OrderPlaced {
    private String orderId;
    private String userId;
    private List<OrderItem> items;
    private String comment;
    private Instant createdAt;
    private double total;

    public OrderPlaced() {}

    public OrderPlaced(String userId, List<OrderItem> items, String comment, double total) {
        this.orderId = UUID.randomUUID().toString();
        this.userId = userId;
        this.items = items;
        this.comment = comment;
        this.createdAt = Instant.now();
        this.total = total;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderPlaced)) return false;
        OrderPlaced that = (OrderPlaced) o;
        return Objects.equals(orderId, that.orderId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId);
    }
}
