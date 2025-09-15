package com.orderup.order;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class MenuClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String menuServiceUrl = "http://localhost:8080/menu";

    public boolean isValidMenuId(String menuId) {
        try {
            List<Map<String, Object>> menuItems =
                    Arrays.asList(restTemplate.getForObject(menuServiceUrl, Map[].class));
            return menuItems.stream().anyMatch(item -> item.get("id").equals(menuId));
        } catch (Exception e) {
            return false;
        }
    }
}
