package com.orderup.kitchen;

import com.orderup.common.OrderPlaced;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class KitchenStore {
    private final List<OrderPlaced> orders = new ArrayList<>();

    public synchronized void addOrder(OrderPlaced order) {
        // avoid duplicates
        if (orders.stream().noneMatch(o -> o.getOrderId().equals(order.getOrderId()))) {
            orders.add(order);
        }
    }

    public synchronized List<OrderPlaced> getOrders() {
        return new ArrayList<>(orders);
    }

    public synchronized Optional<OrderPlaced> findById(String id) {
        return orders.stream().filter(o -> o.getOrderId().equals(id)).findFirst();
    }

    public synchronized boolean completeOrder(String id) {
        return findById(id).map(o -> {
            orders.remove(o);
            return true;
        }).orElse(false);
    }
}
