package com.orderup.common;

import java.util.List;
import java.util.UUID;

public class OrderPlaced {
    private String orderId;
    private String userId;
    private List<OrderItem> items;
    public OrderPlaced() {}
    public OrderPlaced(String userId, List<OrderItem> items) {
        this.orderId = UUID.randomUUID().toString();
        this.userId = userId;
        this.items = items;
    }
    public String getOrderId(){return orderId;} public void setOrderId(String orderId){this.orderId=orderId;}
    public String getUserId(){return userId;} public void setUserId(String userId){this.userId=userId;}
    public List<OrderItem> getItems(){return items;} public void setItems(List<OrderItem> items){this.items=items;}
    @Override public String toString(){ return "OrderPlaced{orderId='"+orderId+"',userId='"+userId+"',items="+items+"}"; }
}