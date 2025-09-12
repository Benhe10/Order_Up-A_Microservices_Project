package com.orderup.kitchen;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kitchen/orders")
public class KitchenController {
    @GetMapping
    public ResponseEntity<?> list(){ return ResponseEntity.ok(OrderListener.listAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id){ var r = OrderListener.get(id); return r==null? ResponseEntity.notFound().build(): ResponseEntity.ok(r); }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable String id){ var r = OrderListener.complete(id); return r==null? ResponseEntity.notFound().build(): ResponseEntity.ok(r); }
}