package com.orderup.kitchen;

import com.orderup.common.OrderPlaced;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen")
public class KitchenController {

    private final KitchenStore store;

    public KitchenController(KitchenStore store) {
        this.store = store;
    }

    @GetMapping("/orders")
    public List<OrderPlaced> all() {
        return store.getOrders();
    }

    @PostMapping("/orders/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable("id") String id) {
        boolean ok = store.completeOrder(id);
        return ok ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
