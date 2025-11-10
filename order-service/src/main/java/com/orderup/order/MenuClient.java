package com.orderup.order;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MenuClient {
    private final RestTemplate rest = new RestTemplate();
    private final String menuUrl = "http://localhost:8080/menu";

    public Map<String, Map<String, Object>> getMenuMap() {
        Map[] items = rest.getForObject(menuUrl, Map[].class);
        if (items == null) return Map.of();
        return Arrays.stream(items)
                .collect(Collectors.toMap(
                        m -> (String) m.get("id"),
                        m -> (Map<String,Object>) m
                ));
    }
}
