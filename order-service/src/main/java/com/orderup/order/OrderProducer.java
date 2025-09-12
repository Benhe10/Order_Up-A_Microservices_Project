package com.orderup.order;

import com.orderup.common.OrderPlaced;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderProducer {
    private final RabbitTemplate rabbitTemplate;
    public OrderProducer(RabbitTemplate rabbitTemplate){ this.rabbitTemplate = rabbitTemplate; }
    public void publish(OrderPlaced order){ rabbitTemplate.convertAndSend(RabbitConfig.ORDERS_EXCHANGE, RabbitConfig.ORDERS_ROUTING_KEY, order); }
}