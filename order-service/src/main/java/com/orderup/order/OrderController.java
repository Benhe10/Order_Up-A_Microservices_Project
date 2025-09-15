package com.orderup.order;

import com.orderup.common.OrderItem;
import com.orderup.common.OrderPlaced;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderProducer producer;
    private final MenuClient menuClient;

    public OrderController(OrderProducer producer, MenuClient menuClient) {
        this.producer = producer;
        this.menuClient = menuClient;
    }

    public static class CreateOrderRequest {
        public String userId;
        public List<OrderItem> items;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderRequest req) {
        if (req == null || req.userId == null || req.items == null || req.items.isEmpty())
            return ResponseEntity.badRequest().body("Invalid order");

        for (OrderItem it : req.items) {
            if (it.getMenuId() == null || it.getQuantity() <= 0)
                return ResponseEntity.badRequest().body("Invalid item");
            if (!menuClient.isValidMenuId(it.getMenuId()))
                return ResponseEntity.badRequest().body("Unknown menuId:" + it.getMenuId());
        }

        OrderPlaced order = new OrderPlaced(req.userId, req.items);
        producer.publish(order);
        return ResponseEntity.status(201).body(order);
    }
}
