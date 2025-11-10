package com.orderup.kitchen;

import com.orderup.common.OrderPlaced;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderListener {

    private final KitchenStore store;

    public OrderListener(KitchenStore store) {
        this.store = store;
    }

    @RabbitListener(queues = RabbitConfig.ORDERS_QUEUE)
    public void onOrderPlaced(OrderPlaced order) {
        store.addOrder(order);
        System.out.println("Kitchen received order: " + order.getOrderId() + " comment: " + order.getComment());
    }
}
