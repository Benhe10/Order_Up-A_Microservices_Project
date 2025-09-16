# Order_Up-A_Microservices_Project - Run Instructions

## Services
- **Menu Service** — serves the menu (/menu, port **8080**)  
- **Order Service** — accepts orders and publishes OrderPlaced events to RabbitMQ (/api/orders, port **8081**)  
- **Kitchen Service** — consumes orders from RabbitMQ and provides chef endpoints (/api/kitchen/orders, port **8082**)

---

## Requirements

- **Java 17** (on `PATH`) — verify with `java -version`
- **Maven** (or use the project `mvnw`) — verify with `mvn -v`
- **Docker Desktop** (to run RabbitMQ) — start it before running `docker compose`
- **IntelliJ IDEA** (recommended) — optional; you can use terminal only
- **Postman** (optional) — for testing the APIs

---

## Setup guide

1. Clone the repo in any preferred way, recommended way is to create a new "Project from Version Control" and paste the GitHub repo URL (main branch).
   
2. Build the project using a terminal from the root folder and running a clean install with Maven, like so: `mvn clean install`. This will compile the modules and create the necessary JAR files. At this point it's also nice to ensure that every pom.xml file is recognized as a Maven file, to do this go to the Maven button on the right taskbar in IntelliJ and "Reload All Maven Projects Incrementally".

3. Run Docker Desktop on your computer and make sure that the Engine is running. Now you can run a RabbitMQ container in the background by running this in the terminal: `docker compose up -d`. To check the queues in RabbitMQ visit http://localhost:15672 and login with user: guest pass: guest.

4. Time to run all the services, but there might be a caveat, in testing I ran into problems with the ports the services are using. To ensure the services are using the right pom.xml files you can edit the configurations of the services in the top right of IntelliJ and change the "working directory" to the service folders corresponding to the services. For example MenuServiceApplication uses root folder (because the root is also the menu-service), the OrderApplication uses ../order-service and lastly KitchenApplication uses ../kitchen-service. Now all the services can be run from IntelliJ normally.
It's also possible to run the services with Maven using a terminal, skipping the IntelliJ "working directory" fix. To do this simply use one separate terminal for each of these commands to split the logs of each service:
- Menu-service command: `mvn -f pom.xml spring-boot:run`
- Order-service command: `mvn -f order-service/pom.xml spring-boot:run`
- Kitchen-service: `mvn -f kitchen-service/pom.xml spring-boot:run`
Now every log from every service should be in each of their own terminal for a more simple and better viewing pleasure.

5. Once each service is up and running I've used Postman to test some APIs, beneath I have made some request samples that I used.
- **GET Menu** http://localhost:8080/menu | This fetches the menu, once the request is sent it should be visible in the menu-service logs.
- **POST New Order** http://localhost:8081/api/orders | This request sends an order and should be visible in both the order-service logs and in RabbitMQ, be sure to add a body, example below.
body (JSON):
{
  "userId": "customer1",
  "items": [
   { "menuId": "salad", "quantity": 1 },
    { "menuId": "cola", "quantity": 1 }
  ]
}
- **GET Orders** http://localhost:8082/api/kitchen/orders | This request fetches the orderlist once sent, should be visible in the kitchen-service logs.
- **POST Complete Order** /api/kitchen/orders/(orderId)/complete | This request finishes selected order, be sure to put in the orderId into the request from the order you want to complete. The orderId should be looking something like this: "orderId": "623fe3db-72d4-4627-8a0c-07f538b4eb77".

Hope you enjoyed the demo!
