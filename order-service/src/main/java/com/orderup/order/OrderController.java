package com.orderup.order;

import com.orderup.common.OrderItem;
import com.orderup.common.OrderPlaced;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderProducer producer;
    private final MenuClient menuClient;

    public OrderController(OrderProducer producer, MenuClient menuClient){
        this.producer = producer;
        this.menuClient = menuClient;
    }

    public static class CreateOrderRequest {
        public String userId;
        public List<OrderItem> items;
        public String comment;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderRequest req){
        if(req==null || req.userId==null || req.items==null || req.items.isEmpty())
            return ResponseEntity.badRequest().body("Invalid order");

        Map<String, Map<String,Object>> menuMap = menuClient.getMenuMap();

        for(OrderItem it : req.items){
            if(it.getMenuId()==null || it.getQuantity()<=0)
                return ResponseEntity.badRequest().body("Invalid item");
            if(!menuMap.containsKey(it.getMenuId()))
                return ResponseEntity.badRequest().body("Unknown menuId:"+it.getMenuId());

            // validate removedIngredients if provided
            if(it.getRemovedIngredients()!=null && !it.getRemovedIngredients().isEmpty()){
                Object ingrObj = menuMap.get(it.getMenuId()).get("ingredients");
                if(ingrObj instanceof List<?>){
                    List<?> available = (List<?>) ingrObj;
                    for(String rem : it.getRemovedIngredients()){
                        if(!available.contains(rem)){
                            return ResponseEntity.badRequest().body("Invalid removed ingredient '" + rem + "' for menuId: " + it.getMenuId());
                        }
                    }
                }
            }
        }

        OrderPlaced order = new OrderPlaced(req.userId, req.items, req.comment);
        producer.publish(order);
        return ResponseEntity.status(201).body(order);
    }
}
