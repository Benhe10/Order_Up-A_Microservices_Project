package com.orderup.order;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String ORDERS_QUEUE = "orders.queue";
    public static final String ORDERS_EXCHANGE = "orders.exchange";
    public static final String ORDERS_ROUTING_KEY = "orders.routingkey";

    @Bean public Queue ordersQueue(){ return new Queue(ORDERS_QUEUE, true); }
    @Bean public DirectExchange ordersExchange(){ return new DirectExchange(ORDERS_EXCHANGE); }
    @Bean public Binding ordersBinding(Queue ordersQueue, DirectExchange ordersExchange) {
        return BindingBuilder.bind(ordersQueue).to(ordersExchange).with(ORDERS_ROUTING_KEY);
    }
    @Bean public Jackson2JsonMessageConverter jackson2JsonMessageConverter(){ return new Jackson2JsonMessageConverter(); }
    @Bean public RabbitTemplate rabbitTemplate(ConnectionFactory cf, Jackson2JsonMessageConverter converter){
        RabbitTemplate t = new RabbitTemplate(cf); t.setMessageConverter(converter); return t;
    }
}