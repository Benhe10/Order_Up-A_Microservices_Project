package com.orderup.kitchen;

import com.orderup.common.OrderItem;
import java.time.Instant;
import java.util.List;

public class KitchenOrder {
    private String orderId;
    private String userId;
    private List<OrderItem> items;
    private String status;
    private Instant createdAt;
    private Instant completedAt;
    private double total;

    public KitchenOrder(){}

    public KitchenOrder(String orderId, String userId, List<OrderItem> items, double total){
        this.orderId = orderId;
        this.userId = userId;
        this.items = items;
        this.status = "PENDING";
        this.createdAt = Instant.now();
        this.total = total;
    }

    public String getOrderId(){ return orderId; }
    public void setOrderId(String orderId){ this.orderId = orderId; }

    public String getUserId(){ return userId; }
    public void setUserId(String userId){ this.userId = userId; }

    public List<OrderItem> getItems(){ return items; }
    public void setItems(List<OrderItem> items){ this.items = items; }

    public String getStatus(){ return status; }
    public void setStatus(String status){ this.status = status; }

    public Instant getCreatedAt(){ return createdAt; }
    public void setCreatedAt(Instant createdAt){ this.createdAt = createdAt; }

    public Instant getCompletedAt(){ return completedAt; }
    public void setCompletedAt(Instant completedAt){ this.completedAt = completedAt; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
}
