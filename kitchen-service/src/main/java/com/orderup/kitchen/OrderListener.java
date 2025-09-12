package com.orderup.kitchen;

import com.orderup.common.OrderPlaced;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrderListener {
    private static final ConcurrentHashMap<String, KitchenOrder> ORDERS = new ConcurrentHashMap<>();

    @RabbitListener(queues = RabbitConfig.ORDERS_QUEUE)
    public void onOrderPlaced(OrderPlaced order){
        if(order==null) return;
        KitchenOrder k = new KitchenOrder(order.getOrderId(), order.getUserId(), order.getItems());
        ORDERS.put(k.getOrderId(), k);
        System.out.println("[KITCHEN] Received order: " + k.getOrderId() + " from " + k.getUserId());
    }

    public static java.util.Collection<KitchenOrder> listAll(){ return ORDERS.values(); }
    public static KitchenOrder get(String id){ return ORDERS.get(id); }
    public static KitchenOrder complete(String id){ KitchenOrder k = ORDERS.get(id); if(k!=null) k.setStatus("DONE"); return k; }
}